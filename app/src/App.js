import React, { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";

import VideoSelector from "./components/VideoSelector";
import VideoViewer from "./components/VideoViewer";
import RoiList from "./components/RoiList";

import Dashboard from "./components/Dashboard";
import RoiEditor from "./components/RoiEditor";

function App() {
  const [roiData, setRoiData] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  return (
    <div className="app">
      <div className="left-container">
        <div className="left-top-container">
          {videoFile ? <VideoViewer /> : <VideoSelector />}
        </div>
        <div className="left-bottom-container">
          <RoiList />
        </div>
      </div>

      {/* right container */}
      <div className="right-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/edit" element={<RoiEditor />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
