import {
  createEffect,
  createResource,
  createSignal,
  Index,
  Show,
  type JSXElement,
} from "solid-js";
import { render } from "solid-js/web";

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

function DevTools(): JSXElement {
  return (
    <div class="dev-tools">
      <div>DEVTOOLS</div>
      <AssetExplorer />
    </div>
  );
}

async function fetchAssetIndex(): Promise<string[]> {
  return (await fetch("/assetindex.json")).json();
}

function AssetExplorer(): JSXElement {
  const [assetsIndex] = createSignal([]);
  const [index] = createResource(assetsIndex, fetchAssetIndex);
  const [previewItem, setPreviewItem] = createSignal("");

  function preview(item: string): void {
    if (item.endsWith(".png")) {
      setPreviewItem(item);
    }
  }

  return (
    <>
      <Show when={index.loading}>
        <span>Loading...</span>
      </Show>
      <Show when={index.error}>
        <span>Error: {index.error}</span>
      </Show>
      <Show when={index()}>
        <ul class="asset-list">
          <Index each={index()}>
            {(item) => (
              <li class="asset-item" onClick={[preview, item()]}>
                {item()}
              </li>
            )}
          </Index>
        </ul>
      </Show>

      <div class="asset-preview">
        <Show when={previewItem().length > 0}>
          <img src={previewItem()} alt="" />
        </Show>
      </div>
    </>
  );
}
