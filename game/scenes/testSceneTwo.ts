import { tileSize } from "../constants.ts";
import { viewport } from "../../main.ts";
import { type Scene } from "../../lib/Scene.ts";
import { createGrid, drawGrid } from "../../lib/Grid.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { loadHero, processHero } from "../Hero.ts";

const { ctx } = viewport;
const grid = createGrid(tileSize, 20, 15);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const asyncData = {
  hero: {},
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

function process(delta: number) {
  processHero(delta);
  focusViewport(
    viewport,
    asyncData.hero.position.x,
    asyncData.hero.position.y,
    width,
    height,
  );

  drawGrid(grid, ctx);
}

export default async function (): Promise<Scene> {
  asyncData.hero = await loadHero();

  console.log("load testSceneTwo");

  return { width, height, process };
}
