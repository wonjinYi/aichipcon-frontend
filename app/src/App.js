import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { setFilteredFrameData } from "./stores/frameDataSlice.js";

import VideoSelector from "./components/VideoSelector";
import VideoViewer from "./components/VideoViewer";
import CameraViewer from "./components/CameraViewer";
import RoiList from "./components/RoiList";

import Dashboard from "./components/Dashboard";
import RoiEditor from "./components/RoiEditor";
import LoadingOverlay from "./components/LoadingOverlay.js";
import CameraFeed from "./components/CameraFeed.js";

import unionPolygons from "./scripts/unionPolygons.js";
import calculateIou from "./scripts/calculateIou.js";

function App() {
  const dispatch = useDispatch();

  const roiData = useSelector((state) => state.roiData); // user 슬라이스 상태
  const frameData = useSelector((state) => state.frameData);
  const frameConfig = useSelector((state) => state.frameConfig);

  const [inputMode, setInputMode] = useState(null);
  const [cameraIdx, setCameraIdx] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const videoViewerRef = useRef(null);
  const cameraViewerRef = useRef(null);

  useEffect(() => {
    if (!frameData.raw.length) return;
    if (roiData.editIndex !== null) return;
    const { raw } = frameData;

    const unionedPolygon = unionPolygons(roiData.data);
    if (!unionedPolygon) {
      dispatch(setFilteredFrameData(raw));
      return;
    }

    const iouFilteredData = raw.map((boxes) =>
      boxes.filter((box) => calculateIou(box, unionedPolygon) >= 0.5)
    );
    dispatch(setFilteredFrameData(iouFilteredData));
  }, [frameData.raw, roiData]);

  return (
    <div className="app">
      {/* <CameraFeed /> */}
      <div className="left-container">
        <div className="left-top-container">
          {inputMode ? (
            inputMode === "file" ? (
              <VideoViewer videoFile={videoFile} ref={videoViewerRef} />
            ) : (
              <CameraViewer cameraIdx={cameraIdx} ref={cameraViewerRef} />
            )
          ) : (
            <VideoSelector
              setVideoFile={setVideoFile}
              setInputMode={setInputMode}
              setCameraIdx={setCameraIdx}
            />
          )}
        </div>
        <div className="left-bottom-container">
          <RoiList inputMode={inputMode} />
        </div>
      </div>

      {/* right container */}
      <div className="right-container">
        {inputMode ? (
          roiData.editIndex !== null ? (
            <RoiEditor
              videoViewerRef={videoViewerRef}
              cameraViewerRef={cameraViewerRef}
              inputMode={inputMode}
            />
          ) : (
            <Dashboard />
          )
        ) : (
          <div className="no-source">
            <img src="/images/empty.png" alt="no-source" />
            <span>입력 영상이 없습니다</span>
          </div>
        )}
      </div>

      {/* loading overlay */}
      <LoadingOverlay />
    </div>
  );
}

export default App;
