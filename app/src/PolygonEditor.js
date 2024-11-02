import React, { useRef, useState, useEffect } from "react";

function PolygonEditor() {
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [imageResolution, setImageResolution] = useState({
    width: 0,
    height: 0,
  });
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const [hoveringPointIndex, setHoveringPointIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const imageSrc =
    "https://aihub.or.kr/web-nas/aihub21/files/public/inline-images/%EB%8C%80%ED%91%9C%EB%8F%84%EB%A9%B4_1_1.png";

  // Load image and set canvas size to match image resolution
  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      setImageResolution({ width: image.width, height: image.height });
      const canvas = canvasRef.current;
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, image.width, image.height);
    };
  }, [imageSrc]);

  // 좌클릭으로 점 추가 (드래그 중이 아닐 때만)
  const createPoint = (event) => {
    if (event.button !== 0 || draggingPointIndex !== null || isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(
      ((event.clientX - rect.left) / rect.width) * imageResolution.width
    );
    const y = Math.round(
      ((event.clientY - rect.top) / rect.height) * imageResolution.height
    );

    setCoordinates([...coordinates, [x, y]]);
  };

  // 우클릭으로 점 삭제
  const handleCanvasRightClick = (event) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(
      ((event.clientX - rect.left) / rect.width) * imageResolution.width
    );
    const y = Math.round(
      ((event.clientY - rect.top) / rect.height) * imageResolution.height
    );

    const threshold = 20;
    const updatedCoordinates = coordinates.filter(([px, py]) => {
      return Math.hypot(px - x, py - y) > threshold;
    });

    setCoordinates(updatedCoordinates);
  };

  // 드래그 시작
  const handleMouseDown = (event) => {
    if (event.button !== 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(
      ((event.clientX - rect.left) / rect.width) * imageResolution.width
    );
    const y = Math.round(
      ((event.clientY - rect.top) / rect.height) * imageResolution.height
    );

    const threshold = 20;
    const pointIndex = coordinates.findIndex(
      ([px, py]) => Math.hypot(px - x, py - y) < threshold
    );
    if (pointIndex >= 0) {
      setDraggingPointIndex(pointIndex);
      setIsDragging(true);
    }
  };

  // 드래그 이동
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(
      ((event.clientX - rect.left) / rect.width) * imageResolution.width
    );
    const y = Math.round(
      ((event.clientY - rect.top) / rect.height) * imageResolution.height
    );

    if (draggingPointIndex !== null && isDragging) {
      const newCoordinates = [...coordinates];
      newCoordinates[draggingPointIndex] = [x, y];
      setCoordinates(newCoordinates);
    } else {
      const threshold = 20;
      const hoverIndex = coordinates.findIndex(
        ([px, py]) => Math.hypot(px - x, py - y) < threshold
      );
      setHoveringPointIndex(hoverIndex);
    }
  };

  // 드래그 종료
  const handleMouseUp = (event) => {
    if (!isDragging) {
      createPoint(event);
    }
    setDraggingPointIndex(null);
    setIsDragging(false);
  };

  // 폴리곤 그리기
  const drawPolygon = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, imageResolution.width, imageResolution.height);

      if (coordinates.length > 0) {
        ctx.strokeStyle = "rgb(202, 39, 39)";
        ctx.lineWidth = 8;
        ctx.fillStyle = "rgba(202, 39, 39, 0.2)";
        ctx.beginPath();
        ctx.moveTo(coordinates[0][0], coordinates[0][1]);
        coordinates.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        coordinates.forEach(([x, y], index) => {
          ctx.beginPath();
          ctx.arc(x, y, 24, 0, Math.PI * 2);
          ctx.fillStyle =
            index === hoveringPointIndex
              ? "rgb(255, 255, 255)"
              : "rgb(202, 39, 39)";
          ctx.fill();
        });
      }
    };
  };

  useEffect(() => {
    drawPolygon();
  }, [coordinates, hoveringPointIndex, drawPolygon]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "80vh",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <h2>Click on the image to draw a polygon</h2>
      <div ref={canvasContainerRef} style={{ height: "80%" }}>
        <canvas
          ref={canvasRef}
          onContextMenu={handleCanvasRightClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            border: "1px solid black",
            width: "100%",
            height: "100%",
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>
      <p>Coordinates (in image resolution): {JSON.stringify(coordinates)}</p>
    </div>
  );
}

export default PolygonEditor;
