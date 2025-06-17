import { type Component } from "solid-js";
import { render } from "solid-js/web";
import { AssetBrowser } from "./AssetBrowser.tsx";

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
  return (
    <div class="dev-tools">
      <div class="dev-tools-header">Dev-Tools</div>
      <AssetBrowser />
    </div>
  );
};
