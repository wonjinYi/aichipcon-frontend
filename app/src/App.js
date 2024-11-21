import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import './App.css';

function App() {
  const [frameData, setFrameData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      const parsedData = JSON.parse(result);
      setFrameData(parsedData);
      generateChartData(parsedData, 0); // Start with the first frame
    };
    reader.readAsText(file);
  };

  const generateChartData = (frames, frameIndex) => {
    if (!frames || frameIndex >= frames.length || frameIndex < 0) return;

    const objectCounts = {};

    frames[frameIndex].forEach((obj) => {
      const classId = obj.class_id;
      if (objectCounts[classId]) {
        objectCounts[classId] += 1;
      } else {
        objectCounts[classId] = 1;
      }
    });

    const labels = Object.keys(objectCounts).map((classId) => `Class ${classId}`);
    const data = Object.values(objectCounts);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Object Count per Class',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    setChartData(chartData);
  };

  const handleNextFrame = () => {
    if (frameData && currentFrame < frameData.length - 1) {
      const nextFrame = currentFrame + 1;
      setCurrentFrame(nextFrame);
      generateChartData(frameData, nextFrame);
    }
  };

  const handlePreviousFrame = () => {
    if (frameData && currentFrame > 0) {
      const prevFrame = currentFrame - 1;
      setCurrentFrame(prevFrame);
      generateChartData(frameData, prevFrame);
    }
  };
  const handleSliderChange = (event, newValue) => {
    setCurrentFrame(newValue);
    generateChartData(frameData, newValue);
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Object Detection Visualization</h1>
        <input type="file" onChange={handleFileUpload} />
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

            {/* <div className="navigation-controls">
              <button onClick={handlePreviousFrame} disabled={currentFrame === 0}>
                Previous Frame
              </button>
              <button
                onClick={handleNextFrame}
                disabled={frameData && currentFrame === frameData.length - 1}
              >
                Next Frame
              </button>
            </div> */}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
