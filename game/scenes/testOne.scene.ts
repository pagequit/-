import { tileSize } from "#/config.ts";
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
import { focusViewport } from "#/lib/Viewport";
import tilemap from "./testOne.json";

const grid = createGrid(tileSize, tilemap[0].length, tilemap.length);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const sceneData = {
  name: "testOne",
  tileset: "/assets/tileset.png",
  tilemap,
  xCount: grid.xCount,
  yCount: grid.yCount,
  width,
  height,
};

const { process, preProcess, linkScenes } = useScene(viewport, sceneData);

const swapScene = linkScenes(["testTwo"]);

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
  focusViewport(viewport, hero.position.x, hero.position.y, width, height);

  let color = "rgba(128, 128, 128, 0.5)";
  if (isPointInRectangle(pointer.position, aThing)) {
    color = "rgba(0, 0, 128, 0.5)";
  }
  drawRectangle(ctx, aThing.position, aThing.width, aThing.height, color);

  if (circleCollideRectangle(hero.collisionShape, aThing)) {
    swapScene("testTwo").then(() => {
      setHeroCoords(10, 7);
    });
  }

  // drawGrid(grid, ctx);
});

preProcess(() => {
  setHeroPosition(tileSize * 15, tileSize * 5);
});

console.log("testOne loaded");
