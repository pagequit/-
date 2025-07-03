import { useScene } from "#/lib/Scene.ts";
import { createGrid, drawGrid } from "#/lib/Grid.ts";
import { focusViewport } from "#/lib/Viewport.ts";
import { tileSize } from "#/config.ts";
import { viewport } from "#/game/game.ts";
import { loadHero, processHero } from "#/game/Hero.ts";
import tilemap from "./testTwo.json";

const grid = createGrid(tileSize, 20, 15);
const width = grid.tileSize * grid.xCount;
const height = grid.tileSize * grid.yCount;

const { process, linkScenes } = useScene(viewport, {
  name: "testTwo",
  tileset: "/assets/hero/idle.png",
  tilemap: tilemap,
  xCount: grid.xCount,
  yCount: grid.yCount,
  width,
  height,
});

linkScenes(["testOne", "testThree"]);

const hero = await loadHero();

process((ctx, delta) => {
  processHero(delta);

  focusViewport(viewport, hero.position.x, hero.position.y, width, height);

  // drawGrid(grid, ctx);
});

console.log("testTwo loaded");
