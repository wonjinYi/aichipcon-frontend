import React, { useState, useRef, useEffect } from "react";
import "./RoiEditor.css";
import { useSelector, useDispatch } from "react-redux";
import {
  addRoiItem,
  removeRoiItem,
  updateRoiItem,
  selectRoiItem,
  unselectRoiItem,
} from "../stores/roiDataSlice.js";

import { updateRoiCanvas } from "../scripts/roiCanvasUtils.js";

function RoiEditor({ videoViewerRef }) {
  const dispatch = useDispatch();

  const editorBodyRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);

  const roiData = useSelector((state) => state.roiData);
  const frameConfig = useSelector((state) => state.frameConfig);

  // -------------------------------------------------------------------
  // load, save, cancel
  // -------------------------------------------------------------------
  const [curRoi, setCurRoi] = useState([]); // deep copied of roiData.data[editIndex]

  useEffect(() => {
    const deepCopied = JSON.parse(
      JSON.stringify(roiData.data[roiData.editIndex].points)
    );
    const withoutClosePoint = deepCopied.slice(0, -1);
    setCurRoi(withoutClosePoint);
    console.log(curRoi);
  }, [roiData.editIndex]);

  function cancel() {
    dispatch(unselectRoiItem());
  }
  function clear() {
    setCurRoi([]);
  }
  function save() {
    if (roiData.editIndex === null) {
      dispatch(addRoiItem(curRoi));
    } else {
      const item = roiData.data[roiData.editIndex];
      const withClosePoint = curRoi.concat([curRoi[0]]);
      dispatch(
        updateRoiItem({
          index: roiData.editIndex,
          item: { ...item, points: withClosePoint },
        })
      );
    }
    dispatch(unselectRoiItem());
  }

  // -------------------------------------------------------------------
  // polygon edit canvas
  // -------------------------------------------------------------------
  const [dragPointIdx, setDragPointIdx] = useState(null);
  const [hoverPointIdx, setHoverPointIdx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pointThreshold, setPointThreshold] = useState(0);

  useEffect(() => {
    if (
      !videoViewerRef ||
      !videoViewerRef.current ||
      !editorBodyRef ||
      !canvasRef ||
      !canvasWrapRef
    )
      return;

    const video = videoViewerRef.current.getVideoElement();
    if (!video) return;

    const editorBody = editorBodyRef.current;
    const canvas = canvasRef.current;
    const canvasWrap = canvasWrapRef.current;

    updateRoiCanvas(editorBody, video, canvas, canvasWrap, curRoi, -1, -1);
    setPointThreshold();
  }, [frameConfig.currentFrame, curRoi, dragPointIdx, hoverPointIdx]);

  function canvasOnRightClick(event) {
    event.preventDefault();
  }
  function canvasOnMouseDown(event) {
    if (event.button !== 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    console.log(curRoi);
    const pointIndex = curRoi.findIndex(
      ([px, py]) => Math.hypot(px - x, py - y) < pointThreshold
    );
    if (pointIndex >= 0) {
      setDragPointIdx(pointIndex);
      setIsDragging(true);
    }
  }

  function canvasOnMouseMove(event) {}

  function canvasOnMouseUp(event) {
    if (!isDragging) {
      if (event.button !== 0 || dragPointIdx !== null || isDragging) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setCurRoi([...curRoi, [x, y]]);
    }
    setDragPointIdx(null);
    setIsDragging(false);
  }

  return (
    curRoi && (
      <div className="roi-editor">
        <div className="header">
          <div className="title">
            {roiData.data[roiData.editIndex].name} 편집
          </div>
          <div
            className="cancel-button button"
            onClick={cancel}
            style={{ marginLeft: "auto" }}
          >
            취소
          </div>
          <div
            className="clear-button button"
            onClick={clear}
            style={{ margin: "0 8px" }}
          >
            모두 지우기
          </div>
          <div className="save-button button" onClick={save}>
            저장
          </div>
        </div>
        <div className="body" ref={editorBodyRef}>
          <div className="canvas-wrap" ref={canvasWrapRef}>
            <canvas
              className="roi-canvas"
              ref={canvasRef}
              onContextMenu={canvasOnRightClick}
              onMouseDown={canvasOnMouseDown}
              onMouseMove={canvasOnMouseMove}
              onMouseUp={canvasOnMouseUp}
            ></canvas>
          </div>
        </div>
      </div>
    )
  );
}

export default RoiEditor;
