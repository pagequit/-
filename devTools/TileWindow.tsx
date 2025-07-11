import {
  type Component,
  createMemo,
  createSignal,
  Match,
  Switch,
} from "solid-js";
import {
  RefreshIcon,
  RefreshAlertIcon,
  RefreshDotIcon,
  PencilIcon,
  StackBackwardIcon,
  StackForwardIcon,
} from "#/devTools/icons/index.ts";
import { dev, pixelBase, scaleBase, tileSize } from "#/config.ts";
import {
  isDrawing,
  setIsDrawing,
  tileCoord,
  setTileCoord,
  tileset,
  setSceneDataRef,
  isUnsynced,
  setIsUnsynced,
} from "#/devTools/main.tsx";
import { createVector } from "#/lib/Vector.ts";
import { currentScene } from "#/lib/Scene.ts";

export const TileWindow: Component = () => {
  const [isSyncing, setIsSyncing] = createSignal(false);
  const [syncError, setSyncError] = createSignal(null);

  function syncSceneData(): void {
    if (isSyncing()) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    fetch(`http://${dev.host}:${dev.port}/dev`, {
      method: "POST",
      body: JSON.stringify(currentScene.data),
    })
      .then(() => {
        setSceneDataRef(structuredClone(currentScene.data));
        setIsUnsynced(false);
      })
      .catch((error) => {
        setIsUnsynced(true);
        setSyncError(error);
        console.error(error);
      })
      .finally(() => {
        setIsSyncing(false);
      });
  }

  const xCount = createMemo(() =>
    tileset() ? tileset().naturalWidth / pixelBase : 0,
  );
  const yCount = createMemo(() =>
    tileset() ? tileset().naturalHeight / pixelBase : 0,
  );
  const xSize = createMemo(() =>
    tileset() ? tileset().naturalWidth * scaleBase : 0,
  );
  const ySize = createMemo(() =>
    tileset() ? tileset().naturalHeight * scaleBase : 0,
  );

  return (
    <div class="tile-window">
      <div class="icon-bar">
        <button type="button" class="btn">
          <StackBackwardIcon />
        </button>
        <button type="button" class="btn">
          <StackForwardIcon />
        </button>
        <button type="button" class="btn" onClick={syncSceneData}>
          <Switch
            fallback={
              <span class={isSyncing() ? "rotate" : undefined}>
                <RefreshIcon />
              </span>
            }
          >
            <Match when={syncError()}>
              <span class="c-error">
                <RefreshAlertIcon />
              </span>
            </Match>
            <Match when={isUnsynced()}>
              <span class="c-alert">
                <RefreshDotIcon />
              </span>
            </Match>
          </Switch>
        </button>
        <button
          type="button"
          class={"btn"}
          classList={{
            active: isDrawing(),
          }}
          onClick={() => setIsDrawing(!isDrawing())}
        >
          <PencilIcon />
        </button>
      </div>

      <div class="tileset">
        {[...Array(xCount() * yCount())].map((_, index) => {
          const x = index % xCount();
          const y = (index / yCount()) | 0;

          return (
            <div
              class={"tileset-tile"}
              classList={{
                active: tileCoord().x === x && tileCoord().y === y,
              }}
              style={{
                ["width"]: `${tileSize}px`,
                ["height"]: `${tileSize}px`,
                ["background-image"]: `url(${tileset().src})`,
                ["background-position-x"]: `-${x * tileSize}px`,
                ["background-position-y"]: `-${y * tileSize}px`,
                ["background-size"]: `${xSize()}px ${ySize()}px`,
              }}
              onClick={() => setTileCoord(createVector(x, y))}
            ></div>
          );
        })}
      </div>
    </div>
  );
};
