import { resizeViewport } from "../lib/Viewport.ts";
import { createScene, type Scene, type SceneData } from "../lib/Scene.ts";
import {
  type Graph,
  type Edge,
  createGraph,
  getNeighbours,
} from "../lib/Graph.ts";
import { useWithAsyncCache } from "../lib/cache.ts";
import { provideScene } from "../devTools/main.tsx";
import { viewport } from "../main.ts";

const [loadScene, sceneCache] = useWithAsyncCache(async (name: string) => {
  return (await import(`./scenes/${name}.ts`)).default();
});

export const scenes: Array<SceneData> = [
  {
    name: "testSceneOne",
    tileset: "/assets/tileset.png",
  },
  {
    name: "testSceneTwo",
    tileset: "/assets/tileset.png",
  },
  {
    name: "testSceneThree",
    tileset: "/assets/tileset.png",
  },
];

const sceneEdges: Array<Edge<SceneData>> = [
  [scenes[0], scenes[1]],
  [scenes[1], scenes[2]],
];

const sceneGraph: Graph<SceneData> = createGraph(scenes, sceneEdges);

export async function swapScene(name: string): Promise<void> {
  const sceneData = scenes.find((s) => s.name === name) as SceneData;

  const nextScene = loadScene(name);
  const neighbours = getNeighbours(sceneGraph, sceneData);

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

  provideScene(sceneData);
}

export const scene: {
  next: Scene;
  current: Scene;
} = {
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
