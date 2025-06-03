import { tileSize } from "../constants.ts";
import { viewport } from "../../main.ts";
import { type Scene } from "../../lib/Scene.ts";
import { createGrid, drawGrid } from "../../lib/Grid.ts";
import { drawPoint } from "../misc.ts";
import { animateSprite } from "../../lib/Sprite.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { hero, getHeroGraphics, processHero } from "../Hero.ts";

const { ctx } = viewport;
const grid = createGrid(tileSize, 20, 15);
const width = grid.tileSize * grid.xSize;
const height = grid.tileSize * grid.ySize;

const asyncData = {
  hero: {},
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

function process(delta: number) {
  processHero(delta);
  focusViewport(viewport, hero.position.x, hero.position.y, width, height);
  animateSprite(
    asyncData.hero.walk,
    hero.position.x - hero.spriteOffset.x,
    hero.position.y - hero.spriteOffset.y,
    ctx,
    delta,
  );
  // does the animate function draw the sprite?
  // maybe its better if the processing part moves to the processing function
  // and then create a draw function that just draws (y-sorted) separately
  drawPoint(ctx, hero.position);

  drawGrid(grid, ctx);
}

export default async function (): Promise<Scene> {
  asyncData.hero.walk = await getHeroGraphics().walk;

  // FIXME:
  // that is a huge problem
  // hero.position.x = width / 2 - 32;
  // hero.position.y = height / 2 - 44;

  console.log("load testSceneTwo");

  return { width, height, process };
}
