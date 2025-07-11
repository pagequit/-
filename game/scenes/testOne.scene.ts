import { tileSize } from "#/config.ts";
import { pointer, viewport } from "#/game/game.ts";
import { drawTilemap, type SceneData, useScene } from "#/lib/Scene.ts";
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
import sceneData from "./testOne.json";

const { xCount, yCount, width, height }: SceneData = sceneData;
const { process, preProcess, linkScenes } = useScene(viewport, sceneData);

const swapScene = linkScenes(["testTwo"]);

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (xCount - 8) * tileSize,
    y: (yCount - 12) * tileSize,
  },
};

const hero = await loadHero();
const tileset = await loadImage(sceneData.tileset);

process((ctx, delta) => {
  drawTilemap(tileset, sceneData, ctx);

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
});

preProcess(() => {
  setHeroPosition(tileSize * 15, tileSize * 5);
});

console.log("testOne loaded");
