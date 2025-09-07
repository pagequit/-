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

const backCanvas = document.createElement("canvas");
const backCtx = backCanvas.getContext("2d", {
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

let paused = false;
export function setIsPaused(value: boolean): boolean {
  paused = value;
  if (paused) {
    backCanvas.width = canvas.width;
    backCanvas.height = canvas.height;
    backCtx.drawImage(canvas, 0, 0);
  }

  return paused;
}

export function isPaused(): boolean {
  return paused;
}

function animate(timestamp: number): void {
  delta.value = timestamp - then;
  then = timestamp;

  resetViewport(viewport);

  if (paused) {
    ctx.drawImage(
      backCanvas,
      viewport.translation.x / viewport.scale.x,
      viewport.translation.y / viewport.scale.y,
      ctx.canvas.width / viewport.scale.x,
      ctx.canvas.height / viewport.scale.y,
    );
  } else {
    currentScene.process(ctx, delta.value);
  }

  self.requestAnimationFrame(animate);
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
