import { type Vector } from "./Vector.ts";
import { getNeighbours, type Graph } from "./Graph.ts";
import { resizeViewport, type Viewport } from "./Viewport.ts";
import { useWithAsyncCache } from "./cache.ts";

import { pixelBase, tileSize } from "#/config.ts";

export type Process = (ctx: CanvasRenderingContext2D, delta: number) => void;
export type PreProcess = () => void;
export type PostProcess = () => void;

export type Tilemap = Array<Array<Vector>>;

export type SceneData = {
  name: string;
  tileset: string;
  tilemap: Tilemap;
  xCount: number;
  yCount: number;
  width: number;
  height: number;
};

export function createRawSceneData(): SceneData {
  return {
    name: "",
    tileset: "",
    tilemap: [[]],
    xCount: 0,
    yCount: 0,
    width: 0,
    height: 0,
  };
}

export function drawTilemap(
  tileset: HTMLImageElement,
  { tilemap, xCount, yCount }: SceneData,
  ctx: CanvasRenderingContext2D,
): void {
  for (let y = 0; yCount > y; y++) {
    for (let x = 0; xCount > x; x++) {
      ctx.drawImage(
        tileset,
        tilemap[y][x].x * pixelBase,
        tilemap[y][x].y * pixelBase,
        pixelBase,
        pixelBase,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize,
      );
    }
  }
}

const [loadScene, sceneCache] = useWithAsyncCache((name: string) => {
  return import(`#/game/scenes/${name}.scene.ts`);
});

const dataMap = new Map<string, SceneData>();
const processMap = new Map<string, Process>();
const preProcessMap = new Map<string, PreProcess>();
const postProcessMap = new Map<string, PostProcess>();

const sceneGraph: Graph<string> = new Map();

function linkScenes(a: string, b: string): void {
  if (sceneGraph.has(a)) {
    sceneGraph.get(a)!.push(b);
  } else {
    sceneGraph.set(a, [b]);
  }
}

const onSceneSwapProxy = {
  callback: (_: SceneData, __: SceneData) => {},
};

export function onSceneSwap(
  callback: (to: SceneData, from: SceneData) => void,
): void {
  onSceneSwapProxy.callback = callback;
}

export const currentScene: {
  data: SceneData;
  process: Process;
} = {
  data: createRawSceneData(),
  process: () => {},
};

export async function swapScene(
  viewport: Viewport,
  sceneName: string,
): Promise<void> {
  await loadScene(sceneName);

  for (const neighbour of getNeighbours(sceneGraph, sceneName)) {
    if (!sceneCache.has(neighbour)) {
      sceneCache.set(neighbour, loadScene(neighbour));
    }
  }

  const preProcess = preProcessMap.get(sceneName);
  if (preProcess) {
    preProcess();
  }

  const postProcess = postProcessMap.get(currentScene.data.name);
  if (postProcess) {
    postProcess();
  }

  const nextSceneData = dataMap.get(sceneName) as SceneData;
  onSceneSwapProxy.callback(nextSceneData, currentScene.data);
  currentScene.data = nextSceneData;
  resizeViewport(viewport, currentScene.data.width, currentScene.data.height);

  currentScene.process = processMap.get(sceneName) as Process;
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
