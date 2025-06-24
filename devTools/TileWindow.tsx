import {
  createEffect,
  createSignal,
  Show,
  type Accessor,
  type Component,
} from "solid-js";
import {
  FloppyDiscIcon,
  PencilIcon,
  StackBackwardIcon,
  StackForwardIcon,
} from "./icons/index.ts";
import { scaleBase, tileSize } from "../game/constants.ts";
import { loadImage } from "../lib/loadImage.ts";
import { type Scene } from "../lib/Scene.ts";

export const TileWindow: Component<{
  scene: Accessor<Scene>;
}> = (props) => {
  const [tileset, setTileset] = createSignal<HTMLImageElement | null>(null);
  const [tileIndex, setTileIndex] = createSignal(0);

  let xCount = 0;
  let yCount = 0;
  createEffect(() => {
    loadImage(props.scene().data.tileset).then((image) => {
      xCount = (image.naturalWidth * scaleBase) / tileSize;
      yCount = (image.naturalHeight * scaleBase) / tileSize;
      setTileset(image);
    });
  });

  return (
    <div class="tile-window">
      <div class="icon-bar">
        <button class="btn">
          <StackBackwardIcon />
        </button>
        <button class="btn">
          <StackForwardIcon />
        </button>
        <button class="btn">
          <FloppyDiscIcon />
        </button>
        <button class="btn">
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
                ["background-position-y"]: `-${((index / yCount) | 0) * tileSize}px`,
                ["background-size"]: `${tileset()!.naturalWidth * scaleBase}px ${tileset()!.naturalHeight * scaleBase}px`,
              }}
              on:click={() => setTileIndex(index)}
            ></div>
          ))}
        </div>
      </Show>
    </div>
  );
};
