import {
  type Component,
  createResource,
  createSignal,
  Index,
  Match,
  Show,
  Switch,
} from "solid-js";
import {
  FileDeltaIcon,
  FileMusicIcon,
  FileUnknownIcon,
  FolderIcon,
  FolderOpenIcon,
} from "#/devTools/icons/index.ts";

enum AssetType {
  Unkown,
  Image,
  Sound,
}

type AssetFile = {
  type: AssetType;
  name: string;
  path: string;
};

type AssetFolder = Map<string, AssetFile | AssetFolder>;

function assetTreeBuilder(
  current: AssetFolder,
  entries: string[],
  index: number,
  ref: string[],
): void {
  const next = current.has(entries[0])
    ? (current.get(entries[0]) as AssetFolder)
    : (new Map() as AssetFolder);

  if (entries.length > 1) {
    current.set(entries.shift() as string, next);
    assetTreeBuilder(next, entries, index, ref);
  } else {
    current.set(entries[0], {
      type: ((extension: string) => {
        switch (extension) {
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

async function fetchAssetIndex(): Promise<AssetFolder> {
  const indexRef: string[] = await (await fetch("/assetindex.json")).json();

  return indexRef.reduce((root, entry, index) => {
    const entries = `assets${entry}`.split("/");
    assetTreeBuilder(root, entries, index, indexRef);

    return root;
  }, new Map() as AssetFolder);
}

export const AssetBrowser: Component = () => {
  const [assetIndex] = createResource(createSignal([])[0], fetchAssetIndex);
  const [previewItem, setPreviewItem] = createSignal("");

  function preview(asset: AssetFile): void {
    switch (asset.type) {
      case AssetType.Image: {
        setPreviewItem(asset.path);
        break;
      }
      default: {
        console.warn("TODO");
      }
    }
  }

  const AssetFile: Component<{ asset: AssetFile }> = ({ asset }) => {
    return (
      <div class="file-label" onClick={[preview, asset]}>
        <Switch fallback={<FileUnknownIcon />}>
          <Match when={asset.type === AssetType.Sound}>
            <FileMusicIcon />
          </Match>
          <Match when={asset.type === AssetType.Image}>
            <FileDeltaIcon />
          </Match>
        </Switch>
        <span>{asset.name}</span>
      </div>
    );
  };

  const AssetFolder: Component<{
    folder: AssetFolder;
    name: string;
    index: number;
  }> = ({ folder, name, index }) => {
    const [isOpen, setIsOpen] = createSignal(index < 1);

    return (
      <>
        <div class="file-label" onClick={() => setIsOpen(!isOpen())}>
          {isOpen() ? <FolderOpenIcon /> : <FolderIcon />}
          <span>{name}</span>
        </div>

        <Show when={isOpen()}>
          <AssetEntry folder={folder} />
        </Show>
      </>
    );
  };

  const AssetEntry: Component<{ folder: AssetFolder }> = ({ folder }) => {
    return (
      <ul class="file-list">
        <Index each={[...folder.entries()]}>
          {(item, index) => {
            const [name, entry] = item();

            return (
              <li class="file-item">
                {typeof (entry as AssetFolder)[Symbol.iterator] ===
                "function" ? (
                  <AssetFolder
                    folder={entry as AssetFolder}
                    name={name}
                    index={index}
                  />
                ) : (
                  <AssetFile asset={entry as AssetFile} />
                )}
              </li>
            );
          }}
        </Index>
      </ul>
    );
  };

  return (
    <>
      <div class="file-browser">
        <Show when={assetIndex.loading}>
          <span>Loading...</span>
        </Show>
        <Show when={assetIndex.error}>
          <span>Error: {assetIndex.error}</span>
        </Show>
        <Show when={assetIndex()}>
          <AssetEntry folder={assetIndex() as AssetFolder} />
        </Show>
      </div>
      <div class="asset-preview">
        <Show when={previewItem().length > 0}>
          <code>{previewItem()}</code>
          <img src={previewItem()} alt="" />
        </Show>
      </div>
    </>
  );
};
