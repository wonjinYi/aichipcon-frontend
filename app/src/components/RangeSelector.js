import React, { useState, useEffect } from "react";
import "./RangeSelector.css";

import { useSelector, useDispatch } from "react-redux";
import {
  setStartFrame,
  setEndFrame,
  setCurrentFrame,
  setFrameConfigStatus,
} from "../stores/frameConfigSlice";

function RangeSelector({ min, max }) {
  const dispatch = useDispatch();
  const frameConfig = useSelector((state) => state.frameConfig);

  useEffect(() => {
    dispatch(setEndFrame(max));
  }, []);

  const handleMouseDown = () => {
    dispatch(setFrameConfigStatus("changing"));
  };
  const handleMouseUp = () => {
    dispatch(setFrameConfigStatus("idle"));
  };
  const handleChange = (targetName, _value) => {
    const value = parseInt(_value);
    if (targetName === "start" && value <= frameConfig.endFrame) {
      dispatch(setStartFrame(value));
    } else if (targetName === "end" && value >= frameConfig.startFrame) {
      dispatch(setEndFrame(value));
    } else if (targetName === "current") {
      dispatch(setCurrentFrame(value));
    }
  };

  return (
    <div className="range-slider-container">
      <div className="range-slider-track">
        <div
          className="range-slider-fill"
          style={{
            left: `${((frameConfig.startFrame - min) / (max - min)) * 100}%`,
            width: `${
              ((frameConfig.endFrame - frameConfig.startFrame) / (max - min)) *
              100
            }%`,
          }}
        ></div>
        <input
          type="range"
          className="range-slider start-frame"
          min={min}
          max={max}
          step={1}
          value={frameConfig.startFrame}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onChange={(e) => handleChange("start", e.target.value)}
        />
        <input
          type="range"
          className="range-slider end-frame"
          min={min}
          max={max}
          step={1}
          value={frameConfig.endFrame}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onChange={(e) => handleChange("end", e.target.value)}
        />
        <input
          type="range"
          className="range-slider current-frame"
          min={min}
          max={max}
          step={1}
          value={frameConfig.currentFrame}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onChange={(e) => handleChange("current", e.target.value)}
        />
      </div>
      <div className="range-values">
        <span>구간 시작: {frameConfig.startFrame}</span>
        <span>선택된 시점: {frameConfig.currentFrame}</span>
        <span>구간 끝: {frameConfig.endFrame}</span>
      </div>
    </div>
  );
}

export default RangeSelector;
