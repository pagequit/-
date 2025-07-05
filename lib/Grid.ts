import { type Vector } from "./Vector";

export type Grid = {
  tileSize: number;
  xCount: number;
  yCount: number;
};

export function drawGrid(grid: Grid, ctx: CanvasRenderingContext2D): void {
  const { tileSize, yCount, xCount } = grid;
  const width = xCount * tileSize;
  const height = yCount * tileSize;
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "rgba(30, 31, 34, 0.3)";

  for (let x = 0; x < xCount; x++) {
    const xCoord = x * tileSize;
    ctx.beginPath();
    ctx.moveTo(xCoord, 0);
    ctx.lineTo(xCoord, height);
    ctx.stroke();
  }

  for (let y = 0; y < yCount; y++) {
    const yCoord = y * tileSize;
    ctx.beginPath();
    ctx.moveTo(0, yCoord);
    ctx.lineTo(width, yCoord);
    ctx.stroke();
  }
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";

  for (let x = 0; x < xCount; x++) {
    const xCoord = x * tileSize - 0.5;
    ctx.beginPath();
    ctx.moveTo(xCoord, 0);
    ctx.lineTo(xCoord, height);
    ctx.stroke();
  }

  for (let y = 0; y < yCount; y++) {
    const yCoord = y * tileSize - 0.5;
    ctx.beginPath();
    ctx.moveTo(0, yCoord);
    ctx.lineTo(width, yCoord);
    ctx.stroke();
  }
}

export function drawGridTiles(grid: Grid, ctx: CanvasRenderingContext2D): void {
  for (let x = 0; x < grid.xCount; x++) {
    for (let y = 0; y < grid.yCount; y++) {
      ctx.fillStyle =
        x % 2 === y % 2 ? "rgba(128, 128, 128, 0.2)" : "rgba(64, 64, 64, 0.4)";
      ctx.fillRect(
        x * grid.tileSize,
        y * grid.tileSize,
        grid.tileSize,
        grid.tileSize,
      );
    }
  }
}

export function createGrid(
  tileSize: number,
  xCount: number,
  yCount: number,
): Grid {
  return { tileSize, xCount, yCount };
}

export function highlightGridTile(
  { tileSize }: Grid,
  position: Vector,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = "rgba(128, 128, 128, 0.3)";
  ctx.fillRect(
    ((position.x / tileSize) | 0) * tileSize,
    ((position.y / tileSize) | 0) * tileSize,
    tileSize,
    tileSize,
  );
}
