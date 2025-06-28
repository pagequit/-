import {
  createViewport,
  resizeViewport,
  resetViewport,
} from "#/lib/Viewport.ts";
import { usePointer, createPointer } from "#/lib/usePointer.ts";
import { drawDelta } from "#/game/misc.ts";
import { createScene, type Scene, type SceneData } from "#/lib/Scene.ts";
import {
  type Graph,
  type Edge,
  createGraph,
  getNeighbours,
} from "#/lib/Graph.ts";
import { useWithAsyncCache } from "#/lib/cache.ts";

const [loadScene, sceneCache] = useWithAsyncCache(async (name: string) => {
  return (await import(`./scenes/${name}.ts`)).default();
});

type SceneNode = { name: string };

export type SceneProxy = {
  next: Scene;
  current: Scene;
};

const scenes: Array<SceneNode> = [
  {
    name: "testSceneOne",
  },
  {
    name: "testSceneTwo",
  },
  {
    name: "testSceneThree",
  },
];

const sceneEdges: Array<Edge<SceneNode>> = [
  [scenes[0], scenes[1]],
  [scenes[1], scenes[2]],
];

const sceneGraph: Graph<SceneNode> = createGraph(scenes, sceneEdges);

export const sceneProxy: SceneProxy = {
  next: createScene({
    data: null as unknown as SceneData,
    width: 0,
    height: 0,
    process: () => {},
  }),
  current: createScene({
    data: null as unknown as SceneData,
    width: 0,
    height: 0,
    process: () => {},
  }),
};

export async function swapScene(name: string): Promise<void> {
  const sceneNode = scenes.find((s) => s.name === name) as SceneNode;

  const nextScene = loadScene(name);
  const neighbours = getNeighbours(sceneGraph, sceneNode);

  for (const neighbour of neighbours) {
    if (!sceneCache.has(neighbour.name)) {
      sceneCache.set(neighbour.name, loadScene(neighbour.name));
    }
  }

  sceneProxy.next = await nextScene;
  sceneProxy.next.preProcess();
  sceneProxy.current.postProcess();
  sceneProxy.current = sceneProxy.next;
  resizeViewport(viewport, sceneProxy.current.width, sceneProxy.current.height);
}

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

export async function render(
  appContainer: HTMLElement,
  sceneName: string,
): Promise<void> {
  canvasContainer.appendChild(canvas);
  gameContainer.appendChild(canvasContainer);
  appContainer.appendChild(gameContainer);

  await swapScene(sceneName);
  animate(self.performance.now());
}
