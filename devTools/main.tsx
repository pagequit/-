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
import { handleDrawing, TileWindow } from "#/devTools/TileWindow.tsx";
import { RangeSlider } from "#/devTools/RangeSlider.tsx";
import { ZoomScanIcon } from "#/devTools/icons/index.ts";
import { type Viewport, zoomViewport } from "#/lib/Viewport.ts";
import { currentScene, type SceneData, onSceneSwap } from "#/lib/Scene.ts";
import { delta, viewport } from "#/game/game.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { objectEquals } from "#/lib/objectEquals.ts";

export const [tileset, setTileset] = createSignal<HTMLImageElement>(
  await loadImage(currentScene.data.tileset),
);
export const [isUnsynced, setIsUnsynced] = createSignal(false);
export const [sceneDataRef, setSceneDataRef] = createSignal<SceneData>(
  structuredClone(currentScene.data),
);

// TODO
onSceneSwap(console.log);

export function checkSyncState(): boolean {
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
  handleDrawing(viewport.ctx);
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
  const [width, setWidth] = createSignal(320);

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

  const handleResize = (event: MouseEvent | UIEvent): void => {
    let newWidth = width();
    if (resizeX) {
      newWidth = (event as MouseEvent).clientX;
    }
    newWidth = Math.min(newWidth, self.innerWidth);

    setWidth(newWidth);
    adjustGameContainerStyle(gameContainer, newWidth);
  };

  onMount(() => {
    self.addEventListener("mouseup", stopResizeX);
    self.addEventListener("mousemove", handleResize);
    self.addEventListener("resize", handleResize);
  });

  onCleanup(() => {
    self.removeEventListener("mouseup", stopResizeX);
    self.removeEventListener("mousemove", handleResize);
    self.removeEventListener("resize", handleResize);
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
