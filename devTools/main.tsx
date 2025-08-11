import "#/devTools/styles.css";
import {
  type Component,
  createEffect,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Switch,
} from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "#/devTools/AssetBrowser.tsx";
import { SceneBrowser } from "#/devTools/scene/SceneBrowser.tsx";
import { handleDrawing, TileWindow } from "#/devTools/scene/TileWindow.tsx";
import { ObjectWindow } from "./scene/ObjectWindow.tsx";
import { RangeSlider } from "#/devTools/RangeSlider.tsx";
import {
  LayoutGridIcon,
  PolygonIcon,
  ZoomScanIcon,
} from "#/devTools/icons/index.ts";
import { type Viewport, zoomViewport } from "#/lib/Viewport.ts";
import { currentScene } from "#/lib/Scene.ts";
import { delta, viewport } from "#/game/game.ts";

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

  const [currentTab, setCurrentTab] = createSignal(0);

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

        <div class="tab-head">
          <div
            role="button"
            class="tab-head-item"
            classList={{
              active: currentTab() === 0,
            }}
            onClick={() => setCurrentTab(0)}
          >
            <LayoutGridIcon />
          </div>
          <div
            role="button"
            class="tab-head-item"
            classList={{
              active: currentTab() === 1,
            }}
            onClick={() => setCurrentTab(1)}
          >
            <PolygonIcon />
          </div>
        </div>

        <div class="tab-body">
          <Switch>
            <Match when={currentTab() === 0}>
              <TileWindow />
            </Match>
            <Match when={currentTab() === 1}>
              <ObjectWindow />
            </Match>
          </Switch>
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
