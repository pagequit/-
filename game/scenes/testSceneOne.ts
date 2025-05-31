import { tileSize } from "../constants.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { viewport, pointer } from "../../main.ts";
import { type Scene } from "../../lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "../../lib/Grid.ts";
import { drawCircle, drawPoint, drawRectangle } from "../misc.ts";
import { hero, getHeroGraphics, processHero } from "../Hero.ts";
import { createVector, getSquared } from "../../lib/Vector.ts";
import { animateSprite } from "../../lib/Sprite.ts";
import {
  circleCollideCircle,
  isPointInCircle,
  isPointInRectangle,
  rectangleCollideRectangle,
  type Circle,
  type Rectangle,
} from "../../lib/collision.ts";

const { ctx } = viewport;

// prettier-ignore
const tileSet = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const grid = createGrid(tileSize, tileSet[0].length, tileSet.length);
const width = grid.tileSize * grid.xSize;
const height = grid.tileSize * grid.ySize;

const asyncData = {
  hero: {},
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (grid.xSize - 8) * grid.tileSize,
    y: (grid.ySize - 12) * grid.tileSize,
  },
};

function drawTileSet(
  tileSet: Array<Array<number>>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = "rgba(128, 128, 128, 1.0)";
  const ySize = tileSet.length;
  const xSize = tileSet[0].length;

  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      if (tileSet[y][x] === 1) {
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

function process(delta: number) {
  processHero(delta);
  focusViewport(viewport, hero.position.x, hero.position.y, width, height);
  animateSprite(
    asyncData.hero.idle,
    hero.position.x - hero.spriteOffset.x,
    hero.position.y - hero.spriteOffset.y,
    ctx,
    delta,
  );
  drawPoint(ctx, hero.position);
  drawRectangle(
    ctx,
    hero.position,
    hero.width,
    hero.height,
    "rgba(128, 0, 0, 0.5)",
  );

  drawTileSet(tileSet, ctx);

  drawRectangle(
    ctx,
    aThing.position,
    aThing.width,
    aThing.height,
    "rgba(128, 128, 128, 0.5)",
  );
  if (isPointInRectangle(pointer.position, aThing)) {
    drawRectangle(
      ctx,
      aThing.position,
      aThing.width,
      aThing.height,
      "rgba(0, 0, 128, 0.5)",
    );
  }
  if (rectangleCollideRectangle(hero, aThing)) {
    drawRectangle(
      ctx,
      aThing.position,
      aThing.width,
      aThing.height,
      "rgba(128, 0, 0,  0.5)",
    );
  }

  drawGrid(grid, ctx);
  highlightGridTile(grid, hero.position, ctx);
}

export default async function (): Promise<Scene> {
  asyncData.hero.idle = await getHeroGraphics().idle;

  hero.position.x = width / 2 - 32;
  hero.position.y = height / 2 - 44;

  console.log("load testSceneOne");

  return { width, height, process };
}
