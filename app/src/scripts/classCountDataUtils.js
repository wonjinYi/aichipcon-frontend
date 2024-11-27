import { CLASS_NAME } from "../constants.js";

export function generateClassCountData(frameData) {
  const classCountData = frameData.map((boxes) => {
    const clsCounts = boxes.reduce((acc, box) => {
      const cls = box.cls;
      const key = CLASS_NAME[cls];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return clsCounts;
  });

  return classCountData;
}

export function sumClassCountInRange(classCountData, frameConfig) {
  const sum = classCountData
    .slice(frameConfig.startFrame - 1, frameConfig.endFrame)
    .reduce((acc, curr) => {
      for (const key in curr) {
        acc[key] = (acc[key] || 0) + curr[key];
      }
      return acc;
    }, {});

  return sum;
}

export function sliceClassCountInRange(classCountData, frameConfig) {
  const sliced = classCountData.slice(
    frameConfig.startFrame - 1,
    frameConfig.endFrame
  );
  return sliced;
}
