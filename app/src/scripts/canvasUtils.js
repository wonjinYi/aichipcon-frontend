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

    let boxColor = box.cls === 0 ? "red" : "green";

    const rectWidth = w * sourceW;
    const rectHeight = h * sourceH;
    const rectX = x * sourceW - rectWidth / 2;
    const rectY = y * sourceH - rectHeight / 2;

    // draw bounding box
    context.strokeStyle = boxColor;
    context.lineWidth = 1;
    context.strokeRect(rectX, rectY, rectWidth, rectHeight);
    // draw text
    context.fillStyle = boxColor;
    context.font = "10px Noto Sans";
    context.fillText(className, rectX, rectY - 4);
  });
}

const CLASS_NAME = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];
