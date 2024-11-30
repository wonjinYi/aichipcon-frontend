import { CLASS_NAME, COLOR_PALETTE } from "../constants.js";

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
          (_, idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]
        ), // 색상 순환
        borderColor: labels.map(
          (_, idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]
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

  const len = classCountObjs.length;
  const summarizeUnit = Math.ceil(len / 50);

  // 프레임 데이터를 요약
  const summarizedData = [];
  for (let i = 0; i < len; i += summarizeUnit) {
    const summarizedFrame = {};

    // 요약할 범위 (i부터 i + summarizeUnit까지)
    for (let j = i; j < Math.min(i + summarizeUnit, len); j++) {
      const frame = classCountObjs[j];
      for (const [className, count] of Object.entries(frame)) {
        summarizedFrame[className] = (summarizedFrame[className] || 0) + count; // 각 클래스의 합산
      }
    }

    summarizedData.push(summarizedFrame);
  }

  // Extract unique class names
  const classNames = Array.from(
    new Set(summarizedData.flatMap((frame) => Object.keys(frame)))
  );

  // Prepare dataset for each class
  const chartData = {
    labels: summarizedData.map((_, index) => {
      const rangeStart = startFrame + index * summarizeUnit;
      const rangeEnd = Math.min(
        startFrame + (index + 1) * summarizeUnit - 1,
        endFrame
      );
      if (rangeStart === rangeEnd) {
        return `${rangeStart}`;
      } else {
        return `${rangeStart}-${rangeEnd}`;
      }
    }), // Frame labels
    datasets: classNames.map((className, index) => ({
      label: className,
      data: summarizedData.map((frame) => frame[className] || 0), // Use 0 if key is missing
      backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
    })),
  };

  return chartData;
}
