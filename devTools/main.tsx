import {
  createResource,
  createSignal,
  Index,
  Show,
  type Component,
} from "solid-js";
import { render } from "solid-js/web";
import {
  FolderOpenIcon,
  FileDeltaIcon,
  FileMusicIcon,
  FileUnknownIcon,
} from "./icons/index.ts";

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

enum FileType {
  Unkown,
  Image,
  Sound,
}
type File = {
  type: FileType;
  name: string;
  path: string;
};
type Folder = Map<string, File | Folder>;

function treeBuilder(
  current: Folder,
  entries: string[],
  index: number,
  ref: string[],
) {
  const next = current.has(entries[0])
    ? (current.get(entries[0]) as Folder)
    : (new Map() as Folder);

  if (entries.length > 1) {
    current.set(entries.shift() as string, next);
    treeBuilder(next, entries, index, ref);
  } else {
    current.set(entries[0], {
      type: ((ext: string) => {
        switch (ext) {
          case "wav":
          case "mp3": {
            return FileType.Sound;
          }
          case "png":
          case "jpg": {
            return FileType.Image;
          }
          default: {
            return FileType.Unkown;
          }
        }
      })(entries[0].substring(entries[0].length - 3)),
      name: entries[0],
      path: `/assets${ref[index]}`,
    });
  }
}

async function fetchAssetIndex(): Promise<Folder> {
  const ref: string[] = await (await fetch("/assets/index.json")).json();

  return ref.reduce((root, entry, index) => {
    const entries = entry.split("/");
    treeBuilder(root, entries, index, ref);

    return root;
  }, new Map() as Folder);
}

const AssetBrowser: Component = () => {
  const [assetsIndex] = createSignal([]);
  const [index] = createResource(assetsIndex, fetchAssetIndex);
  const [previewItem, setPreviewItem] = createSignal("");

  function preview(file: File): void {
    switch (file.type) {
      case FileType.Image: {
        setPreviewItem(file.path);
      }
    }
  }

  const AssetFolder: Component<{ folder: Folder }> = ({ folder }) => {
    return (
      <ul class="asset-list">
        <Index each={[...folder.entries()]}>
          {(item) => (
            <li class="asset-item">
              {typeof (item()[1] as Folder)[Symbol.iterator] === "function" ? (
                <>
                  <div class="asset-label">
                    <FolderOpenIcon />
                    {item()[0]}
                  </div>
                  <AssetFolder folder={item()[1] as Folder} />
                </>
              ) : (
                <div class="asset-label">
                  <Show when={(item()[1] as File).type === FileType.Sound}>
                    <FileMusicIcon />
                  </Show>
                  <Show when={(item()[1] as File).type === FileType.Image}>
                    <FileDeltaIcon />
                  </Show>
                  <Show when={(item()[1] as File).type === FileType.Unkown}>
                    <FileUnknownIcon />
                  </Show>
                  <span onClick={[preview, item()[1] as File]}>
                    {item()[0]}
                  </span>
                </div>
              )}
            </li>
          )}
        </Index>
      </ul>
    );
  };

  return (
    <>
      <Show when={index.loading}>
        <span>Loading...</span>
      </Show>
      <Show when={index.error}>
        <span>Error: {index.error}</span>
      </Show>
      <Show when={index()}>
        <AssetFolder folder={index() as Folder} />
      </Show>

      <div class="asset-preview">
        <Show when={previewItem().length > 0}>
          <img src={previewItem()} alt="" />
        </Show>
      </div>
    </>
  );
};
