import {
  createResource,
  createSignal,
  Index,
  Show,
  type Component,
} from "solid-js";
import {
  FolderOpenIcon,
  FileDeltaIcon,
  FileMusicIcon,
  FileUnknownIcon,
} from "./icons/index.ts";

enum AssetType {
  Unkown,
  Image,
  Sound,
}

type Asset = {
  type: AssetType;
  name: string;
  path: string;
};

type Folder = Map<string, Asset | Folder>;

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
            return AssetType.Sound;
          }
          case "png":
          case "jpg": {
            return AssetType.Image;
          }
          default: {
            return AssetType.Unkown;
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
    const entries = `assets${entry}`.split("/");
    treeBuilder(root, entries, index, ref);

    return root;
  }, new Map() as Folder);
}

export const AssetBrowser: Component = () => {
  const [assetsIndex] = createSignal([]);
  const [index] = createResource(assetsIndex, fetchAssetIndex);
  const [previewItem, setPreviewItem] = createSignal("");

  function preview(file: Asset): void {
    switch (file.type) {
      case AssetType.Image: {
        setPreviewItem(file.path);
      }
    }
  }

  const AssetFile: Component<{ file: Asset }> = ({ file }) => {
    return (
      <div class="asset-label">
        <Show when={file.type === AssetType.Sound}>
          <FileMusicIcon />
        </Show>
        <Show when={file.type === AssetType.Image}>
          <FileDeltaIcon />
        </Show>
        <Show when={file.type === AssetType.Unkown}>
          <FileUnknownIcon />
        </Show>
        <span onClick={[preview, file]}>{file.name}</span>
      </div>
    );
  };

  function toggle(folder: Folder): void {
    console.log(folder);
  }

  const AssetFolder: Component<{ folder: Folder; name: string }> = ({
    folder,
    name,
  }) => {
    return (
      <>
        <div class="asset-label">
          <FolderOpenIcon />
          <span onClick={[toggle, folder]}>{name}</span>
        </div>
        <AssetEntry folder={folder} />
      </>
    );
  };

  const AssetEntry: Component<{ folder: Folder }> = ({ folder }) => {
    return (
      <ul class="asset-list">
        <Index each={[...folder.entries()]}>
          {(item) => {
            const [name, entry] = item();

            return (
              <li class="asset-item">
                {typeof (entry as Folder)[Symbol.iterator] === "function" ? (
                  <AssetFolder folder={entry as Folder} name={name} />
                ) : (
                  <AssetFile file={entry as Asset} />
                )}
              </li>
            );
          }}
        </Index>
      </ul>
    );
  };

  return (
    <div class="asset-browser">
      <Show when={index.loading}>
        <span>Loading...</span>
      </Show>
      <Show when={index.error}>
        <span>Error: {index.error}</span>
      </Show>
      <Show when={index()}>
        <AssetEntry folder={index() as Folder} />
      </Show>

      <div class="asset-preview">
        <Show when={previewItem().length > 0}>
          <img src={previewItem()} alt="" />
        </Show>
      </div>
    </div>
  );
};
