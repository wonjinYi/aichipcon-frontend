import React, { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";

import VideoSelector from "./components/VideoSelector";
import VideoViewer from "./components/VideoViewer";
import RoiList from "./components/RoiList";

import Dashboard from "./components/Dashboard";
import RoiEditor from "./components/RoiEditor";
import LoadingOverlay from "./components/LoadingOverlay.js";
import CameraFeed from "./components/CameraFeed.js";

function App() {
  const roiData = useSelector((state) => state.roiData); // user 슬라이스 상태
  const frameData = useSelector((state) => state.frameData);
  const frameConfig = useSelector((state) => state.frameConfig);

  const [videoFile, setVideoFile] = useState(null);

  return (
    <div className="app">
      <CameraFeed />
      <div className="left-container">
        <div className="left-top-container">
          {frameData.length ? (
            <VideoViewer videoFile={videoFile} />
          ) : (
            <VideoSelector setVideoFile={setVideoFile} />
          )}
        </div>
        <div className="left-bottom-container">
          <RoiList />
        </div>
      </div>

      {/* right container */}
      <div className="right-container">
        {frameData.length ? (
          roiData.editIndex !== null ? (
            <RoiEditor />
          ) : (
            <Dashboard />
          )
        ) : (
          <div>입력 영상이 없습니다</div>
        )}
      </div>

      {/* loading overlay */}
      <LoadingOverlay />
    </div>
  );
}

export default App;
