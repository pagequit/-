import { tileSize } from "#/game/constants.ts";
import { pointer, viewport } from "#/game/game.ts";
import { drawTilemap, type Tilemap, useScene } from "#/lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "#/lib/Grid.ts";
import {
  loadHero,
  processHero,
  setHeroCoords,
  setHeroPosition,
} from "#/game/Hero.ts";
import {
  circleCollideRectangle,
  isPointInRectangle,
  type Rectangle,
} from "#/lib/collision.ts";
import { drawRectangle } from "#/game/misc.ts";
import { loadImage } from "#/lib/loadImage";

// prettier-ignore
const tilemap: Tilemap = [
  [0,1,1,1,1,1,1,1,1,1,1,1,2,0,1,1,1,1,1,1,1,1,1,1,1,2],
  [5,6,6,6,6,6,6,6,6,6,6,6,7,5,6,6,6,6,6,6,6,6,6,6,6,7],
  [10,11,11,11,11,11,11,11,11,11,11,11,12,10,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,12,10,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,8,9,11,11,11,11,24,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,13,14,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,3,4,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,12,10,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,12,10,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,12,10,11,11,11,11,11,11,11,11,11,11,11,12],
  [10,11,11,11,11,11,11,11,11,11,11,11,12,10,11,11,11,11,11,11,11,11,11,11,11,12],
  [15,16,16,16,16,16,16,16,16,16,16,16,17,15,16,16,16,16,16,16,16,16,16,16,16,17],
];
const grid = createGrid(tileSize, tilemap[0].length, tilemap.length);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const sceneData = {
  name: "testSceneOne",
  tileset: "/assets/tileset.png",
  tilemap,
  xCount: grid.xCount,
  yCount: grid.yCount,
  width,
  height,
};

const { process, preProcess, linkScenes } = useScene(viewport, sceneData);

const swapScene = linkScenes(["testSceneTwo"]);

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (grid.xCount - 8) * grid.tileSize,
    y: (grid.yCount - 12) * grid.tileSize,
  },
};

const hero = await loadHero();
const tileset = await loadImage("/assets/tileset.png");

process((ctx, delta) => {
  drawTilemap(tileset, sceneData, ctx);
  highlightGridTile(grid, hero.position, ctx);

  processHero(delta);

  let color = "rgba(128, 128, 128, 0.5)";
  if (isPointInRectangle(pointer.position, aThing)) {
    color = "rgba(0, 0, 128, 0.5)";
  }
  drawRectangle(ctx, aThing.position, aThing.width, aThing.height, color);

  if (circleCollideRectangle(hero.collisionShape, aThing)) {
    swapScene("testSceneTwo").then(() => {
      setHeroCoords(10, 7);
    });
  }

  // drawGrid(grid, ctx);
});

preProcess(() => {
  setHeroPosition(tileSize * 15, tileSize * 5);
});

console.log("testSceneOne loaded");
