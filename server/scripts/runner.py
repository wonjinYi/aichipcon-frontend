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

video_path = Path(
    # "/Users/hojinjang/coding/hojin/videos/"
    "/home/orangepi/hojin_mac/videos",
    # "C_2_2_18_BU_DYB_10-08_11-40-42_CB_RGB_DF1_M2_M2.mp4"
    "853889-hd_1920_1080_25fps.mp4"
)
output_path = video_path.with_name(f"{video_path.stem}_output.mp4")
onnx_model_path = Path("/Users/hojinjang/coding/hojin/inference_server/yolov5su.onnx")


if __name__ == "__main__":

    try:
        from dx_engine import InferenceEngine  # custom onnx runtime

        my_runtime = NPURuntime()
    except ImportError:
        my_runtime = CPURuntime(onnx_model_path=onnx_model_path)

    # video loop
    video_path = "../videos/kickboard.mp4"
    cap = cv2.VideoCapture(str(video_path))
    # save the output video to "output.mp4"
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    fps = cap.get(cv2.CAP_PROP_FPS)
    frameSize = (
        int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
    )
    out = cv2.VideoWriter(str(output_path), fourcc, fps, frameSize)

    start_time = time.time()
    frame_i = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        boxes = my_runtime.run_frame(frame)
        print(f"{frame_i:04}", collections.Counter([x["cls"] for x in boxes]))
        # Draw bounding boxes
        for box in boxes:
            # convert box (my_runtime.input_width, my_runtime.input_height) to frame size
            print(box)
        cv2.imshow("YOLOv5 Object Detection", frame)
        # out.write(frame)

        # Break on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

        frame_i += 1
        # if frame_i > 100: break

    # Release resources
    cap.release()
    out.release()
    cv2.destroyAllWindows()

    total_runtime = time.time() - start_time
    fps = frame_i / total_runtime
    print(">>> frames count:", frame_i)
    print(">>> total runtime:", total_runtime)
    print(">>> fps:", fps)
