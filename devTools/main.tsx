import "./styles.css";
import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type Component,
} from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "./AssetBrowser.tsx";
import { SceneBrowser } from "./SceneBrowser.tsx";
import { type SceneProxy } from "../game/scenes.ts";
import { TileWindow } from "./TileWindow.tsx";
import { RangeSlider } from "./RangeSlider.tsx";
import { ZoomScanIcon } from "./icons/index.ts";
import { zoomViewport } from "../lib/Viewport.ts";
import { viewport } from "../main.ts";

export function useDevTools(
  appContainer: HTMLElement,
  sceneProxy: SceneProxy,
): void {
  const canvasContainer = appContainer.querySelector(
    ".canvas-container",
  ) as HTMLElement;

  const overlayContainer = document.createElement("div");
  overlayContainer.classList.add("dev-overlay");
  canvasContainer.appendChild(overlayContainer);
  render(() => <DevOverlay />, overlayContainer);

  render(
    () => <DevTools sceneProxy={sceneProxy} appContainer={appContainer} />,
    appContainer,
  );
}

const DevOverlay: Component = () => <>FIXME</>;

const DevTools: Component<{
  sceneProxy: SceneProxy;
  appContainer: HTMLElement;
}> = ({ sceneProxy, appContainer }) => {
  const gameContainer = appContainer.querySelector(
    ".game-container",
  ) as HTMLElement;

  function adjustGameContainerStyle(
    container: HTMLElement,
    width: number,
  ): void {
    container.style = `position: absolute; top: 0; left: ${width}px; width: ${self.innerWidth - width}px;`;
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

  const [scale, setScale] = createSignal(1);
  createEffect(() => {
    zoomViewport(
      viewport,
      scale(),
      sceneProxy.current.width,
      sceneProxy.current.height,
    );
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

        <TileWindow sceneProxy={sceneProxy} />
        <hr />

        <SceneBrowser />
        <hr />

        <AssetBrowser />
      </div>

      <div class="dev-tools-resize" onMouseDown={() => (resizeX = true)}></div>
    </div>
  );
};
