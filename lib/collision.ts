import {
  createVector,
  getDotProduct,
  getSquared,
  normalize,
  type Vector,
} from "./Vector.ts";

export type Circle = {
  position: Vector;
  radius: number;
};

export type AABB = {
  position: Vector;
  width: number;
  height: number;
};

export type Polygon = {
  position: Vector;
  points: Array<Vector>;
  axes: Array<Vector>;
  aabb: AABB;
};

export enum ShapeType {
  Circle,
  AABB,
  Polygon,
}

export function createCircle(position: Vector, radius: number): Circle {
  return { position, radius };
}

export function createAABB(
  position: Vector,
  width: number,
  height: number,
): AABB {
  return { position, width, height };
}

export function createPolygon(
  position: Vector,
  points: Array<Vector>,
): Polygon {
  const polygon: Polygon = {
    position,
    points,
    axes: points.map(() => createVector()),
    aabb: points.reduce(
      (acc, cur, index) => {
        if (cur.x < acc.position.x) {
          acc.position.x = cur.x;
        }
        if (cur.y < acc.position.y) {
          acc.position.y = cur.y;
        }

        if (cur.x > acc.width) {
          acc.width = cur.x;
        }
        if (cur.y > acc.height) {
          acc.height = cur.y;
        }

        if (index === points.length - 1) {
          acc.width = acc.width - acc.position.x;
          acc.height = acc.height - acc.position.y;
        }

        return acc;
      },
      createAABB(
        createVector(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ),
    ),
  };

  updateAxes(polygon);

  return polygon;
}

export function updateAxes(polygon: Polygon): void {
  const { points, axes } = polygon;
  const cap = axes.length - 1;

  let j = 0;
  for (let i = 0; i <= cap; i++) {
    if (++j > cap) {
      j = 0;
    }

    axes[i].x = -(points[j].y - points[i].y);
    axes[i].y = points[j].x - points[i].x;
    normalize(axes[i]);
  }
}

function project(polygon: Polygon, axis: Vector): { min: number; max: number } {
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

  return { min, max };
}

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

export function isPointInCircle(point: Vector, circle: Circle): boolean {
  const dx = point.x - circle.position.x;
  const dy = point.y - circle.position.y;

  return dx * dx + dy * dy <= Math.pow(circle.radius, 2);
}

export function circleIntersectCircle(a: Circle, b: Circle): boolean {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;

  return dx * dx + dy * dy <= Math.pow(a.radius + b.radius, 2);
}

export function isPointInAABB(point: Vector, rect: AABB): boolean {
  const rx = rect.position.x;
  const ry = rect.position.y;

  return (
    point.x >= rx &&
    point.x <= rx + rect.width &&
    point.y >= ry &&
    point.y <= ry + rect.height
  );
}

export function AABBIntersectAABB(a: AABB, b: AABB): boolean {
  const ax = a.position.x;
  const ay = a.position.y;
  const bx = b.position.x;
  const by = b.position.y;

  return (
    ax <= bx + b.width &&
    ax + a.width >= bx &&
    ay <= by + b.height &&
    ay + a.height >= by
  );
}

export function circleIntersectAABB(circle: Circle, rect: AABB): boolean {
  const cx = circle.position.x;
  const cy = circle.position.y;
  const rx = rect.position.x;
  const ry = rect.position.y;

  const dx = cx - Math.max(rx, Math.min(cx, rx + rect.width));
  const dy = cy - Math.max(ry, Math.min(cy, ry + rect.height));

  return dx * dx + dy * dy <= Math.pow(circle.radius, 2);
}

export function circleContainsCircle(a: Circle, b: Circle): boolean {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return a.radius >= b.radius + distance;
}

export function AABBContainsAABB(a: AABB, b: AABB): boolean {
  const ax = a.position.x;
  const ay = a.position.y;
  const bx = b.position.x;
  const by = b.position.y;

  return (
    ax <= bx &&
    ax + a.width >= bx + b.width &&
    ay <= by &&
    ay + a.height >= by + b.height
  );
}

export function AABBContainsCircle(rect: AABB, circle: Circle): boolean {
  const rx = rect.position.x;
  const ry = rect.position.y;
  const cx = circle.position.x;
  const cy = circle.position.y;

  return (
    rx <= cx - circle.radius &&
    rx + rect.width >= cx + circle.radius &&
    ry <= cy - circle.radius &&
    ry + rect.height >= cy + circle.radius
  );
}

export function circleContainsAABB(circle: Circle, rect: AABB): boolean {
  const dax = rect.position.x - circle.position.x;
  const day = rect.position.y - circle.position.y;

  const dbx = rect.position.x + rect.width - circle.position.x;
  const dby = rect.position.y - circle.position.y;

  const dcx = rect.position.x - circle.position.x;
  const dcy = rect.position.y + rect.height - circle.position.y;

  const ddx = rect.position.x + rect.width - circle.position.x;
  const ddy = rect.position.y + rect.height - circle.position.y;

  const daSquare = dax * dax + day * day;
  const dbsquare = dbx * dbx + dby * dby;
  const dcSquare = dcx * dcx + dcy * dcy;
  const ddSquare = ddx * ddx + ddy * ddy;

  const radiusSquare = Math.pow(circle.radius, 2);

  return (
    daSquare <= radiusSquare &&
    dbsquare <= radiusSquare &&
    dcSquare <= radiusSquare &&
    ddSquare <= radiusSquare
  );
}
