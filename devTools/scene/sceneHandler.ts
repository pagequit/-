import { createSignal } from "solid-js";
import {
  currentScene,
  type SceneData,
  onSceneSwap,
  swapScene,
} from "#/lib/Scene.ts";
import { viewport } from "#/game/game.ts";

if (self.location.hash.length > 1) {
  const name = self.location.hash.substring(1);
  await swapScene(viewport, name);
}

export const [name, setName] = createSignal<string>(currentScene.data.name);
export const [tileset, setTileset] = createSignal<string>(
  currentScene.data.tileset,
);
export const [xCount, setXCount] = createSignal<number>(
  currentScene.data.xCount,
);
export const [yCount, setYCount] = createSignal<number>(
  currentScene.data.yCount,
);
export const [sceneDataRef, setSceneDataRef] = createSignal<SceneData>(
  structuredClone(currentScene.data),
);

onSceneSwap((sceneData: SceneData) => {
  self.location.hash = sceneData.name;

  setName(sceneData.name);
  setTileset(sceneData.tileset);
  setXCount(sceneData.xCount);
  setYCount(sceneData.yCount);

  setSceneDataRef(structuredClone(sceneData));
});
