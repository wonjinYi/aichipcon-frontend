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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


my_runtime = None
try:
    from dx_engine import InferenceEngine  # custom onnx runtime
    from .scripts.npu_ver import NPURuntime
    my_runtime = NPURuntime()
except ImportError:
    from .scripts.cpu_ver import CPURuntime
    my_runtime = CPURuntime(onnx_model_path=onnx_model_path)


async def run_video(video_path: str):
    cap = cv2.VideoCapture(video_path)
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
            # Run YOLO inference on the frame
            # results = model(frame)
            results = my_runtime.run_frame(frame)
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

    # loop through video and detect objects
    ret = []
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    async for detected_results in run_video(str(video_path)):
        print(">>>>>>>>>> detected boxes", detected_results)
        ret.append(detected_results)
        # for result in detected_results:
        #     tmp = []
        #     for box in result.boxes:
        #         cls = int(box.cls.tolist()[0])
        #         conf = box.conf.tolist()[0]
        #         xywh = box.xywhn.tolist()[0]
        #         tmp.append({"cls": cls, "conf": conf, "xywh": xywh})
        #     ret.append(tmp)
        json.dump(ret, cache_path.open("w"))

    fps = get_fps(str(video_path))
    response_content = {"fps": fps, "data": ret}
    json.dump(response_content, cache_path.open("w"))

    return JSONResponse(content=response_content)

def get_fps(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    return fps

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
