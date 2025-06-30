import { scaleBase, tileSize } from "#/game/constants.ts";
import { type Vector } from "#/lib/Vector.ts";
import { createColor } from "#/lib/Color.ts";
import { compileColor } from "#/lib/Color.ts";

const defaultColor = createColor(255, 255, 255);

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  position: Vector,
  radius: number = 4,
  color: string = defaultColor.value,
): void {
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  position: Vector,
  radius: number = 4,
  color: string = defaultColor.value,
): void {
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  position: Vector,
  width: number,
  height: number,
  color: string = defaultColor.value,
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

    const dda2 = dda + dda;
    if (dda2 > -day) {
      dda -= day;
      ax += dsx;
    }
    if (dda2 < dax) {
      dda += dax;
      ay += dsy;
    }
  }
}

export function fromGridCoord(coord: Vector, position: Vector): void {
  position.x = coord.x * tileSize;
  position.y = coord.y * tileSize;
}

export function toGridCoord(position: Vector, coord: Vector): void {
  coord.x = (position.x / tileSize) | 0;
  coord.y = (position.y / tileSize) | 0;
}

export function toPixelCoord(position: Vector, coord: Vector): void {
  coord.x = (position.x / scaleBase) | 0;
  coord.y = (position.y / scaleBase) | 0;
}

export function getModThreeColor(index: number): string {
  const color = createColor(0, 0, 0, 0.5);

  switch (index % 3) {
    case 0: {
      color.r = 128;
      break;
    }
    case 1: {
      color.g = 128;
      break;
    }
    case 2: {
      color.b = 128;
      break;
    }
  }
  compileColor(color);

  return color.value;
}
