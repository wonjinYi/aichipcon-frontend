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
function RoiEditor() {
  const dispatch = useDispatch();

  const roiData = useSelector((state) => state.roiData);

  const [curRoi, setCurRoi] = useState([]);
  const [idx, setIdx] = useState(null);

  useEffect(() => {
    setCurRoi(roiData.data[roiData.editIndex]);
  }, [roiData.editIndex]);

  function cancel() {
    dispatch(unselectRoiItem());
  }
  function save() {
    if (roiData.editIndex === null) {
      dispatch(addRoiItem(curRoi));
    } else {
      dispatch(updateRoiItem({ index: roiData.editIndex, item: curRoi }));
    }
    dispatch(unselectRoiItem());
  }

  return (
    curRoi && (
      <div className="roi-editor">
        <div className="header">
          <div className="title">{curRoi.name} 편집</div>
          <div className="cancel-button button" onClick={cancel}>
            취소
          </div>
          <div className="save-button button" onClick={save}>
            저장
          </div>
        </div>
        <div className="body">캔버스 영역</div>
      </div>
    )
  );
}

export default RoiEditor;
