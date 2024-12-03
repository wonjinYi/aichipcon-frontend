import { CLASS_NAME, COLOR_PALETTE } from "../constants.js";

/**
 * Resize canvas to match the video size
 * @param {*} canvas DOM element
 * @param {*} video DOM element
 * @returns undefined
 */
export function updateCanvasSizeFromVideo(canvasElement, videoElement) {
  if (!canvasElement || !videoElement) return;

  const rect = videoElement.getBoundingClientRect();
  canvasElement.width = rect.width;
  canvasElement.height = rect.height;

  canvasElement.style.width = `${rect.width}px`;
  canvasElement.style.height = `${rect.height}px`;
}

/**
 * Draw inference results(bounding boxes) on the canvas
 * @param {*} canvasElement
 * @param {*} _boxes
 */
export function drawBoundingBoxes(canvasElement, _boxes) {
  const canvas = canvasElement;
  const context = canvas.getContext("2d");

  // antialising
  context.imageSmoothingEnabled = true;
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Assuming frameData contains bounding box information for each frame
  const boxes = _boxes;

  boxes.forEach((box) => {
    let [x, y, w, h] = box.xywh;
    let [sourceW, sourceH] = [canvas.width, canvas.height];

    const classId = box.cls;
    const className = CLASS_NAME[classId];
    const color = COLOR_PALETTE[classId % COLOR_PALETTE.length];

    let boxColor = box.cls === 0 ? "red" : color;

    const rectWidth = w * sourceW;
    const rectHeight = h * sourceH;
    // const rectX = x * sourceW - rectWidth / 2;
    // const rectY = y * sourceH - rectHeight / 2;
    const rectX = x * sourceW;
    const rectY = y * sourceH;

    // draw bounding box
    context.strokeStyle = boxColor;
    context.lineWidth = 2;
    context.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // draw text
    context.fillStyle = boxColor;
    context.font = "bold 13px Noto Sans";
    //bold
    context.fillText(className, rectX, rectY - 4);
  });
}
