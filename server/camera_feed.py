import cv2
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import torch
import numpy as np


from ultralytics import YOLO

model = YOLO("yolov5s.pt")


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_objects(camera_index: int):
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        cap.release()
        raise ValueError(f"Camera with index {camera_index} cannot be accessed.")

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        frame_idx += 1
        if frame_idx % 3 == 0:
            continue
        # run object detection and draw bboxes
        results = model(frame, device="mps", verbose=False)
        for result in results:
            for box in result.boxes:
                xyxy = box.xyxy.tolist()[0]
                pt1 = xyxy[:2]
                pt2 = xyxy[2:]

                # draw bbox: box.xyxy
                print(pt1, pt2)
                frame = cv2.rectangle(
                    frame,
                    list(map(int, pt1)),
                    list(map(int, pt2)),
                    (0, 255, 0),
                    2,
                )

        # _, jpeg = cv2.imencode(".jpg", annotated_frame)
        _, jpeg = cv2.imencode(".jpg", frame)

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n"
        )


@app.get("/")
def home():
    return {"message": "Edge server with object detection is running"}


@app.get("/video_feed")
def video_feed(camera_index: int = Query(0, description="Index of the camera")):
    try:
        return StreamingResponse(
            detect_objects(camera_index),
            media_type="multipart/x-mixed-replace; boundary=frame",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/list_cameras")
def list_cameras():
    # List all available cameras
    cameras = []
    for i in range(3):
        try:
            cap = cv2.VideoCapture(i)
            if not cap.read()[1]:
                break
            else:
                cameras.append(i)
            cap.release()
        except:
            break

    print(cameras)
    return [0, 1, 2]


# uvicorn main:app --host 0.0.0.0 --port 8000

if __name__ == "__main__":
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("USB Camera", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    cap.release()
    cv2.destroyAllWindows()
