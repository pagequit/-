import { tileSize } from "../constants.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { viewport, pointer } from "../../main.ts";
import { createScene, type Scene } from "../../lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "../../lib/Grid.ts";
import { drawRectangle, fromGridCoord } from "../misc.ts";
import { processHero, loadHero, setHeroPosition } from "../Hero.ts";
import {
  circleCollideRectangle,
  createRectangle,
  isPointInRectangle,
  type Rectangle,
} from "../../lib/collision.ts";
import { createVector, type Vector } from "../../lib/Vector.ts";
import { compileColor, createColor } from "../../lib/Color.ts";
import { isNewExpression } from "typescript";

type TileSet = Array<Array<number>>;

// prettier-ignore
const tileSet: TileSet = [
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

const { ctx } = viewport;

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (grid.xCount - 8) * grid.tileSize,
    y: (grid.yCount - 12) * grid.tileSize,
  },
};

function isTileFree(tileSet: TileSet, x: number, y: number): boolean {
  return !tileSet[y][x];
}

function getTileByPosition(position: Vector): number {
  return tileSet[(position.y / tileSize) | 0][(position.x / tileSize) | 0];
}

function drawTileSet(tileSet: TileSet, ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "rgba(128, 128, 128, 1.0)";
  const ySize = tileSet.length;
  const xSize = tileSet[0].length;

  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      if (tileSet[y][x] > 0) {
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

function compileTilesToRectangles(tileSet: TileSet): Array<Rectangle> {
  const wallTiles: Array<[number, number]> = [];
  const ySize = tileSet.length;
  const xSize = tileSet[0].length;

  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      if (!isTileFree(tileSet, x, y)) {
        wallTiles.push([y, x]);
      }
    }
  }

  let currentWall: any = [];
  const walls: any = [];
  const nc = createVector();

  function testDown(x: number, y: number) {
    currentWall.push([x, y]);

    nc.x = x;
    nc.y = y + 1;
    if (nc.y >= tileSet.length) {
      walls.push(currentWall);
      currentWall = [];

      nc.x = x + 1;
      nc.y = 0;
      if (nc.x >= tileSet[0].length) {
        //
        return;
      }
    }

    if (!isTileFree(tileSet, nc.x, nc.y)) {
      testDown(nc.x, nc.y);
    } else {
      // ich hab vergessen wo ich bin
      // ich muss mir die stelle merken
      walls.push(currentWall);
      currentWall = [];
    }
  }

  testDown(wallTiles[0][0], wallTiles[0][1]);

  return walls.map((tiles: any) => {
    const last = tiles.length - 1;
    const minX = tiles[0][0];
    const minY = tiles[0][1];
    const maxX = tiles[last][0];
    const maxY = tiles[last][1];
    const min = createVector();
    const max = createVector();
    fromGridCoord(createVector(minX, minY), min);
    fromGridCoord(createVector(maxX, maxY), max);

    return createRectangle(min, max.x + tileSize, max.y + tileSize);
  });
}

const walls = compileTilesToRectangles(tileSet);
const wallColor = createColor(128, 0, 0, 0.4);
function getWallColor(index: number): string {
  switch (index % 3) {
    case 0: {
      wallColor.r = 128;
      wallColor.g = 0;
      wallColor.b = 0;
      compileColor(wallColor);
      break;
    }
    case 1: {
      wallColor.r = 0;
      wallColor.g = 128;
      wallColor.b = 0;
      compileColor(wallColor);
      break;
    }
    case 2: {
      wallColor.r = 0;
      wallColor.g = 0;
      wallColor.b = 128;
      compileColor(wallColor);
      break;
    }
  }

  return wallColor.value;
}

function process(delta: number) {
  processHero(delta);
  focusViewport(
    viewport,
    asyncData.hero.position.x,
    asyncData.hero.position.y,
    width,
    height,
  );

  highlightGridTile(grid, asyncData.hero.position, ctx);

  {
    let color = "rgba(128, 128, 128, 0.5)";
    if (isPointInRectangle(pointer.position, aThing)) {
      color = "rgba(0, 0, 128, 0.5)";
    }
    if (circleCollideRectangle(asyncData.hero.collisionShape, aThing)) {
      color = "rgba(128, 0, 0, 0.5)";
    }
    drawRectangle(ctx, aThing.position, aThing.width, aThing.height, color);
  }

  drawGrid(grid, ctx);
  drawTileSet(tileSet, ctx);

  for (let i = 0; i < walls.length; i++) {
    drawRectangle(
      ctx,
      walls[i].position,
      walls[i].width,
      walls[i].height,
      getWallColor(i),
    );
  }
}

export default async function (): Promise<Scene> {
  console.log("load testSceneOne");

  asyncData.hero = await loadHero();

  return createScene({
    width,
    height,
    process,
    preProcess() {
      setHeroPosition(tileSize * 15, tileSize * 5);
    },
  });
}
