import { type Vector } from "./Vector.ts";

export type Circle = {
  position: Vector;
  radius: number;
};

export type Rectangle = {
  position: Vector;
  width: number;
  height: number;
};

export function isPointInCircle(point: Vector, circle: Circle): boolean {
  const dx = point.x - circle.position.x;
  const dy = point.y - circle.position.y;

  return dx * dx + dy * dy <= Math.pow(circle.radius, 2);
}

export function circleCollideCircle(a: Circle, b: Circle): boolean {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;

  return dx * dx + dy * dy <= Math.pow(a.radius + b.radius, 2);
}

export function isPointInRectangle(
  point: Vector,
  rectangle: Rectangle,
): boolean {
  const rx = rectangle.position.x;
  const ry = rectangle.position.y;

  return (
    point.x >= rx &&
    point.x <= rx + rectangle.width &&
    point.y >= ry &&
    point.y <= ry + rectangle.height
  );
}

export function rectangleCollideRectangle(a: Rectangle, b: Rectangle): boolean {
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

export function circleCollideRectangle(
  circle: Circle,
  rectangle: Rectangle,
): boolean {
  const cx = circle.position.x;
  const cy = circle.position.y;
  const rx = rectangle.position.x;
  const ry = rectangle.position.y;

  const dx = cx - Math.max(rx, Math.min(cx, rx + rectangle.width));
  const dy = cy - Math.max(ry, Math.min(cy, ry + rectangle.height));

  return dx * dx + dy * dy <= Math.pow(circle.radius, 2);
}

export function circleContainsCircle(a: Circle, b: Circle): boolean {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return a.radius >= b.radius + distance;
}

export function rectangleContainsRectangle(
  a: Rectangle,
  b: Rectangle,
): boolean {
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

export function rectangleContainsCircle(
  rectangle: Rectangle,
  circle: Circle,
): boolean {
  const rx = rectangle.position.x;
  const ry = rectangle.position.y;
  const cx = circle.position.x;
  const cy = circle.position.y;

  return (
    rx <= cx - circle.radius &&
    rx + rectangle.width >= cx + circle.radius &&
    ry <= cy - circle.radius &&
    ry + rectangle.height >= cy + circle.radius
  );
}

export function circleContainsRectangle(
  circle: Circle,
  rectangle: Rectangle,
): boolean {
  const dax = rectangle.position.x - circle.position.x;
  const day = rectangle.position.y - circle.position.y;

  const dbx = rectangle.position.x + rectangle.width - circle.position.x;
  const dby = rectangle.position.y - circle.position.y;

  const dcx = rectangle.position.x - circle.position.x;
  const dcy = rectangle.position.y + rectangle.height - circle.position.y;

  const ddx = rectangle.position.x + rectangle.width - circle.position.x;
  const ddy = rectangle.position.y + rectangle.height - circle.position.y;

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
