import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./CameraViewer.css";

import { useDispatch, useSelector } from "react-redux";
import { pushFrameData } from "../stores/frameDataSlice";
import { setCurrentFrame, setEndFrame } from "../stores/frameConfigSlice";

import generateChartData from "../scripts/chartUtils.js";
import {
  drawBoundingBoxes,
  updateCanvasSizeFromVideo,
} from "../scripts/canvasUtils.js";

import RangeSelector from "./RangeSelector.js";

const CameraViewer = forwardRef(({ cameraIdx }, ref) => {
  const dispatch = useDispatch();

  const imageRef = useRef(null);
  useImperativeHandle(ref, () => ({
    getImageElement: () => imageRef.current,
  }));
  const canvasRef = useRef(null);

  const frameData = useSelector((state) => state.frameData);
  const frameConfig = useSelector((state) => state.frameConfig);

  const [images, setImages] = useState([]);
  const [pause, setPause] = useState(false);
  const pauseRef = useRef(pause);
  useEffect(() => {
    pauseRef.current = pause; // 최신 pause 상태를 유지
  }, [pause]);

  useEffect(() => {
    let ws = new WebSocket(
      `ws://localhost:8080/ws/video_stream?camera_index=${cameraIdx}`
    );
    ws.onmessage = onSocketMessage;

    const canvas = canvasRef.current;
    const video = imageRef.current;

    window.addEventListener("resize", () => {
      updateCanvasSizeFromVideo(canvas, video);
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        setPause((prev) => !prev);
      }
    });

    ws.onclose = function (event) {
      console.log("WebSocket closed:", event);
    };

    ws.onerror = function (error) {
      console.log("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [cameraIdx]);

  function onSocketMessage(event) {
    if (pauseRef.current) return;
    let message = JSON.parse(event.data);

    dispatch(pushFrameData(message.boxes));

    const img = "data:image/jpeg;base64," + message.frame;
    setImages((prev) => [...prev, img]);
  }

  useEffect(() => {
    const rawLen = frameData.raw.length;
    const end = frameConfig.endFrame;
    if (rawLen - end < 2) {
      dispatch(setEndFrame(frameData.raw.length));
    }
  }, [frameData.raw]);

  useEffect(() => {
    if (frameData.filtered.length === 0) return;

    const curFrame = frameConfig.currentFrame;
    const boxes = frameData.filtered[curFrame - 1];
    console.log(curFrame, boxes);
    updateCanvasSizeFromVideo(canvasRef.current, imageRef.current);
    drawBoundingBoxes(canvasRef.current, boxes);
  }, [frameConfig.currentFrame]);

  return (
    <div className="camera-viewer">
      <div className="video-wrap">
        <img
          ref={imageRef}
          className="image"
          src={images[frameConfig.currentFrame - 1]}
        />
        <canvas ref={canvasRef}></canvas>
      </div>
      <div className="controls">
        <RangeSelector min={1} max={frameData.raw.length} />
      </div>
      {pause && <div className="status">데이터 수신 중지</div>}
    </div>
  );
});

export default CameraViewer;
