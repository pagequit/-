import { tileSize } from "../constants.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { viewport, pointer } from "../../main.ts";
import { createScene, type Scene, type SceneData } from "../../lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "../../lib/Grid.ts";
import { processHero, loadHero, setHeroPosition } from "../Hero.ts";
import {
  circleCollideRectangle,
  isPointInRectangle,
  type Rectangle,
} from "../../lib/collision.ts";
import { type Vector } from "../../lib/Vector.ts";
import { drawRectangle } from "../misc.ts";

type Tilemap = Array<Array<number>>;

// prettier-ignore
const tilemap: Tilemap = [
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
const grid = createGrid(tileSize, tilemap[0].length, tilemap.length);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const asyncData = {
  hero: {},
  tilemap: null,
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const data: SceneData = {
  name: "testSceneOne",
  tileset: "/assets/tileset.png",
};

const { ctx } = viewport;

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (grid.xCount - 8) * grid.tileSize,
    y: (grid.yCount - 12) * grid.tileSize,
  },
};

function isTileFree(tileSet: Tilemap, x: number, y: number): boolean {
  return !tileSet[y][x];
}

function getTileByPosition(position: Vector): number {
  return tilemap[(position.y / tileSize) | 0][(position.x / tileSize) | 0];
}

function drawTileSet(tileSet: Tilemap, ctx: CanvasRenderingContext2D): void {
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

function process(delta: number) {
  highlightGridTile(grid, asyncData.hero.position, ctx);
  processHero(delta);
  focusViewport(
    viewport,
    asyncData.hero.position.x,
    asyncData.hero.position.y,
    width,
    height,
  );

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
  drawTileSet(tilemap, ctx);
}

export default async function (): Promise<Scene> {
  console.log("load testSceneOne");

  asyncData.hero = await loadHero();

  return createScene({
    data,
    width,
    height,
    process,
    preProcess() {
      setHeroPosition(tileSize * 15, tileSize * 5);
    },
  });
}
