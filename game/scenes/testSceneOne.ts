import { pixelBase, scaleBase, tileSize } from "../constants.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { viewport, pointer } from "../../main.ts";
import { type Scene } from "../../lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "../../lib/Grid.ts";
import { drawCircle, drawRectangle, toPixelCoord, plotLine } from "../misc.ts";
import {
  hero,
  getHeroGraphics,
  processHero,
  drawHeroStuff,
  updateHeroPosition,
} from "../Hero.ts";
import { animateSprite } from "../../lib/Sprite.ts";
import {
  circleCollideRectangle,
  circleContainsCircle,
  isPointInRectangle,
  type Circle,
  type Rectangle,
} from "../../lib/collision.ts";
import { createVector, type Vector } from "../../lib/Vector.ts";

const { ctx } = viewport;

// prettier-ignore
const tileSet = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const grid = createGrid(tileSize, tileSet[0].length, tileSet.length);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const asyncData = {
  hero: {},
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (grid.xCount - 8) * grid.tileSize,
    y: (grid.yCount - 12) * grid.tileSize,
  },
};

const bThing: Circle = {
  radius: tileSize,
  position: {
    x: (grid.xCount - 8) * grid.tileSize,
    y: (grid.yCount - 12) * grid.tileSize,
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

function mapTiles(tileSet: Array<Array<number>>): Array<Vector> {
  const map = [];
  const ySize = tileSet.length;
  const xSize = tileSet[0].length;

  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      if (tileSet[y][x] === 1) {
        map.push(createVector(x * tileSize, y * tileSize));
      }
    }
  }

  return map;
}

const walls = mapTiles(tileSet);

function isTileFree(coord: Vector): boolean {
  return !tileSet[coord.y][coord.x];
}

function getTileByPosition(position: Vector): number {
  return tileSet[Math.floor(position.y / tileSize)][
    Math.floor(position.x / tileSize)
  ];
}

const pixelCoordStart = createVector();
const pixelCoordTarget = createVector();

const pixelCoord = createVector();
function drawPixel(x: number, y: number): void {
  pixelCoord.x = x * scaleBase;
  pixelCoord.y = y * scaleBase;

  drawRectangle(ctx, pixelCoord, scaleBase, scaleBase, "rgba(128, 0, 0, 0.5)");
}

function process(delta: number) {
  // inject the target position ?
  processHero(delta);

  focusViewport(viewport, hero.position.x, hero.position.y, width, height);
  animateSprite(
    asyncData.hero.idle,
    hero.position.x - hero.spriteOffset.x,
    hero.position.y - hero.spriteOffset.y,
    ctx,
    delta,
  );
  drawHeroStuff(ctx);
  highlightGridTile(grid, hero.position, ctx);

  toPixelCoord(hero.collisionShape.position, pixelCoordStart);
  toPixelCoord(hero.targetPosition, pixelCoordTarget);
  plotLine(pixelCoordStart, pixelCoordTarget, drawPixel);

  {
    let color = "rgba(128, 128, 128, 0.5)";
    if (isPointInRectangle(pointer.position, aThing)) {
      color = "rgba(0, 0, 128, 0.5)";
    }
    if (circleCollideRectangle(hero.collisionShape, aThing)) {
      color = "rgba(128, 0, 0, 0.5)";
    }
    drawRectangle(ctx, aThing.position, aThing.width, aThing.height, color);
  }

  {
    let color = "rgba(128, 128, 128, 0.5)";
    if (circleContainsCircle(hero.collisionShape, bThing)) {
      color = "rgba(0, 0, 128, 0.5)";
    }
    drawCircle(ctx, bThing.position, bThing.radius, color);
  }

  drawGrid(grid, ctx);
  drawTileSet(tileSet, ctx);
}

export default async function (): Promise<Scene> {
  asyncData.hero.idle = await getHeroGraphics().idle;

  updateHeroPosition(tileSize * 15, tileSize * 5);

  console.log("load testSceneOne");

  return { width, height, process };
}
