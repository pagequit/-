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
import { TileWindow } from "#/devTools/TileWindow.tsx";
import { RangeSlider } from "#/devTools/RangeSlider.tsx";
import { InputField } from "./InputField.tsx";
import { ZoomScanIcon } from "#/devTools/icons/index.ts";
import {
  placeViewport,
  resizeViewport,
  type Viewport,
  zoomViewport,
} from "#/lib/Viewport.ts";
import { currentScene, drawTilemap, type SceneData } from "#/lib/Scene.ts";
import { delta, pointer, setIsPaused, viewport } from "#/game/game.ts";
import { createGrid, drawGrid, type Grid } from "#/lib/Grid.ts";
import { pixelBase, tileSize } from "#/config.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { objectEquals } from "#/lib/objectEquals.ts";

const { ctx } = viewport;

export const [isDrawing, setIsDrawing] = createSignal(false);
export const [tileCoord, setTileCoord] = createSignal<Vector>(createVector());
export const [tileset, setTileset] = createSignal<HTMLImageElement>(
  await loadImage(currentScene.data.tileset),
);
export const [isUnsynced, setIsUnsynced] = createSignal(false);
export const [sceneDataRef, setSceneDataRef] = createSignal<SceneData>(
  structuredClone(currentScene.data),
);

const grid: Grid = createGrid(
  tileSize,
  currentScene.data.xCount,
  currentScene.data.yCount,
);
const mouse: Vector = createVector();

function resetBoundings(): void {
  grid.xCount = currentScene.data.xCount;
  grid.yCount = currentScene.data.yCount;
  resizeViewport(viewport, currentScene.data.width, currentScene.data.height);
}

function isPointInDOMRect(point: Vector, rect: DOMRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function checkSyncState(): boolean {
  return setIsUnsynced(!objectEquals(sceneDataRef(), currentScene.data));
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
      currentScene.data.tilemap[y][x] = tileCoord();
      checkSyncState();
    }

    drawTilemap(tileset(), currentScene.data, ctx);
    if (isPointInDOMRect(mouse, ctx.canvas.getBoundingClientRect())) {
      ctx.drawImage(
        tileset(),
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
    drawGrid(grid, ctx);
  }
}

function adjustGameContainerStyle(container: HTMLElement, width: number): void {
  container.style = `position: absolute; top: 0; left: ${width}px; width: ${
    self.innerWidth - width
  }px;`;
}

const DevTools: Component<{
  appContainer: HTMLElement;
}> = ({ appContainer }) => {
  const [scale, setScale] = createSignal(1);
  const [width, setWidth] = createSignal(tileSize * 5);

  createEffect(() => {
    setIsPaused(isDrawing());
  });
  createEffect(() => {
    zoomViewport(
      viewport,
      scale(),
      currentScene.data.width,
      currentScene.data.height,
    );
  });

  const gameContainer = appContainer.querySelector(
    ".game-container",
  ) as HTMLElement;

  adjustGameContainerStyle(gameContainer, width());

  let resizeX = false;
  const stopResizeX = () => {
    resizeX = false;
  };

  const panVector = createVector();
  const panDelta = createVector();

  const handleMouseMove = (event: MouseEvent | UIEvent): void => {
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
          currentScene.data.width,
          currentScene.data.height,
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
    resetBoundings();
  };

  const handleXCountChange = (value: string): void => {
    const xCount = parseInt(value);

    if (currentScene.data.xCount > xCount) {
      for (const row of currentScene.data.tilemap) {
        row.length = xCount;
      }
    } else {
      for (const row of currentScene.data.tilemap) {
        row.push(createVector());
      }
    }

    currentScene.data.xCount = xCount;
    currentScene.data.width = xCount * tileSize;
    resetBoundings();
    checkSyncState();
  };

  const handleYCountChange = (value: string): void => {
    const yCount = parseInt(value);

    if (currentScene.data.yCount > yCount) {
      currentScene.data.tilemap.length = yCount;
    } else {
      currentScene.data.tilemap.push(
        [...Array(currentScene.data.xCount)].map(() => createVector()),
      );
    }

    currentScene.data.yCount = yCount;
    currentScene.data.height = yCount * tileSize;
    resetBoundings();
    checkSyncState();
  };

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
            onInput={setScale}
          >
            <span role="button" onClick={() => setScale(1)}>
              <ZoomScanIcon />
            </span>
          </RangeSlider>
          <span>{scale().toFixed(2)}</span>
        </div>
        <hr />

        <TileWindow />

        <div class="tile-src">
          <InputField
            name="tileset"
            type="text"
            value={currentScene.data.tileset}
            onChange={(value) => {
              loadImage(value).then((image) => {
                setTileset(image);
              });
              currentScene.data.tileset = value;
              checkSyncState();
            }}
          >
            <span>tileset</span>
          </InputField>
        </div>

        <div class="tile-ratio">
          <InputField
            name="xCount"
            type="number"
            value={currentScene.data.xCount.toString()}
            onChange={handleXCountChange}
          >
            <span>xCount</span>
          </InputField>

          <InputField
            name="yCount"
            type="number"
            value={currentScene.data.yCount.toString()}
            onChange={handleYCountChange}
          >
            <span>yCount</span>
          </InputField>
        </div>
        <hr />

        <SceneBrowser />
        <hr />

        <AssetBrowser />
      </div>

      <div class="dev-tools-resize" onMouseDown={() => (resizeX = true)}></div>
    </div>
  );
};

export function use(appContainer: HTMLElement): void {
  render(() => <DevTools appContainer={appContainer} />, appContainer);
  animate();
}
