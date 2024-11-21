from pathlib import Path
import uvicorn
import tempfile
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import json


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_video(video_path: str, model: YOLO):
    cap = cv2.VideoCapture(video_path)
    res = []

    # Loop through the video frames
    while cap.isOpened():
        # Read a frame from the video
        success, frame = cap.read()

        if success:
            # Run YOLO inference on the frame
            results = model(frame)
            # res.append(results)
            yield results

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
    # yield res


@app.post("/detect")
async def upload_video(video: UploadFile = File):
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
        with open(video_path, "wb") as buffer:
            buffer.write(video.file.read())
        print("write done: ", video_path)
    print("loaded: ", video_path)

    # Load the YOLO model
    yolo = YOLO("yolov5s.pt")

    # loop through video and detect objects
    ret = []
    async for detected_result in run_video(str(video_path), yolo):
        for result in detected_result:
            tmp = []
            for box in result:
                cls = box.boxes.cls.tolist()
                conf = box.boxes.conf.tolist()
                xyxy = box.boxes.xyxy.tolist()
                boxes_organized = [
                    {"class": c, "confidence": co, "coordinates": xy}
                    for c, co, xy in zip(cls, conf, xyxy)
                ]
                tmp.extend(boxes_organized)
            ret.append(tmp)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    json.dump(ret, cache_path.open("w"))
    return JSONResponse(content=ret)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
