import { tileSize } from "#/config.ts";
import { viewport } from "#/game/game.ts";
import { useScene } from "#/lib/Scene.ts";
import { createGrid } from "#/lib/Grid.ts";
import tilemap from "./testThree.json";

const grid = createGrid(tileSize, 16, 8);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const { process, linkScenes } = useScene(viewport, {
  name: "testThree",
  tileset: "/assets/tileset.png",
  tilemap: tilemap,
  xCount: grid.xCount,
  yCount: grid.yCount,
  width,
  height,
});

linkScenes(["testTwo"]);

process((_ctx, _delta) => {});
console.log("testThree loaded");
