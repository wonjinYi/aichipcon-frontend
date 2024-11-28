import { union } from "polygon-clipping";
export default function unionPolygons(polygons) {
  const onlyPoints = polygons.map((polygon) => [polygon.points]);
  const validPolygons = onlyPoints.filter((points) => points[0].length > 0);
  console.log(validPolygons);
  if (!validPolygons.length) return null;

  let result = validPolygons[0];
  for (let i = 1; i < validPolygons.length; i++) {
    result = union(result, validPolygons[i]);
  }
  return result;
}
