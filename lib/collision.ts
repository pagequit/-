import { type Vector } from "./Vector.ts";

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
};

export enum ShapeType {
  Circle,
  AABB,
  Polygon,
}

export type CollisionShape = {
  position: Vector;
  support: (direction: Vector) => Vector;
};

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

export function sat(a: Polygon, b: Polygon): boolean {
  return false;
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
