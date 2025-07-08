import { viewport } from "#/game/game.ts";
import { loadImage } from "#/lib/loadImage";
import { drawTilemap, useScene } from "#/lib/Scene.ts";
import sceneData from "./testThree.json";

const { process, linkScenes } = useScene(viewport, sceneData);

const tileset = await loadImage(sceneData.tileset);

linkScenes(["testTwo"]);

process((ctx, _delta) => {
  drawTilemap(tileset, sceneData, ctx);
});

console.log("testThree loaded");
