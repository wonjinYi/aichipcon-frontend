import { CLASS_NAME } from "../constants.js";

/**
 * 구간 내 오브젝트 총합을 보여주는 차트를 위한 데이터를 생성합니다.
 * @param {*} classCountObj
 * @returns
 */
export function generateTotalCountChartData(classCountObj) {
  /* 
    classCountObj = {
      "class name": count,
      "person": 10,
      "car": 20,
      "bus": 5,
      ...
    }
  */
  const labels = Object.keys(classCountObj);
  const data = Object.values(classCountObj);

  return {
    labels: labels.map((className) => `${className}`),
    datasets: [
      {
        label: "개수",
        data: data,
        backgroundColor: labels.map(
          (_, idx) => colorPalette[idx % colorPalette.length]
        ), // 색상 순환
        borderColor: labels.map(
          (_, idx) => colorPalette[idx % colorPalette.length]
        ),
        borderWidth: 1,
      },
    ],
  };
}

export function generatePerFrameCountChartData(
  classCountObjs,
  startFrame,
  endFrame
) {
  /* 
    classCountObjs = [
      {
        "class name": count,
        "person": 10,
        "car": 20,
        "bus": 5,
        ...
      },
      ...
    ]
  */

  // Extract unique class names
  const classNames = Array.from(
    new Set(classCountObjs.flatMap((frame) => Object.keys(frame)))
  );

  // Prepare dataset for each class
  const chartData = {
    labels: classCountObjs.map((_, index) => `${startFrame + index}`), // Frame labels
    datasets: classNames.map((className, index) => ({
      label: className,
      data: classCountObjs.map((frame) => frame[className] || 0), // Use 0 if key is missing
      backgroundColor: colorPalette[index % colorPalette.length],
    })),
  };

  return chartData;
}

const colorPalette = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#E7E9ED",
  "#00A5CF",
  "#845EC2",
  "#FFC75F",
  "#F9F871",
  "#D65DB1",
];
