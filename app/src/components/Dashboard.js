import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, registerables, ArcElement, Tooltip, Legend } from "chart.js";

import "./Dashboard.css";

import {
  generateClassCountData,
  sumClassCountInRange,
  sliceClassCountInRange,
} from "../scripts/classCountDataUtils.js";
import {
  generateTotalCountChartData,
  generatePerFrameCountChartData,
} from "../scripts/chartUtils.js";

Chart.register(ArcElement, Tooltip, Legend);
Chart.register(...registerables);

function Dashboard() {
  const [classCountData, setClassCountData] = useState(null); // Array

  const [totalCountChartData, setTotalCountChartData] = useState(null); // Object
  const [perFrameCountChartData, setPerFrameCountChartData] = useState(null); // Object

  const frameConfig = useSelector((state) => state.frameConfig);
  const frameData = useSelector((state) => state.frameData);

  // init
  useEffect(() => {
    const _classCountData = generateClassCountData(frameData.filtered);
    setClassCountData(_classCountData);
  }, [frameData.filtered]);

  useEffect(() => {
    if (classCountData) updateChartData();
  }, [classCountData]);

  // update
  useEffect(() => {
    if (frameConfig.status !== "idle" || !classCountData) return;
    updateChartData();
  }, [frameConfig.status]);

  function updateChartData() {
    // 구간 내 모든 프레임의 클래스 카운트 총합 차트 데이터 만들기
    const sum = sumClassCountInRange(classCountData, frameConfig);
    const _totalCountChartData = generateTotalCountChartData(sum);
    setTotalCountChartData(_totalCountChartData);

    // 구간 내 프레임별 클래스 카운트 차트 데이터 만들기
    const { data, startFrame, endFrame } = sliceClassCountInRange(
      classCountData,
      frameConfig
    );
    const _perFrameCountChartData = generatePerFrameCountChartData(
      data,
      startFrame,
      endFrame
    );
    setPerFrameCountChartData(_perFrameCountChartData);
  }

  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "left", // 범례 위치
      },
    },
  };
  const barChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 범례 숨기기
      },
    },
  };
  const stackedBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // 애니메이션 비활성화
    plugins: {
      tooltip: { enabled: false }, // 툴팁 비활성화
    },
    scales: {
      x: {
        stacked: true, // X 축 누적 활성화
      },
      y: {
        stacked: true, // Y 축 누적 활성화
      },
    },
  };

  return (
    <div className="dashboard">
      {/* line-1 (Pie, Bar: 선택된 구간 내의 클래스별 카운트 총합) */}
      {totalCountChartData && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
            height: "40%",
          }}
        >
          <div className="pie-chart chart-wrap">
            <Pie data={totalCountChartData} options={pieChartOptions} />
          </div>
          <div className="bar-chart chart-wrap">
            <Bar data={totalCountChartData} options={barChartOptions} />
          </div>
        </div>
      )}
      {/* line-2 (누적Bar: 선택된 구간 내 프레임별 클래스 카운트 총합) */}
      {perFrameCountChartData && (
        <div style={{ width: "100%", height: "50%" }}>
          <div className="stackbar-chart chart-wrap">
            <Bar
              data={perFrameCountChartData}
              options={stackedBarChartOptions}
            />
          </div>
        </div>
      )}

      {/* 비활성화 오버레이 */}
      {frameConfig.status === "changing" && (
        <div className="disabled-overlay"></div>
      )}
    </div>
  );
}

export default Dashboard;
