import {
  createViewport,
  resizeViewport,
  resetViewport,
} from "./lib/Viewport.ts";
import { type Scene } from "./lib/Scene.ts";
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

const [bindPointer] = usePointer(pointer, viewport);
bindPointer();

self.addEventListener("keyup", ({ key }: KeyboardEvent) => {
  switch (key) {
    case "Escape": {
      swapScene();
      break;
    }
  }
});

type SceneNode = Node<{ name: string }>;
type SceneGraph = Graph<SceneNode>;

const testSceneOne: SceneNode = {
  name: "testSceneOne",
};

const testSceneTwo: SceneNode = {
  name: "testSceneTwo",
};

const testSceneThree: SceneNode = {
  name: "testSceneThree",
};

const scenes: Array<SceneNode> = [testSceneOne, testSceneTwo, testSceneThree];
const sceneEdges: Array<Edge<SceneNode>> = [
  [testSceneOne, testSceneTwo],
  [testSceneTwo, testSceneThree],
];
const sceneGraph: SceneGraph = createGraph(scenes, sceneEdges);

async function loadScene(name: string): Promise<Scene> {
  return (await import(`./game/scenes/${name}.ts`)).default();
}

const [loadSceneWithCache, sceneCache] = useWithAsyncCache(loadScene);

let sceneIndex = -1;
const currentScene: {
  value: Scene;
} = {
  value: null as unknown as Scene,
};

async function swapScene() {
  sceneIndex = ++sceneIndex > 2 ? 0 : sceneIndex;

  const scene = loadSceneWithCache(scenes[sceneIndex].name);
  const neighbours = getNeighbours(sceneGraph, scenes[sceneIndex]);
  for (const neighbour of neighbours) {
    if (!sceneCache.has(neighbour.name)) {
      sceneCache.set(neighbour.name, loadScene(neighbour.name));
    }
  }

  currentScene.value = await scene;
  resizeViewport(viewport, currentScene.value.width, currentScene.value.height);
}

function viewportResizeHandler(): void {
  resizeViewport(viewport, currentScene.value.width, currentScene.value.height);
}
self.addEventListener("resize", viewportResizeHandler);

let then: number = self.performance.now();
let delta: number = 0;
function animate(timestamp: number): void {
  self.requestAnimationFrame(animate);
  resetViewport(viewport);

  currentScene.value.process(delta);
  drawDelta(viewport, delta);

  delta = timestamp - then;
  then = timestamp;
}

swapScene().then(() => {
  resizeViewport(viewport, currentScene.value.width, currentScene.value.height);
  animate(then);
});
