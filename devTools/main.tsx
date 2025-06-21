import {
  createSignal,
  onCleanup,
  onMount,
  Show,
  type Component,
} from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "./AssetBrowser.tsx";
import { SceneBrowser } from "./SceneBrowser.tsx";
import { type Scene } from "../lib/Scene.ts";
import { FloppyDiscIcon } from "./icons/FloppyDisc.tsx";
import { PencilIcon } from "./icons/Pencil.tsx";
import { StackBackwardIcon } from "./icons/StackBackward.tsx";
import { StackForwardIcon } from "./icons/StackForward.tsx";
import {
  createViewport,
  resetViewport,
  resizeViewport,
} from "../lib/Viewport.ts";
import { createPointer, usePointer } from "../lib/usePointer.ts";

const devOverlay = document.createElement("div");
devOverlay.classList.add("dev-overlay");

const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d", {
  alpha: true,
}) as CanvasRenderingContext2D;

const [scene, setScene] = createSignal<Scene | null>(null);

export function provideScene(scene: Scene): void {
  setScene(scene);
  resizeViewport(viewport, scene.width, scene.height);
}

export function mountDevTools(appContainer: HTMLElement): void {
  const devToolsContainer = document.createElement("div");
  devToolsContainer.classList.add("dev-container");
  appContainer.appendChild(devToolsContainer);

  render(() => <DevTools container={appContainer} />, devToolsContainer);
}

const viewport = createViewport(ctx);
const pointer = createPointer();

usePointer(pointer, viewport)[0]();

function viewportResizeHandler(): void {
  resizeViewport(viewport, scene()!.width, scene()!.height);
}
self.addEventListener("resize", viewportResizeHandler);

function animate(): void {
  self.requestAnimationFrame(animate);
  resetViewport(viewport);
}

const DevTools: Component<{ container: HTMLElement }> = ({ container }) => {
  const gameContainer = container.querySelector(
    ".game-container",
  ) as HTMLElement;
  devOverlay.appendChild(canvas);
  gameContainer.appendChild(devOverlay);

  const [width, setWidth] = createSignal(240);
  let resizeX = false;

  function stopResizeX() {
    resizeX = false;
  }

  function handleResize(event: MouseEvent) {
    if (!resizeX) {
      return;
    }
    setWidth(event.clientX);
  }

  onMount(() => {
    animate();

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResizeX);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResizeX);
  });

  return (
    <>
      <div class="dev-tools" style={`width: ${width()}px;`}>
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

          <Show when={scene()}>
            <img src={scene()!.data.tileset} alt="" />
          </Show>
        </div>

        <SceneBrowser />
        <hr />

        <AssetBrowser />
      </div>

      <div class="dev-tools-resize" on:mousedown={() => (resizeX = true)}></div>
    </>
  );
};
