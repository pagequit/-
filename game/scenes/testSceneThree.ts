import { tileSize } from "#/game/constants.ts";
import { viewport, pointer } from "#/game/game.ts";
import { createScene, type Scene, type SceneData } from "#/lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "#/lib/Grid.ts";

const grid = createGrid(tileSize, 16, 8);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncData = {} as any;

const data: SceneData = {
  name: "testSceneThree",
  tileset: "/assets/tileset.png",
};

function process(delta: number) {
  highlightGridTile(grid, pointer.position, viewport.ctx);
  drawGrid(grid, viewport.ctx);
}

export default async function (): Promise<Scene> {
  console.log("load testSceneThree");

  return createScene({ data, width, height, process });
}
