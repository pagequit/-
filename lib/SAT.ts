import {
  createVector,
  getDotProduct,
  getSquared,
  normalize,
  type Vector,
} from "./Vector.ts";
import { type Circle, type Polygon } from "./collision.ts";

export function useSAT(): {
  SAT: (a: Polygon, b: Polygon) => boolean;
  circleSAT: (circle: Circle, polygon: Polygon) => boolean;
} {
  const delta = createVector();
  const projections = [
    { min: 0, max: 0 },
    { min: 0, max: 0 },
  ];

  function project(polygon: Polygon, axis: Vector, index: number): void {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const point of polygon.points) {
      const dot = getDotProduct(point, axis);
      if (dot < min) {
        min = dot;
      }
      if (dot > max) {
        max = dot;
      }
    }

    projections[index].min = min;
    projections[index].max = max;
  }

  function SAT(a: Polygon, b: Polygon): boolean {
    delta.x = b.position.x - a.position.x;
    delta.y = b.position.y - a.position.y;

    for (const axis of a.axes) {
      project(a, axis, 0);
      project(b, axis, 1);
      const dot = getDotProduct(delta, axis);

      if (
        projections[0].max < projections[1].min + dot ||
        projections[1].max + dot < projections[0].min
      ) {
        return false;
      }
    }

    for (const axis of b.axes) {
      project(a, axis, 0);
      project(b, axis, 1);
      const dot = getDotProduct(delta, axis);

      if (
        projections[0].max < projections[1].min + dot ||
        projections[1].max + dot < projections[0].min
      ) {
        return false;
      }
    }

    return true;
  }

  // TODO: avoid object creation
  function circleSAT(circle: Circle, polygon: Polygon): boolean {
    delta.x = circle.position.x - polygon.position.x;
    delta.y = circle.position.y - polygon.position.y;

    const closest = {
      distance: Number.POSITIVE_INFINITY,
      delta: createVector(),
    };

    for (const point of polygon.points) {
      const cDelta = {
        x: point.x - delta.x,
        y: point.y - delta.y,
      };
      const cDistance = getSquared(cDelta);

      if (cDistance < closest.distance) {
        closest.distance = cDistance;
        closest.delta = cDelta;
      }
    }

    normalize(closest.delta);
    for (const axis of [...polygon.axes, closest.delta]) {
      const dot = getDotProduct(delta, axis);

      project(polygon, axis, 0);
      projections[1].min = dot - circle.radius;
      projections[1].max = dot + circle.radius;

      if (
        projections[0].max < projections[1].min ||
        projections[1].max < projections[0].min
      ) {
        return false;
      }
    }

    return true;
  }

  return { SAT, circleSAT };
}
