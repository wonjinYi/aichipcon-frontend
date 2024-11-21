import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import './App.css';


import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the components
Chart.register(ArcElement, Tooltip, Legend);

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [frameData, setFrameData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
    formData.append('video', videoFile);

    try {
      // Assume backend URL is '/api/process-video'
      const response = await axios.post('http://localhost:8080/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

    // {"class": c, "confidence": co, "coordinates": xy}
    console.log("Frame data:", frames[frameIndex]);
    frames[frameIndex].forEach((obj) => {
      const classId = obj.class;
      if (objectCounts[classId]) {
        objectCounts[classId] += 1;
      } else {
        objectCounts[classId] = 1;
      }
    });

    console.log("Object counts:", objectCounts);
    const labels = Object.keys(objectCounts).map((classId) => `Class ${classId}`);
    const data = Object.values(objectCounts);
    console.log(data);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Object Count per Class',
          data: data,
          borderWidth: 1,
        },
      ],
    };
    setChartData(chartData);
  };

  const handleSliderChange = (event, newValue) => {
    console.log("Slider value:", newValue);
    setCurrentFrame(newValue);
    generateChartData(frameData, newValue);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Object Detection Visualization</h1>
        <input type="file" onChange={handleFileUpload} />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleProcessVideo} 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Start Processing"}
        </Button>
        {chartData && (
          <div className="chart-container">
            <h2>Frame {currentFrame + 1} Object Count</h2>
            <Pie data={chartData} />
            <div className="navigation-controls">
              <Typography id="frame-slider" gutterBottom>
                Frame Index
              </Typography>
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
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
