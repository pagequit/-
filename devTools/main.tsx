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
import { ZoomScanIcon } from "#/devTools/icons/index.ts";
import { zoomViewport, type Viewport } from "#/lib/Viewport.ts";
import { currentScene, drawTilemap } from "#/lib/Scene.ts";
import { viewport, pointer, delta, setIsPaused } from "#/game/game.ts";
import { createGrid, drawGrid } from "#/lib/Grid.ts";
import { pixelBase, tileSize } from "#/config.ts";
import { setIsUnsynced } from "#/devTools/TileWindow.tsx";
import { createVector, type Vector } from "#/lib/Vector";
import {
  createRectangle,
  isPointInRectangle,
  type Rectangle,
} from "#/lib/collision";

export const [sceneData, setSceneData] = createSignal(currentScene.data);
export const [isDrawing, setIsDrawing] = createSignal(false);
export const [tileIndex, setTileIndex] = createSignal(0);
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
      if (sceneData().tilemap[y][x] !== tileIndex()) {
        setIsUnsynced(true);
      }
      sceneData().tilemap[y][x] = tileIndex();
    }

    drawTilemap(tileset()!, sceneData(), viewport.ctx);
    if (isPointInRectangle(mouse, boundingRectangle())) {
      viewport.ctx.drawImage(
        tileset()!,
        (tileIndex() % (tileset()!.naturalWidth / pixelBase)) * pixelBase,
        ((tileIndex() / (tileset()!.naturalWidth / pixelBase)) | 0) * pixelBase,
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
    setBoundingRectangle(getBoundingRectangle());
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

  function handleMouseMove(event: MouseEvent | UIEvent) {
    mouse.x = (event as MouseEvent).clientX;
    mouse.y = (event as MouseEvent).clientY;

    let newWidth = width();
    if (resizeX) {
      newWidth = mouse.x;
    }
    newWidth = Math.min(newWidth, self.innerWidth - 64);

    setWidth(newWidth);
    adjustGameContainerStyle(gameContainer, newWidth);
  }

  const [width, setWidth] = createSignal(256);
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
            step={0.1}
            value={scale()}
            onInput={(value) => setScale(value)}
          >
            <span role="button" onClick={() => setScale(1)}>
              <ZoomScanIcon />
            </span>
          </RangeSlider>
          <span>{scale().toFixed(1)}</span>
        </div>
        <hr />

        <TileWindow sceneData={sceneData} />
        <hr />

        <SceneBrowser setSceneData={setSceneData} />
        <hr />

        <AssetBrowser />
      </div>

      <div class="dev-tools-resize" onMouseDown={() => (resizeX = true)}></div>
    </div>
  );
};
