from fastapi import FastAPI, WebSocket
import asyncio
from pathlib import Path
import cv2
from ultralytics import YOLO
from pydantic import BaseModel
import json
import torch

# use apple metal performance shader
if torch.backends.mps.is_available:
    torch.backends.mps.enabled = True


class BBox(BaseModel):
    xyxy: list[float]
    cls: int
    conf: float


app = FastAPI()


@app.websocket(
    "/ws",
    # response_model=list[BBox]
)  # TODO: 답 보낼때 추가하는 느낌으로 가능한지 찾아보기...
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    video_path = Path(
        "/Users/hojinjang/coding/hojin/videos/853889-hd_1920_1080_25fps.mp4"
    )
    cap = cv2.VideoCapture(str(video_path))
    model = YOLO("yolov8n.pt")
    frame_idx = 0
    resp = []
    while cap.isOpened():
        frame_idx += 1
        if not frame_idx % 6 == 0:
            continue
        ret, frame = cap.read()
        if not ret:
            break
        frame_results = model(
            # "https://www.youtube.com/watch?v=N6EuuG7zXWY", stream=True
            frame,
            stream=True,
        )
        tmp = []
        for result in frame_results:
            for box in result.boxes:
                bbox = BBox(xyxy=box.xyxy[0], cls=box.cls[0], conf=box.conf[0])
                tmp.append(bbox.model_dump())
        resp.append(tmp)
        await websocket.send_json(resp)
        await asyncio.sleep(1 / 25 * 2)
    cap.release()
    await websocket.close()
