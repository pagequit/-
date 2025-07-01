import { type Vector } from "./Vector";

export type Grid = {
  tileSize: number;
  xCount: number;
  yCount: number;
};

export function drawGrid(grid: Grid, ctx: CanvasRenderingContext2D): void {
  for (let x = 0; x < grid.xCount; x++) {
    for (let y = 0; y < grid.yCount; y++) {
      ctx.fillStyle =
        x % 2 === y % 2 ? "rgba(32, 32, 32, 0.1)" : "rgba(64, 64, 64, 0.2)";
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
