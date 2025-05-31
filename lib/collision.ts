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
  const rectX = rectangle.position.x;
  const rectY = rectangle.position.y;

  return (
    point.x >= rectX &&
    point.x <= rectX + rectangle.width &&
    point.y >= rectY &&
    point.y <= rectY + rectangle.height
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
