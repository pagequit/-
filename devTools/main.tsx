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
import { zoomViewport } from "#/lib/Viewport.ts";
import { viewport } from "#/game/game.ts";
import { currentScene } from "#/lib/Scene";

export function use(appContainer: HTMLElement): void {
  render(() => <DevTools appContainer={appContainer} />, appContainer);
}

const DevTools: Component<{
  appContainer: HTMLElement;
}> = ({ appContainer }) => {
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

  function handleResize(event: MouseEvent | UIEvent) {
    let newWidth = width();
    if (resizeX) {
      newWidth = (event as MouseEvent).clientX;
    }
    newWidth = Math.min(newWidth, self.innerWidth - 64);

    setWidth(newWidth);
    adjustGameContainerStyle(gameContainer, newWidth);
  }

  const [width, setWidth] = createSignal(256);
  adjustGameContainerStyle(gameContainer, width());
  let resizeX = false;

  onMount(() => {
    self.addEventListener("mousemove", handleResize);
    self.addEventListener("mouseup", stopResizeX);
    self.addEventListener("resize", handleResize);
  });

  onCleanup(() => {
    self.removeEventListener("mousemove", handleResize);
    self.removeEventListener("mouseup", stopResizeX);
    self.removeEventListener("resize", handleResize);
  });

  const [sceneData, setSceneData] = createSignal(currentScene.data);
  const [scale, setScale] = createSignal(1);

  createEffect(() => {
    zoomViewport(viewport, scale(), sceneData().width, sceneData().height);
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
