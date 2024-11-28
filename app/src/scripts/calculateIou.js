import { difference, intersection } from "polygon-clipping";

/**
 * Polygon과 BBox의 IoU 계산
 * @param {Object} bbox - { cls: Int, conf: Int, xywh: Float[4] }
 * @param {Array} polygon - [[x1, y1], [x2, y2], ...]
 * @returns {Number} IoU 값
 */
export default function calculateIou(bbox, polygons) {
  // BBox를 Polygon으로 변환
  const bboxPolygon = bboxToPolygon(bbox);

  const intsc = intersection([bboxPolygon], polygons);
  const bboxArea = calculateArea(bboxPolygon);
  const intersectionArea = intsc.length ? calculateArea(intsc[0][0]) : 0;

  // IoU 계산
  const iou = intersectionArea / bboxArea;
  return iou;
}

/**
 * BBox를 Polygon으로 변환
 * @param {Object} bbox - {x, y, w, h}
 * @returns {Array} Polygon 좌표 [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
 */
function bboxToPolygon(bbox) {
  const [x, y, w, h] = bbox.xywh;
  const halfW = w / 2;
  const halfH = h / 2;

  return [
    [x - halfW, y - halfH], // 좌상
    [x + halfW, y - halfH], // 우상
    [x + halfW, y + halfH], // 우하
    [x - halfW, y + halfH], // 좌하
    [x - halfW, y - halfH], // 닫는 꼭짓점
  ];
}

/**
 * 다각형의 면적 계산 (Shoelace Formula)
 * @param {Array} polygon - [[x1, y1], [x2, y2], ...]
 * @returns {Number} 다각형 면적
 */
function calculateArea(polygon) {
  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % n]; // 다음 점 (마지막 점은 첫 번째 점과 연결)
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2; // 절대값을 취해 양수 면적 반환
}
