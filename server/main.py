from pathlib import Path
import uvicorn
import tempfile
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, Query, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import json
import logging


def get_runtime():
    try:
        from dx_engine import InferenceEngine  # custom onnx runtime

        from .scripts.npu_ver import NPURuntime

        return NPURuntime()
    except ImportError:
        from .scripts.cpu_ver import CPURuntime

        return CPURuntime()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_objects(camera_index: int):
    my_runtime = get_runtime()
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
        boxes = my_runtime.run_frame(frame)
        for box in boxes:
            print(box)
            frame = cv2.rectangle(
                frame,
                (0, 0),
                (100, 100),
                (0, 255, 0),
                2,
            )

        # _, jpeg = cv2.imencode(".jpg", annotated_frame)
        _, jpeg = cv2.imencode(".jpg", frame)

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n"
        )


def run_video(video_path: str):
    cap = cv2.VideoCapture(video_path)
    my_runtime = get_runtime()
    res = []

    frame_i = 0
    # Loop through the video frames
    while cap.isOpened():
        # frame skipping
        frame_i += 1
        if frame_i % 3 != 0:
            continue
        # Read a frame from the video
        success, frame = cap.read()

        if success:
            # logging.info(frame)
            results = my_runtime.run_frame(frame)
            # logging.info(len(results))
            res.append(results)

            # # Visualize the results on the frame
            # annotated_frame = results[0].plot()
            # # Display the annotated frame
            # cv2.imshow("YOLO Inference", annotated_frame)
            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
        else:
            # Break the loop if the end of the video is reached
            break

    # Release the video capture object and close the display window
    cap.release()
    cv2.destroyAllWindows()
    return res


@app.post("/detect")
def upload_video(video: UploadFile = File):
    """
    Upload a video file, save it at specified directory, and return the detected classes and counts.
    """
    video_path = Path().absolute() / "videos" / video.filename
    cache_path = Path().absolute() / "cache" / (str(video.filename) + ".json")
    print(">>>>>>>>>>>>>>>>>>>>>>>>>")
    print(video)
    print(video_path)
    print(cache_path)
    print(">>>>>>>>>>>>>>>>>>>>>>>>>")
    if cache_path.exists():
        return JSONResponse(content=json.load(cache_path.open("r")))
    print(video_path)
    if not video_path.exists():
        video_path.parent.mkdir(parents=True, exist_ok=True)
        print("write start: ", video_path)
        with open(video_path, "wb") as buffer:
            buffer.write(video.file.read())
        print("write done: ", video_path)
    print("loaded: ", video_path)

    # loop through video and detect objects
    ret = []
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    for detected_results in run_video(str(video_path)):
        # print(">>>>>>>>>> detected boxes", detected_results)
        ret.append(detected_results)
    json.dump(ret, cache_path.open("w"))

    fps = get_fps(str(video_path))
    response_content = {"fps": fps, "data": ret}
    json.dump(response_content, cache_path.open("w"))

    return JSONResponse(content=response_content)


@app.get("/video_feed")
def video_feed(camera_index: int = Query(0, description="Index of the camera")):
    try:
        return StreamingResponse(
            detect_objects(camera_index),
            media_type="multipart/x-mixed-replace; boundary=frame",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def get_fps(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    return fps


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
