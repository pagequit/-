import { type Accessor, type Component, createEffect, Show } from "solid-js";
import {
  FloppyDiscIcon,
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

function saveTilemap(): void {
  const body = JSON.stringify({
    name: sceneData().name,
    tilemap: sceneData().tilemap,
  });

  fetch(`http://${dev.host}:${dev.port}/dev`, {
    method: "POST",
    body,
  });
}

export const TileWindow: Component<{
  sceneData: Accessor<SceneData>;
}> = (props) => {
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
          <FloppyDiscIcon />
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
