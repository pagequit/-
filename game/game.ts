import {
  createViewport,
  resizeViewport,
  resetViewport,
} from "#/lib/Viewport.ts";
import { usePointer, createPointer } from "#/lib/usePointer.ts";
import { sceneProxy, swapScene } from "#/game/scenes.ts";
import { drawDelta } from "#/game/misc.ts";

const gameContainer = document.createElement("div");
gameContainer.classList.add("game-container");

const canvasContainer = document.createElement("div");
canvasContainer.classList.add("canvas-container");

const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d", {
  alpha: false,
}) as CanvasRenderingContext2D;

export const viewport = createViewport(gameContainer, ctx);
export const pointer = createPointer();

usePointer(pointer, viewport)[0]();

function viewportResizeHandler(): void {
  resizeViewport(viewport, sceneProxy.current.width, sceneProxy.current.height);
}
self.addEventListener("resize", viewportResizeHandler);

let then: number = self.performance.now();
let delta: number = 0;
function animate(timestamp: number): void {
  self.requestAnimationFrame(animate);
  resetViewport(viewport);

  sceneProxy.current.process(delta);
  drawDelta(viewport, delta);

  delta = timestamp - then;
  then = timestamp;
}

export function render(
  appContainer: HTMLElement,
  sceneName: string,
): Promise<void> {
  canvasContainer.appendChild(canvas);
  gameContainer.appendChild(canvasContainer);
  appContainer.appendChild(gameContainer);

  return swapScene(sceneName).then(() => {
    animate(self.performance.now());
  });
}
