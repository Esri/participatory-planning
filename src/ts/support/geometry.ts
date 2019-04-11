import { convexHull, difference } from "esri/geometry/geometryEngine";
import Polygon from "esri/geometry/Polygon";

export const computeBoundingPolygon = (polygon: Polygon): Polygon => {
  const hull = convexHull(polygon) as Polygon;
  const centroid = hull.centroid;
  const rings = hull.rings;
  rings.forEach((ring) => ring.forEach((point) => {
    point[0] = point[0] + (point[0] - centroid.x) * 100;
    point[1] = point[1] + (point[1] - centroid.y) * 100;
  }));
  hull.rings = rings;
  return difference(hull, polygon) as Polygon;
};
