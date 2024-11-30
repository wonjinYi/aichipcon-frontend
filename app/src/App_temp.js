import React, { useState, useRef, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import axios from "axios";
import "./App.css";

import { Chart, registerables, ArcElement, Tooltip, Legend } from "chart.js";
import { Grid2 } from "@mui/material";

// Register the components
Chart.register(ArcElement, Tooltip, Legend);
Chart.register(...registerables);

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [frameData, setFrameData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [roiList, setRoiList] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // ../../server/videos/sample.mp4

  useEffect(() => {
    const defaultFile = new File(
      [],
      "/Users/hojinjang/coding/aichipcon-frontend/server/videos/sample.mp4",
      {
        type: "video/mp4",
      }
    );

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(defaultFile);
    fileInputRef.current.files = dataTransfer.files;

    const event = new Event("change", { bubbles: true });
    fileInputRef.current.dispatchEvent(event);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const handleProcessVideo = async () => {
    if (!videoFile) {
      alert("Please upload a video file first.");
      return;
    }
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("video", videoFile);

    try {
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

      if (response.data) {
        setFrameData(response.data);
        generateChartData(response.data, 0);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      alert("Failed to process video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateChartData = (frames, frameIndex) => {
    if (!frames || frameIndex >= frames.length || frameIndex < 0) return;

    const objectCounts = {};

    frames[frameIndex].forEach((obj) => {
      const classId = obj.class;
      if (objectCounts[classId]) {
        objectCounts[classId] += 1;
      } else {
        objectCounts[classId] = 1;
      }
    });

    const labels = Object.keys(objectCounts).map(
      (classId) => `Class ${classId}`
    );
    const data = Object.values(objectCounts);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Object Count per Class",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
      options: {
        // no animation
        animation: false,
      },
    };
    setChartData(chartData);
  };

  const handleSliderChange = (event, newValue) => {
    setCurrentFrame(newValue);
    generateChartData(frameData, newValue);
    if (videoRef.current) {
      videoRef.current.currentTime = newValue / 3 / 30;
    }
    drawBoundingBoxes(newValue);
  };

  const drawBoundingBoxes = (frame) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    // antialising
    context.imageSmoothingEnabled = true;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Assuming frameData contains bounding box information for each frame
    const boxes = frameData[frame];
    boxes.forEach((box) => {
      let [x, y, w, h] = box.xywh;
      let [sourceW, sourceH] = [canvas.width, canvas.height];
      let boxColor = box.cls === 0 ? "red" : "blue";
      // draw bounding box
      context.strokeStyle = boxColor;
      context.lineWidth = 0.5;
      context.strokeRect(x * sourceW, y * sourceH, w * sourceW, h * sourceH);
      // draw text
      context.fillStyle = boxColor;
      context.font = "5px Noto Sans";
      context.fillText(`${box.cls}//${box.conf}`, x * sourceW, y * sourceH);
    });
  };

  return (
    <div className="App" sytle={{ padding: "5px" }}>
      <h1>Object Detection Visualization</h1>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} />
      <h2>Frame {currentFrame + 1} Object Count</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcessVideo}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Start Processing"}
      </Button>
      {chartData && frameData && (
        <div className="chart-container">
          {/* main container */}
          <Grid2 container>
            {/* right side */}
            <Grid2 item xs={2} style={{ width: "30%" }}>
              <div style={{ position: "relative" }}>
                <video
                  ref={videoRef}
                  className="video"
                  src={videoFile ? URL.createObjectURL(videoFile) : ""}
                  controls={false}
                  style={{ width: "100%", height: "auto" }}
                ></video>
                <canvas
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                ></canvas>
              </div>
              <Slider
                value={currentFrame}
                onChange={handleSliderChange}
                aria-labelledby="frame-slider"
                step={1}
                marks
                min={0}
                max={frameData.length - 1}
                valueLabelDisplay="on"
              />
            </Grid2>
            {/* left side */}
            <Grid2 item xs={10}>
              {/* <canvas id="myChart" width="400" height="400"></canvas> */}
              {/* pie chart */}
              <Pie data={chartData} />
              {/* bar chart */}
              <Bar
                data={chartData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
              <div className="navigation-controls">
                <Typography id="frame-slider" gutterBottom>
                  Frame Index
                </Typography>
              </div>
            </Grid2>
          </Grid2>
        </div>
      )}
    </div>
  );
}

export default App;
