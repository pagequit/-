import { type Viewport } from "../lib/Viewport.ts";
import { type Vector, createVector } from "../lib/Vector.ts";
import { tileSize, pixelBase, scaleBase } from "./constants.ts";

export function drawDelta(viewport: Viewport, delta: number): void {
  const { ctx, translation, scale } = viewport;

  ctx.font = "16px monospace";
  ctx.fillStyle = "white";
  ctx.fillText(
    delta.toFixed(1),
    translation.x / scale.x + 8,
    translation.y / scale.y + 16,
  );
}

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  position: Vector,
  size: number = 4,
  color: string = "white",
): void {
  ctx.beginPath();
  ctx.arc(position.x, position.y, size, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  position: Vector,
  size: number = 4,
  color: string = "white",
): void {
  ctx.beginPath();
  ctx.arc(position.x, position.y, size, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  position: Vector,
  width: number,
  height: number,
  color: string = "white",
): void {
  ctx.fillStyle = color;
  ctx.fillRect(position.x, position.y, width, height);
}

export function plotLine(
  a: Vector,
  b: Vector,
  draw: (x: number, y: number) => void,
): void {
  let ax = a.x;
  let ay = a.y;
  const bx = b.x;
  const by = b.y;
  const dx = bx - ax;
  const dy = by - ay;
  const dax = Math.abs(dx);
  const day = Math.abs(dy);
  const dsx = Math.sign(dx);
  const dsy = Math.sign(dy);
  let dda = dax - day;

  while (true) {
    draw(ax, ay);
    if (ax === bx && ay === by) {
      break;
    }

    const da2 = dda + dda;
    if (da2 > -day) {
      dda -= day;
      ax += dsx;
    }
    if (da2 < dax) {
      dda += dax;
      ay += dsy;
    }
  }
}

// FIXME - object creation
export function getGridCoord(position: Vector): Vector {
  return createVector(
    Math.floor(position.x / tileSize),
    Math.floor(position.y / tileSize),
  );
}

// FIXME - object creation
export function getPixelCoord(position: Vector): Vector {
  return createVector(
    Math.floor(position.x / scaleBase),
    Math.floor(position.y / scaleBase),
  );
}
