import React, { useState, useRef, useEffect } from "react";
import "./RoiList.css";

import { useSelector, useDispatch } from "react-redux";
import {
  addRoiItem,
  removeRoiItem,
  updateRoiItem,
  selectRoiItem,
  unselectRoiItem,
} from "../stores/roiDataSlice.js";

function RoiList({ videoFile }) {
  const dispatch = useDispatch();
  const roiData = useSelector((state) => state.roiData);

  const addItem = () => {
    const len = roiData.data.length;
    const lastRoiName = len ? roiData.data[len - 1].name : null;
    const lastRoiNameNumbering = lastRoiName
      ? parseInt(lastRoiName.split(" ")[1])
      : 0;

    const newRoi = {
      name: "영역 " + (lastRoiNameNumbering + 1),
      points: [], // [ [x1, y1], [x2, y2], ... ]
    };
    dispatch(addRoiItem(newRoi));
  };
  const removeItem = (index) => {
    dispatch(unselectRoiItem());
    dispatch(removeRoiItem(index));
  };
  const editItem = (index) => {
    if (!videoFile) {
      alert("영상을 먼저 선택해주세요");
      return;
    }
    dispatch(selectRoiItem(index));
  };

  return (
    <div className="roi-list">
      {roiData.data.map((roi, index) => (
        <div
          className={`item ${
            roiData.editIndex === index ? "active" : "inactive"
          }`}
          onClick={(e) => editItem(index)}
          key={index}
        >
          <div className="name">{roi.name}</div>
          <div
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              removeItem(index);
            }}
          >
            <img src="/icons/delete.png" alt="delete" />
          </div>
        </div>
      ))}

      {/* add button */}
      <div className="item add-button" onClick={addItem}>
        <img
          src="/icons/add.png"
          alt="add"
          style={{ width: "24px", height: "24px" }}
        />
      </div>
    </div>
  );
}

export default RoiList;
