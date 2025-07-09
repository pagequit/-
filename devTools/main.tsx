import "#/devTools/styles.css";
import {
  type Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "#/devTools/AssetBrowser.tsx";
import { SceneBrowser } from "#/devTools/SceneBrowser.tsx";
import { TileWindow, setIsUnsynced } from "#/devTools/TileWindow.tsx";
import { RangeSlider } from "#/devTools/RangeSlider.tsx";
import { InputField } from "./InputField.tsx";
import { ZoomScanIcon } from "#/devTools/icons/index.ts";
import { placeViewport, zoomViewport, type Viewport } from "#/lib/Viewport.ts";
import { currentScene, drawTilemap } from "#/lib/Scene.ts";
import { viewport, pointer, delta, setIsPaused } from "#/game/game.ts";
import { createGrid, drawGrid } from "#/lib/Grid.ts";
import { pixelBase, tileSize } from "#/config.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";
import {
  createRectangle,
  isPointInRectangle,
  type Rectangle,
} from "#/lib/collision.ts";
import { loadImage } from "#/lib/loadImage.ts";

export const [sceneData, setSceneData] = createSignal(currentScene.data);
export const [isDrawing, setIsDrawing] = createSignal(false);
export const [tileCoord, setTileCoord] = createSignal(createVector());
export const [tileset, setTileset] = createSignal<HTMLImageElement | null>(
  null,
);
const [grid, setGrid] = createSignal(
  createGrid(tileSize, sceneData().xCount, sceneData().yCount),
);

const mouse: Vector = createVector();

const [boundingRectangle, setBoundingRectangle] = createSignal(
  getBoundingRectangle(),
);

function getBoundingRectangle(): Rectangle {
  const rect = viewport.ctx.canvas.getBoundingClientRect();

  return createRectangle(createVector(rect.x, rect.y), rect.width, rect.height);
}

function drawDelta({ ctx, translation, scale }: Viewport, delta: number): void {
  ctx.font = "16px monospace";
  ctx.fillStyle = "white";
  ctx.fillText(
    delta.toFixed(1),
    translation.x / scale.x + 8,
    translation.y / scale.y + 16,
  );
}

function animate(): void {
  self.requestAnimationFrame(animate);
  drawDelta(viewport, delta.value);

  if (isDrawing()) {
    if (pointer.isDown) {
      const x = (pointer.position.x / tileSize) | 0;
      const y = (pointer.position.y / tileSize) | 0;
      if (sceneData().tilemap[y][x] !== tileCoord()) {
        setIsUnsynced(true);
      }
      sceneData().tilemap[y][x] = tileCoord();
    }

    drawTilemap(tileset()!, sceneData(), viewport.ctx);
    if (isPointInRectangle(mouse, boundingRectangle())) {
      viewport.ctx.drawImage(
        tileset()!,
        tileCoord().x * pixelBase,
        tileCoord().y * pixelBase,
        pixelBase,
        pixelBase,
        ((pointer.position.x / tileSize) | 0) * tileSize,
        ((pointer.position.y / tileSize) | 0) * tileSize,
        tileSize,
        tileSize,
      );
    }
    drawGrid(grid(), viewport.ctx);
  }
}

export function use(appContainer: HTMLElement): void {
  render(() => <DevTools appContainer={appContainer} />, appContainer);
  animate();
}

const DevTools: Component<{
  appContainer: HTMLElement;
}> = ({ appContainer }) => {
  createEffect(() => {
    setGrid(createGrid(tileSize, sceneData().xCount, sceneData().yCount));
  });
  createEffect(() => {
    setIsPaused(isDrawing());
  });

  const gameContainer = appContainer.querySelector(
    ".game-container",
  ) as HTMLElement;

  function adjustGameContainerStyle(
    container: HTMLElement,
    width: number,
  ): void {
    container.style = `position: absolute; top: 0; left: ${width}px; width: ${
      self.innerWidth - width
    }px;`;
  }

  function stopResizeX() {
    resizeX = false;
  }

  const panVector = createVector();
  const panDelta = createVector();

  function handleMouseMove(event: MouseEvent | UIEvent) {
    mouse.x = (event as MouseEvent).clientX;
    mouse.y = (event as MouseEvent).clientY;

    if ((event as MouseEvent).buttons === 0) {
      panVector.x = mouse.x;
      panVector.y = mouse.y;

      return;
    }

    if ((event as MouseEvent).buttons === 2) {
      if (isDrawing()) {
        panDelta.x = panVector.x - mouse.x;
        panDelta.y = panVector.y - mouse.y;

        panVector.x = mouse.x;
        panVector.y = mouse.y;

        placeViewport(
          viewport,
          viewport.translation.x + panDelta.x,
          viewport.translation.y + panDelta.y,
          sceneData().width,
          sceneData().height,
        );
      }

      return;
    }

    let newWidth = width();
    if (resizeX) {
      newWidth = mouse.x;
    }
    newWidth = Math.min(newWidth, self.innerWidth - tileSize);

    setWidth(newWidth);
    adjustGameContainerStyle(gameContainer, newWidth);
    setBoundingRectangle(getBoundingRectangle());
  }

  const [width, setWidth] = createSignal(tileSize * 5);
  adjustGameContainerStyle(gameContainer, width());
  let resizeX = false;

  onMount(() => {
    self.addEventListener("mousemove", handleMouseMove);
    self.addEventListener("mouseup", stopResizeX);
    self.addEventListener("resize", handleMouseMove);
  });

  onCleanup(() => {
    self.removeEventListener("mousemove", handleMouseMove);
    self.removeEventListener("mouseup", stopResizeX);
    self.removeEventListener("resize", handleMouseMove);
  });

  const [scale, setScale] = createSignal(1);
  createEffect(() => {
    zoomViewport(viewport, scale(), sceneData().width, sceneData().height);
    setBoundingRectangle(getBoundingRectangle());
  });

  return (
    <div class="dev-container" style={{ width: `${width()}px` }}>
      <div class="dev-tools">
        <div class="dev-scale">
          <RangeSlider
            name="scale"
            min={0.5}
            max={1.5}
            step={0.25}
            value={scale()}
            onInput={(value) => setScale(value)}
          >
            <span role="button" onClick={() => setScale(1)}>
              <ZoomScanIcon />
            </span>
          </RangeSlider>
          <span>{scale().toFixed(2)}</span>
        </div>
        <hr />

        <TileWindow sceneData={sceneData} />

        <div class="tile-src">
          <InputField
            name="tileset"
            type="text"
            value={sceneData().tileset}
            onChange={(value) => {
              loadImage(value).then((image) => {
                setTileset(image);
              });
              sceneData().tileset = value;
            }}
          >
            <span>tileset</span>
          </InputField>
        </div>

        <div class="tile-ratio">
          <InputField
            name="xCount"
            type="number"
            value={sceneData().xCount.toString()}
            onChange={(value) => {
              const xCount = parseInt(value);
              if (sceneData().xCount === xCount) {
                return;
              }

              if (sceneData().xCount > xCount) {
                for (const row of sceneData().tilemap) {
                  row.unshift();
                }
              } else {
                for (const row of sceneData().tilemap) {
                  row.push(createVector());
                }
              }
              sceneData().xCount = xCount;
              sceneData().width = xCount * tileSize;
            }}
          >
            <span>xCount</span>
          </InputField>

          <InputField
            name="yCount"
            type="number"
            value={sceneData().yCount.toString()}
            onChange={(value) => {
              const yCount = parseInt(value);
              if (sceneData().yCount === yCount) {
                return;
              }

              if (sceneData().yCount > yCount) {
                sceneData().tilemap.unshift();
              } else {
                sceneData().tilemap.push(
                  [...Array(sceneData().xCount)].map(() => createVector()),
                );
              }
              sceneData().yCount = yCount;
              sceneData().height = yCount * tileSize;
            }}
          >
            <span>yCount</span>
          </InputField>
        </div>
        <hr />

        <SceneBrowser setSceneData={setSceneData} />
        <hr />

        <AssetBrowser />
      </div>

      <div class="dev-tools-resize" onMouseDown={() => (resizeX = true)}></div>
    </div>
  );
};
