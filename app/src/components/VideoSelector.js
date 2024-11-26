import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { setFrameData } from "../stores/frameDataSlice";
import { setFps } from "../stores/frameConfigSlice";
import { startLoading, endLoading } from "../stores/loadingSlice";

function VideoSelector({ setVideoFile }) {
  const dispatch = useDispatch();
  const frameData = useSelector((state) => state.frameData);

  function onFileChange(e) {
    const file = e.target.files[0];
    console.log(file);
    setVideoFile(file);
    processVideo(file);
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
      <span className="description-text">비디오를 선택해주세요</span>
      <input className="input-file" type="file" onChange={onFileChange} />
    </div>
  );
}

export default VideoSelector;
