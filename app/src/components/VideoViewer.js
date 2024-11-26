import React, { useRef, useState, useEffect } from "react";
import "./VideoViewer.css";

import { useSelector } from "react-redux";

import generateChartData from "../scripts/generateChartData.js";
import {
  drawBoundingBoxes,
  updateCanvasSizeFromVideo,
} from "../scripts/canvasUtils.js";

import RangeSelector from "./RangeSelector.js";

export default function VideoViewer({ videoFile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const frameData = useSelector((state) => state.frameData);
  const frameConfig = useSelector((state) => state.frameConfig);

  const [videoSrc, setVideoSrc] = useState(null);
  const [frameDuration, setFrameDuration] = useState(0);

  useEffect(() => setFrameDuration(1 / frameConfig.fps), [frameData]);
  useEffect(() => {
    // set videoSrc
    setVideoSrc(URL.createObjectURL(videoFile));
    // Canvas size should match the video size
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const callback = () => updateCanvasSizeFromVideo(canvas, video);
    video.addEventListener("loadedmetadata", callback);
    window.addEventListener("resize", callback);
  }, [videoFile]);

  useEffect(() => {
    if (frameData.length === 0) return;

    const curFrame = frameConfig.currentFrame;
    const boxes = frameData[curFrame - 1];

    videoRef.current.currentTime = curFrame * frameDuration;
    drawBoundingBoxes(canvasRef.current, boxes);
  }, [frameConfig.currentFrame]);

  return (
    <div className="video-viewer">
      <div className="video-wrap">
        <video
          ref={videoRef}
          className="video"
          muted
          src={videoSrc || ""}
          controls={false}
        />
        <canvas ref={canvasRef}></canvas>
      </div>
      <div className="controls">
        <RangeSelector min={1} max={frameData.length} />
      </div>
    </div>
  );
}
