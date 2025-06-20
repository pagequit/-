import {
  createViewport,
  resizeViewport,
  resetViewport,
} from "./lib/Viewport.ts";
import { createScene, type Scene, type SceneNode } from "./lib/Scene.ts";
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
import { mountDevTools } from "./devTools/main.tsx";

const appContainer = document.getElementById("app") as HTMLElement;

const gameContainer = document.createElement("div");
gameContainer.classList.add("game-container");

const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d", {
  alpha: false,
}) as CanvasRenderingContext2D;

mountDevTools(appContainer);
gameContainer.appendChild(canvas);
appContainer.appendChild(gameContainer);

export const viewport = createViewport(ctx);
export const pointer = createPointer();
usePointer(pointer, viewport)[0]();

const [loadScene, sceneCache] = useWithAsyncCache(async (name: string) => {
  return (await import(`./game/scenes/${name}.ts`)).default();
});

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

export async function swapScene(name: string): Promise<void> {
  const nextScene = loadScene(name);
  const neighbours = getNeighbours(
    sceneGraph,
    scenes.find((s) => s.name === name)!, // TODO
  );
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

const scene: {
  next: Scene;
  current: Scene;
} = {
  next: createScene({ width: 0, height: 0, process: () => {} }),
  current: createScene({ width: 0, height: 0, process: () => {} }),
};

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
