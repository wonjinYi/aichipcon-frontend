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
from pprint import pprint

CONF_THRESHOLD = 0.5
IOU_THRESHOLD = 0.95

import json
yolo2coco_cls = json.loads('{"0": 1, "1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 7, "7": 8, "8": 9, "9": 10, "10": 11, "11": 13, "12": 14, "13": 15, "14": 16, "15": 17, "16": 18, "17": 19, "18": 20, "19": 21, "20": 22, "21": 23, "22": 24, "23": 25, "24": 27, "25": 28, "26": 31, "27": 32, "28": 33, "29": 34, "30": 35, "31": 36, "32": 37, "33": 38, "34": 39, "35": 40, "36": 41, "37": 42, "38": 43, "39": 44, "40": 46, "41": 47, "42": 48, "43": 49, "44": 50, "45": 51, "46": 52, "47": 53, "48": 54, "49": 55, "50": 56, "51": 57, "52": 58, "53": 59, "54": 60, "55": 61, "56": 62, "57": 63, "58": 64, "59": 65, "60": 67, "61": 70, "62": 72, "63": 73, "64": 74, "65": 75, "66": 76, "67": 77, "68": 78, "69": 79, "70": 80, "71": 81, "72": 82, "73": 84, "74": 85, "75": 86, "76": 87, "77": 88, "78": 89, "79": 90}')
# yolo2coco_cls = json.loads('{"1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8, "10": 9, "11": 10, "13": 11, "14": 12, "15": 13, "16": 14, "17": 15, "18": 16, "19": 17, "20": 18, "21": 19, "22": 20, "23": 21, "24": 22, "25": 23, "27": 24, "28": 25, "31": 26, "32": 27, "33": 28, "34": 29, "35": 30, "36": 31, "37": 32, "38": 33, "39": 34, "40": 35, "41": 36, "42": 37, "43": 38, "44": 39, "46": 40, "47": 41, "48": 42, "49": 43, "50": 44, "51": 45, "52": 46, "53": 47, "54": 48, "55": 49, "56": 50, "57": 51, "58": 52, "59": 53, "60": 54, "61": 55, "62": 56, "63": 57, "64": 58, "65": 59, "67": 60, "70": 61, "72": 62, "73": 63, "74": 64, "75": 65, "76": 66, "77": 67, "78": 68, "79": 69, "80": 70, "81": 71, "82": 72, "84": 73, "85": 74, "86": 75, "87": 76, "88": 77, "89": 78, "90": 79}')

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
    cache_dir = Path("~/cococache")
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
        # cv2.imshow(str(img_path), cv2.imread(str(img_path)))
        im_input = cv2.imread(str(img_path)) 
        boxes = model.run_frame(im_input)
        im_h,im_w,_ = im_input.shape
        for box in boxes:
            xywh_normalized = box["xywh"]
            xywh = [
                xywh_normalized[0]*im_w,
                xywh_normalized[1]*im_h,
                xywh_normalized[2]*im_w,
                xywh_normalized[3]*im_h,
            ]
            score = box["conf"]
            cls = yolo2coco_cls[str(box["cls"])]
            category_ids.add(cls)
            # cv2.rectangle(im_input,list(map(int,xyxy[:2])), list(map(int, xyxy[2:])), (255,0,0),4)
            if score > CONF_THRESHOLD:
                results.append(
                    {
                        "image_id": img_id,
                        "category_id": int(cls),
                        "bbox": xywh,
                        "score": float(score),
                    }
                )
        # print(im_input.shape)
    print(">>> categoryids", category_ids)
    return results


# Evaluate metrics
def evaluate_coco(coco_gt, results=[]):
    # with open("results.json", "w") as f:
    #     json.dump(results, f)
    coco_dt = coco_gt.loadRes("results.json")
    print(coco_dt)
    coco_eval = COCOeval(coco_gt, coco_dt, "bbox")

    res = {}
    for cat_id in coco_gt.getCatIds():
        coco_eval.params.catIds = [cat_id]
        # coco_eval.params.iouThrs = [IOU_THRESHOLD]
        coco_eval.evaluate()
        coco_eval.accumulate()
        coco_eval.summarize()
        # cat_name = coco_gt.loadCats([cat_id])["name"]
        res[cat_id] = coco_eval.stats[0]
        print(res)
    pprint(res)


if __name__ == "__main__":

    try:
        from dx_engine import InferenceEngine  # custom onnx runtime

        my_runtime = NPURuntime()
    except ImportError:
        my_runtime = CPURuntime(onnx_model_path="onnx_model_path")


    coco_gt = COCO("./instances_val2017.json")
    results = []
    # results = asyncio.run(generate_detections(my_runtime, coco_gt, (my_runtime.input_width, my_runtime.input_height)))
    evaluate_coco(coco_gt, results)
