import {
  createViewport,
  resetViewport,
  resizeViewport,
} from "#/lib/Viewport.ts";
import { currentScene, swapScene } from "#/lib/Scene.ts";
import { createPointer, usePointer } from "#/lib/Pointer.ts";

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
  resizeViewport(viewport, currentScene.data.width, currentScene.data.height);
}
self.addEventListener("resize", viewportResizeHandler);

let then = self.performance.now();
export const delta = { value: 0 };
export const isPaused = { value: false };

function animate(timestamp: number): void {
  self.requestAnimationFrame(animate);
  resetViewport(viewport);

  // FIXME
  if (!isPaused.value) {
    currentScene.process(ctx, delta.value);
  }

  delta.value = timestamp - then;
  then = timestamp;
}

export async function start(
  appContainer: HTMLElement,
  sceneName: string,
): Promise<void> {
  canvasContainer.appendChild(canvas);
  gameContainer.appendChild(canvasContainer);
  appContainer.appendChild(gameContainer);

  await swapScene(viewport, sceneName);
  animate(then);
}
