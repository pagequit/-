import { createSignal, onCleanup, onMount, type Component } from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "./AssetBrowser.tsx";
import { SceneBrowser } from "./SceneBrowser.tsx";

export type MountableElement =
  | Element
  | Document
  | ShadowRoot
  | DocumentFragment
  | Node;

export function mountDevTools(appContainer: Element): void {
  const devToolsContainer = document.createElement("div");
  devToolsContainer.classList.add("dev-container");
  appContainer.appendChild(devToolsContainer);
  render(() => {
    return <DevTools />;
  }, devToolsContainer);
}

const DevTools: Component = () => {
  const [width, setWidth] = createSignal(240);
  let resize = false;

  function stopResize() {
    resize = false;
  }

  function handleResize(event: MouseEvent) {
    if (!resize) {
      return;
    }
    setWidth(event.clientX);
  }

  onMount(() => {
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  });

  return (
    <>
      <div class="dev-tools" style={`width: ${width()}px;`}>
        <div class="dev-tools-header">Dev-Tools</div>
        <SceneBrowser />
        <AssetBrowser />
      </div>
      <div class="dev-tools-resize" on:mousedown={() => (resize = true)}></div>
    </>
  );
};
