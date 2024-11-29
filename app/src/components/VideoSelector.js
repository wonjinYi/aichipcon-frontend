import React, { useState, useRef, useEffect } from "react";
import "./VideoSelector.css";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { setFrameData } from "../stores/frameDataSlice";
import { setFps } from "../stores/frameConfigSlice";
import { startLoading, endLoading } from "../stores/loadingSlice";

function VideoSelector({ setVideoFile, setInputMode, setCameraIdx }) {
  const dispatch = useDispatch();
  const frameData = useSelector((state) => state.frameData);

  const [cameras, setCameras] = useState([]);

  const input = document.createElement("input");
  input.type = "file";
  input.onchange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    setInputMode("file");
    processVideo(file);
  };

  function openExploler(e) {
    input.click();
  }

  function getCameras() {
    if (cameras.length) {
      setCameras([]);
      return;
    }

    axios
      .get(`http://localhost:8080/list_cameras`)
      .then((response) => {
        console.log("Cameras:", response.data);
        setCameras(response.data);
      })
      .catch((error) => {
        console.error("Error fetching cameras:", error);
      });

    console.log("getCameras");
  }
  function selectCamera(camera) {
    console.log("selectCamera idx: ", camera);
    setInputMode("camera");
    setCameraIdx(camera);
  }

  async function processVideo(videoFile) {
    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      dispatch(startLoading());

      // Assume backend URL is '/api/process-video'
      const response = await axios.post(
        "http://localhost:8080/detect",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      if (response.data) {
        dispatch(setFps(response.data.fps));
        dispatch(setFrameData(response.data.data));
        console.log("Frame data:", response.data);
        console.log("frameData store", frameData);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      alert("Failed to process video. Please try again.");
    } finally {
      dispatch(endLoading());
    }
  }

  return (
    <div className="video-selector">
      <span className="description-text">영상을 입력해주세요</span>
      <div className="divider"></div>
      <div className="button" onClick={openExploler}>
        동영상 파일 선택
      </div>
      <div className="divider"></div>
      <div className="button" onClick={getCameras}>
        실시간 카메라 선택
      </div>
      {/* 카메라 목록 */}
      <div className="camera-list">
        {cameras.map((camera) => (
          <div
            className="button camera"
            onClick={(e) => selectCamera(camera)}
            key={camera}
          >
            {camera}번
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoSelector;
