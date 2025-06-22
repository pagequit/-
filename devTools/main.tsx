import "./styles.css";
import { createSignal, onCleanup, onMount, type Component } from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "./AssetBrowser.tsx";
import { SceneBrowser } from "./SceneBrowser.tsx";
import { FloppyDiscIcon } from "./icons/FloppyDisc.tsx";
import { PencilIcon } from "./icons/Pencil.tsx";
import { StackBackwardIcon } from "./icons/StackBackward.tsx";
import { StackForwardIcon } from "./icons/StackForward.tsx";
import { type SceneProxy } from "../game/scenes.ts";

export function useDevTools(
  appContainer: HTMLElement,
  sceneProxy: SceneProxy,
): void {
  const canvasContainer = appContainer.querySelector(
    ".canvas-container",
  ) as HTMLElement;

  const overlayContainer = document.createElement("div");
  overlayContainer.classList.add("dev-overlay");
  // canvasContainer.appendChild(overlayContainer);
  // render(() => <DevOverlay />, overlayContainer);

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

  function getGameContainerStyle(width: number): string {
    return `position: absolute; top: 0; left: ${width}px; width: ${self.innerWidth - width}px;`;
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
    gameContainer.style = getGameContainerStyle(newWidth);
  }

  const [width, setWidth] = createSignal(240);
  gameContainer.style = getGameContainerStyle(width());
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

  return (
    <div class="dev-container" style={`width: ${width()}px;`}>
      <div class="dev-tools">
        <div class="tile-window">
          <div class="icon-bar">
            <button class="btn">
              <StackForwardIcon />
            </button>
            <button class="btn">
              <StackBackwardIcon />
            </button>
            <button class="btn">
              <FloppyDiscIcon />
            </button>
            <button class="btn">
              <PencilIcon />
            </button>
          </div>

          <img src={sceneProxy.current.data?.tileset} alt="" />
        </div>

        <SceneBrowser />
        <hr />

        <AssetBrowser />
      </div>

      <div class="dev-tools-resize" on:mousedown={() => (resizeX = true)}></div>
    </div>
  );
};
