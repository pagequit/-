import { resizeViewport } from "../lib/Viewport.ts";
import { createScene, type Scene, type SceneData } from "../lib/Scene.ts";
import {
  type Graph,
  type Edge,
  createGraph,
  getNeighbours,
} from "../lib/Graph.ts";
import { useWithAsyncCache } from "../lib/cache.ts";
import { viewport } from "../main.ts";

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

const sceneProxy: SceneProxy = {
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

export function getSceneProxy(): SceneProxy {
  return sceneProxy;
}

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
