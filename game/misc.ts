import { type Viewport } from "../lib/Viewport.ts";
import { type Vector } from "../lib/Vector.ts";

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
