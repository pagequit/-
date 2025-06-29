import { tileSize } from "#/game/constants.ts";
import { viewport, pointer } from "#/game/game.ts";
import { useScene, type Tilemap } from "#/lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "#/lib/Grid.ts";
import {
  processHero,
  loadHero,
  setHeroPosition,
  setHeroCoords,
} from "#/game/Hero.ts";
import {
  circleCollideRectangle,
  isPointInRectangle,
  type Rectangle,
} from "#/lib/collision.ts";
import { drawRectangle } from "#/game/misc.ts";

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

const { process, preProcess, linkScenes } = useScene(viewport, {
  name: "testSceneOne",
  tileset: "/assets/tileset.png",
  tilemap,
  xCount: grid.xCount,
  yCount: grid.yCount,
  width,
  height,
});

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

process((ctx, delta) => {
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

  drawGrid(grid, ctx);
});

preProcess(() => {
  setHeroPosition(tileSize * 15, tileSize * 5);
});
