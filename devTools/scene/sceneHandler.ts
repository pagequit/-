import { createSignal } from "solid-js";
import { dev } from "#/config.ts";
import {
  currentScene,
  onSceneSwap,
  type SceneData,
  swapScene,
} from "#/lib/Scene.ts";
import { objectEquals } from "#/lib/objectEquals.ts";
import { viewport } from "#/game/game.ts";

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
export const [isUnsynced, setIsUnsynced] = createSignal(false);

export function checkSync(sceneData: SceneData): void {
  setIsUnsynced(!objectEquals(sceneDataRef(), sceneData));
}

onSceneSwap((sceneData: SceneData) => {
  self.location.hash = sceneData.name;

  setName(sceneData.name);
  setTileset(sceneData.tileset);
  setXCount(sceneData.xCount);
  setYCount(sceneData.yCount);

  fetch(`http://${dev.host}:${dev.port}/dev/${sceneData.name}`, {
    method: "GET",
  }).then(async (data) => {
    setSceneDataRef(await data.json());
    checkSync(sceneData);
  });
});

if (self.location.hash.length > 1) {
  const name = self.location.hash.substring(1);
  swapScene(viewport, name);
}
