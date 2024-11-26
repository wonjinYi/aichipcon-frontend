import React from "react";
import { useSelector } from "react-redux";
import "./LoadingOverlay.css";

export default function LoadingOverlay() {
  const loading = useSelector((state) => state.loading);

  return (
    loading && (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    )
  );
}
