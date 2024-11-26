function generateChartData(frames, frameIndex) {
  if (!frames || frameIndex >= frames.length || frameIndex < 0) return;

  const objectCounts = {};

  // {"class": c, "confidence": co, "coordinates": xy}
  console.log("Frame data:", frames[frameIndex]);
  frames[frameIndex].forEach((obj) => {
    const classId = obj.class;
    if (objectCounts[classId]) {
      objectCounts[classId] += 1;
    } else {
      objectCounts[classId] = 1;
    }
  });

  console.log("Object counts:", objectCounts);
  const labels = Object.keys(objectCounts).map((classId) => `Class ${classId}`);
  const data = Object.values(objectCounts);
  console.log(data);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Object Count per Class",
        data: data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
    options: {
      // no animation
      animation: false,
    },
  };

  return chartData;
}

export default generateChartData;
