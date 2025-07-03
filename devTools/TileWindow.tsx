import {
  type Accessor,
  type Component,
  createEffect,
  createSignal,
  Match,
  Show,
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
import { loadImage } from "#/lib/loadImage.ts";
import { type SceneData } from "#/lib/Scene.ts";
import {
  isDrawing,
  setIsDrawing,
  tileIndex,
  setTileIndex,
  tileset,
  setTileset,
  sceneData,
} from "#/devTools/main.tsx";

export const [isUnsynced, setIsUnsynced] = createSignal(false);

export const TileWindow: Component<{
  sceneData: Accessor<SceneData>;
}> = (props) => {
  const [isSyncing, setIsSyncing] = createSignal(false);
  const [syncError, setSyncError] = createSignal(null);

  function saveTilemap(): void {
    if (isSyncing()) {
      return;
    }

    setIsSyncing(true);
    setIsUnsynced(false);
    setSyncError(null);

    fetch(`http://${dev.host}:${dev.port}/dev`, {
      method: "POST",
      body: JSON.stringify(sceneData()),
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

  let xCount = 0;
  let yCount = 0;
  createEffect(() => {
    loadImage(props.sceneData().tileset).then((image) => {
      xCount = image.naturalWidth / pixelBase;
      yCount = image.naturalHeight / pixelBase;
      setTileset(image);
    });
  });

  return (
    <div class="tile-window">
      <div class="icon-bar">
        <button type="button" class="btn">
          <StackBackwardIcon />
        </button>
        <button type="button" class="btn">
          <StackForwardIcon />
        </button>
        <button type="button" class="btn" onClick={saveTilemap}>
          <Switch
            fallback={
              <span class={isSyncing() ? "rotate" : ""}>
                <RefreshIcon />
              </span>
            }
          >
            <Match when={syncError()}>
              <span class="error">
                <RefreshAlertIcon />
              </span>
            </Match>
            <Match when={isUnsynced()}>
              <span class="alert">
                <RefreshDotIcon />
              </span>
            </Match>
          </Switch>
        </button>
        <button
          type="button"
          class={"btn" + (isDrawing() ? " active" : "")}
          onClick={() => setIsDrawing(!isDrawing())}
        >
          <PencilIcon />
        </button>
      </div>

      <Show when={tileset()}>
        <div class="tileset">
          {[...Array(xCount * yCount)].map((_, index) => (
            <div
              class={"tileset-tile" + (tileIndex() === index ? " active" : "")}
              style={{
                ["width"]: `${tileSize}px`,
                ["height"]: `${tileSize}px`,
                ["background-image"]: `url(${tileset()!.src})`,
                ["background-position-x"]: `-${(index % xCount) * tileSize}px`,
                ["background-position-y"]: `-${
                  ((index / yCount) | 0) * tileSize
                }px`,
                ["background-size"]: `${
                  tileset()!.naturalWidth * scaleBase
                }px ${tileset()!.naturalHeight * scaleBase}px`,
              }}
              on:click={() => setTileIndex(index)}
            ></div>
          ))}
        </div>
      </Show>
    </div>
  );
};
