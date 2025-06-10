import {
  createViewport,
  resizeViewport,
  resetViewport,
} from "./lib/Viewport.ts";
import { createScene, type Scene } from "./lib/Scene.ts";
import {
  type Graph,
  type Edge,
  type Node,
  createGraph,
  getNeighbours,
} from "./lib/Graph.ts";
import { useWithAsyncCache } from "./lib/cache.ts";
import { usePointer, createPointer } from "./lib/usePointer.ts";
import { drawDelta } from "./game/misc.ts";

const gameContainer = document.querySelector(".game-container") as HTMLElement;
const canvas = gameContainer.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", {
  alpha: false,
}) as CanvasRenderingContext2D;

export const viewport = createViewport(ctx);
export const pointer = createPointer();
usePointer(pointer, viewport)[0]();

const [loadScene, sceneCache] = useWithAsyncCache(async (name: string) => {
  return (await import(`./game/scenes/${name}.ts`)).default();
});

export async function swapScene(name: string): Promise<void> {
  const nextScene = loadScene(name);
  const neighbours = getNeighbours(sceneGraph, scenes[sceneIndex]);
  for (const neighbour of neighbours) {
    if (!sceneCache.has(neighbour.name)) {
      sceneCache.set(neighbour.name, loadScene(neighbour.name));
    }
  }

  scene.next = await nextScene;
  scene.next.preProcess();
  scene.current.postProcess();
  scene.current = scene.next;
  resizeViewport(viewport, scene.current.width, scene.current.height);
}

type SceneNode = Node<{ name: string }>;
const scenes: Array<SceneNode> = [
  { name: "testSceneOne" },
  { name: "testSceneTwo" },
  { name: "testSceneThree" },
];

const sceneEdges: Array<Edge<SceneNode>> = [
  [scenes[0], scenes[1]],
  [scenes[1], scenes[2]],
];

const sceneGraph: Graph<SceneNode> = createGraph(scenes, sceneEdges);

const scene: {
  next: Scene;
  current: Scene;
} = {
  next: createScene({ width: 0, height: 0, process: () => {} }),
  current: createScene({ width: 0, height: 0, process: () => {} }),
};

// FIXME - I'm just for testing/developing!
let sceneIndex = 0;
self.addEventListener("keyup", ({ key }: KeyboardEvent) => {
  switch (key) {
    case "Escape": {
      sceneIndex = ++sceneIndex > 2 ? 0 : sceneIndex;
      swapScene(scenes[sceneIndex].name);
      break;
    }
  }
});

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
