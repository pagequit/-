import { tileSize } from "#/config.ts";
import { pointer, viewport } from "#/game/game.ts";
import { useScene } from "#/lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "#/lib/Grid.ts";

const grid = createGrid(tileSize, 16, 8);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const { process, linkScenes } = useScene(viewport, {
  name: "testSceneThree",
  tileset: "/assets/tileset.png",
  tilemap: [[]],
  xCount: grid.xCount,
  yCount: grid.yCount,
  width,
  height,
});

linkScenes(["testSceneTwo"]);

process((ctx, _delta) => {
  // highlightGridTile(grid, pointer.position, ctx);
  // drawGrid(grid, ctx);
});

console.log("testSceneThree loaded");
