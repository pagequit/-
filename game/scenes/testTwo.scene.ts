import { drawTilemap, useScene } from "#/lib/Scene.ts";
import { focusViewport } from "#/lib/Viewport.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { viewport } from "#/game/game.ts";
import { loadHero, processHero } from "#/game/Hero.ts";
import sceneData from "./testTwo.json";

const { process, linkScenes } = useScene(viewport, sceneData);

const tileset = await loadImage(sceneData.tileset);
const hero = await loadHero();

linkScenes(["testOne", "testThree"]);

process((ctx, delta) => {
  drawTilemap(tileset, sceneData, ctx);
  processHero(delta);
  focusViewport(
    viewport,
    hero.position.x,
    hero.position.y,
    sceneData.width,
    sceneData.height,
  );
});

console.log("testTwo loaded");
