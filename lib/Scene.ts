import { getNeighbours, type Edge, type Graph } from "./Graph.ts";
import { type Viewport, resizeViewport } from "./Viewport.ts";
import { useWithAsyncCache } from "./cache.ts";

export type Process = (ctx: CanvasRenderingContext2D, delta: number) => void;
export type PreProcess = () => void;
export type PostProcess = () => void;

export type Tilemap = Array<Array<number>>;

export type SceneData = {
  name: string;
  tileset: string;
  tilemap: Tilemap;
  xCount: number;
  yCount: number;
  width: number;
  height: number;
};

const [loadScene, sceneCache] = useWithAsyncCache((name: string) => {
  return import(`#/game/scenes/${name}.ts`);
});

const dataMap = new Map<string, SceneData>();
const processMap = new Map<string, Process>();
const preProcessMap = new Map<string, PreProcess>();
const postProcessMap = new Map<string, PostProcess>();

const sceneEdges: Array<Edge<string>> = [];
const sceneGraph: Graph<string> = new Map();

function linkScenes(a: string, b: string): void {
  sceneEdges.push([a, b]);

  if (sceneGraph.has(a)) {
    sceneGraph.get(a)!.push(b);
  } else {
    sceneGraph.set(a, [b]);
  }
}

export const currentScene: {
  data: SceneData;
  process: Process;
} = {
  data: {
    name: "",
    tileset: "",
    tilemap: [[]],
    xCount: 0,
    yCount: 0,
    width: 0,
    height: 0,
  },
  process() {},
};

export async function swapScene(
  viewport: Viewport,
  sceneName: string,
): Promise<void> {
  for (const neighbour of getNeighbours(sceneGraph, sceneName)) {
    if (!sceneCache.has(neighbour)) {
      sceneCache.set(neighbour, loadScene(neighbour));
    }
  }

  await loadScene(sceneName);

  const preProcess = preProcessMap.get(sceneName);
  if (preProcess) {
    preProcess();
  }

  const postProcess = postProcessMap.get(currentScene.data.name);
  if (postProcess) {
    postProcess();
  }

  currentScene.data = dataMap.get(sceneName) as SceneData;
  currentScene.process = processMap.get(sceneName) as Process;

  resizeViewport(viewport, currentScene.data.width, currentScene.data.height);
}

export function useScene(viewport: Viewport, sceneData: SceneData) {
  const sceneName = sceneData.name;
  dataMap.set(sceneName, sceneData);

  return {
    linkScenes(scenes: string[]): (sceneName: string) => Promise<void> {
      for (const scene of scenes) {
        linkScenes(sceneName, scene);
      }

      return (sceneName: string) => {
        return swapScene(viewport, sceneName);
      };
    },
    process(callback: Process): void {
      processMap.set(sceneName, callback);
    },
    preProcess(callback: PreProcess): void {
      preProcessMap.set(sceneName, callback);
    },
    postProcess(callback: PostProcess): void {
      postProcessMap.set(sceneName, callback);
    },
  };
}
