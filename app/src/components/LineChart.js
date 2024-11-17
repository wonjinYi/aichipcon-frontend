import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LineChart = ({ bboxData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!bboxData) return;
    const bboxCountByClassList = bboxData.reduce((acc, cur) => {
      if (!acc[cur.cls]) {
        acc[cur.cls] = 0;
      }
      acc[cur.cls] += 1;
      return acc;
    }
    , {});
    console.log("bboxCountByClassList", bboxCountByClassList);

    const chartConfig = {
      type: "doughnut",
      data: {
        labels: Object.keys(bboxCountByClassList),
        datasets: [
          {
            label: "count",
            data: Object.values(bboxCountByClassList),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          title: {
            display: true,
            text: "Pie chart (by class)",
          },
        },
      },
    };

    const ctx = document.getElementById("objtoclass_doughnut").getContext("2d");
    chartRef.current = new Chart(ctx, chartConfig);

    return () => {
      // chartRef.current.update('none');
      chartRef.current.destroy();
    };
  }, [bboxData]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.data.labels = bboxData.map((row) => row.cls);
    chartRef.current.data.datasets[0].data = bboxData.map((row) => row.conf);
    // chartRef.current.update('none');
  }, [bboxData]);

  return (
    <div style={{ width: "500px" }}>
      <canvas id="objtoclass_doughnut"></canvas>
    </div>
  );
};

export default LineChart;