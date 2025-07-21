import { viewport } from "#/game/game.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { drawTilemap, useScene } from "#/lib/Scene.ts";
import { placeViewport } from "#/lib/Viewport.ts";
import sceneData from "./testThree.json";

const { preProcess, process, linkScenes } = useScene(viewport, sceneData);

const tileset = await loadImage(sceneData.tileset);

linkScenes(["testTwo"]);

preProcess(() => {
  placeViewport(viewport, 0, 0, sceneData.width, sceneData.height);
});

process((ctx, _delta) => {
  drawTilemap(tileset, sceneData, ctx);
});

console.log("testThree loaded");
