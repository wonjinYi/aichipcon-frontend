import os
import cv2
import numpy as np
import json
import argparse
import collections
import torch
import torchvision
from ultralytics.utils import ops
import torchvision
from pathlib import Path
import logging
import time
from cpu_ver import CPURuntime
from npu_ver import NPURuntime
from pathlib import Path
from tqdm import tqdm
import requests
import asyncio
import aiohttp
from aiofiles import open as aio_open
from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval

CONF_THRESHOLD = 0.5
IOU_THRESHOLD = 0.95

async def save_img(url,img_path):
    # save image to cache
    with open(img_path, "wb") as f:
        f.write(requests.get(url).content)

async def save_img2(session, url, img_path):
    try:
        async with session.get(url) as response:
            if response.status == 200:
                async with aio_open(img_path, "wb") as f:
                    await f.write(await response.read())
                    print(f"success:{img_path}: {response.status}")

    except Exception as e:
        print(f"Error:{url}: {response.status}")



async def generate_detections(model, coco, input_shape):
    results = []
    cache_dir = Path("cococache")
    cache_dir.mkdir(exist_ok=True, parents=True)
    params = []
    for img_id in tqdm(coco.getImgIds(), desc="Processing images"):
        img_info = coco.loadImgs([img_id])[0]
        img_path = cache_dir / img_info["file_name"]
        if not img_path.exists() or not img_path.read_bytes():
            params.append((img_info["coco_url"],img_path))
            continue
    print(len(params))
    async with aiohttp.ClientSession() as session:
        tasks = []
        for a,b in params:
            tasks.append(save_img2(session,a,b))
        await asyncio.gather(*tasks)

    results = []
    def xywhnorm2xyxysrc(xywh_normalized, input_shape):
        x,y,w,h = map(lambda _:int(_*512), xywh_normalized)   
        return [x,y,x+w,y+h]        

    cache_dir_rglob = dict([(int(p.stem), p) for p in cache_dir.rglob("*.jpg")])
    category_ids = set()
    for img_id in tqdm(coco.getImgIds(), desc="Processing images"):
        img_path = cache_dir_rglob[img_id]
        cv2.imshow(str(img_path), cv2.imread(str(img_path)))
        print(img_id, img_path)
        im_input = cv2.imread(str(img_path)) 
        boxes = model.run_frame(cv2.imread(str(img_path)))
        for box in boxes:
            xyxy = xywhnorm2xyxysrc(box["xywh"],(im_input.shape[1],im_input.shape[0]))
            xywh = [xyxy[0],xyxy[1],xyxy[2]-xyxy[0],xyxy[3]-xyxy[1]]
            print(xyxy, img_path, input_shape)
            score = box["conf"]
            cls = box["cls"]
            category_ids.add(cls)
            cv2.rectangle(im_input,list(map(int,xyxy[:2])), list(map(int, xyxy[2:])), (255,0,0),4)
            if score > CONF_THRESHOLD:
                results.append(
                    {
                        "image_id": img_id,
                        "category_id": int(cls),
                        "bbox": xywh,
                        "score": float(score),
                    }
                )

        print(im_input.shape)
        cv2.imshow("out",im_input)
        # cv2.imwrite(f"out2/{img_id}.jpg",im_input)
        exit()
    print(">>> categoryids", category_ids)
    return results


# Evaluate metrics
def evaluate_coco(coco_gt, results=[]):
    with open("results.json", "w") as f:
        json.dump(results, f)
    coco_dt = coco_gt.loadRes("results.json")
    print(coco_dt)
    coco_eval = COCOeval(coco_gt, coco_dt, "bbox")
    # coco_eval.params.iouThrs = [IOU_THRESHOLD]
    coco_eval.evaluate()
    coco_eval.accumulate()
    print(coco_eval.stats)
    coco_eval.summarize()


if __name__ == "__main__":

    try:
        from dx_engine import InferenceEngine  # custom onnx runtime

        my_runtime = NPURuntime()
    except ImportError:
        my_runtime = CPURuntime(onnx_model_path="onnx_model_path")


    coco_gt = COCO("./instances_val2017.json")
    results = []
    results = asyncio.run(generate_detections(my_runtime, coco_gt, (my_runtime.input_width, my_runtime.input_height)))
    evaluate_coco(coco_gt, results)
