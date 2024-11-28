import { CLASS_NAME } from "../constants.js";

export function updateRoiCanvas(
  editorBody,
  video,
  canvas,
  canvasWrap,
  curRoi,
  dragPointIdx,
  hoverPointIdx
) {
  const aspect = video.videoWidth / video.videoHeight;

  const bodyWidth = editorBody.clientWidth;
  const bodyHeight = editorBody.clientHeight;

  let wrapWidth, wrapHeight;

  if (bodyWidth / bodyHeight > aspect) {
    // body가 비디오보다 더 넓으면, 높이를 100%로 설정
    wrapWidth = bodyHeight * aspect;
    wrapHeight = bodyHeight;
  } else {
    // body가 비디오보다 더 좁으면, 너비를 100%로 설정
    wrapWidth = bodyWidth;
    wrapHeight = bodyWidth / aspect;
  }

  canvasWrap.style.width = `${wrapWidth}px`;
  canvasWrap.style.height = `${wrapHeight}px`;
  canvas.style.width = `${wrapWidth}px`;
  canvas.style.height = `${wrapHeight}px`;
  canvas.width = wrapWidth;
  canvas.height = wrapHeight;

  const ctx = canvas.getContext("2d");

  // canvas의 렌더링 결과를 canvasWrap 크기에 맞게 스케일링
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 기존 내용 지우기
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  drawPolygon(canvas, curRoi, dragPointIdx, hoverPointIdx);
}

function drawPolygon(canvas, curRoi, dragPointIdx, hoverPointIdx) {
  const ctx = canvas.getContext("2d");

  if (curRoi.length > 0) {
    ctx.strokeStyle = "rgb(202, 39, 39)";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(202, 39, 39, 0.2)";
    ctx.beginPath();
    ctx.moveTo(curRoi[0][0] * canvas.width, curRoi[0][1] * canvas.height);
    curRoi.forEach(([x, y]) => ctx.lineTo(x * canvas.width, y * canvas.height));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    curRoi.forEach(([x, y], index) => {
      ctx.beginPath();
      ctx.arc(x * canvas.width, y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fillStyle =
        index === hoverPointIdx ? "rgb(255, 255, 255)" : "rgb(202, 39, 39)";
      ctx.fill();
    });
  }
}
