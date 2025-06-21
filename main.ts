import {
  createViewport,
  resizeViewport,
  resetViewport,
} from "./lib/Viewport.ts";
import { usePointer, createPointer } from "./lib/usePointer.ts";
import { drawDelta } from "./game/misc.ts";
import { mountDevTools } from "./devTools/main.tsx";
import { scene, scenes, swapScene } from "./game/scenes.ts";

const appContainer = document.getElementById("app") as HTMLElement;

const gameContainer = document.createElement("div");
gameContainer.classList.add("game-container");

const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d", {
  alpha: false,
}) as CanvasRenderingContext2D;

gameContainer.appendChild(canvas);
appContainer.appendChild(gameContainer);

mountDevTools(appContainer);

export const viewport = createViewport(ctx);
export const pointer = createPointer();

usePointer(pointer, viewport)[0]();

function viewportResizeHandler(): void {
  resizeViewport(viewport, scene.current.width, scene.current.height);
}
self.addEventListener("resize", viewportResizeHandler);

let then: number = self.performance.now();
let delta: number = 0;
function animate(timestamp: number): void {
  self.requestAnimationFrame(animate);
  resetViewport(viewport);

  scene.current.process(delta);
  drawDelta(viewport, delta);

  delta = timestamp - then;
  then = timestamp;
}

swapScene(scenes[0].name).then(() => {
  animate(then);
});
