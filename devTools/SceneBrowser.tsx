import {
  createResource,
  createSignal,
  Index,
  Show,
  type Component,
} from "solid-js";
import { FolderOpenIcon, ScriptIcon, FolderIcon } from "./icons/index.ts";
import { swapScene } from "../main.ts";

type SceneEntry = { name: string };
type SceneFolder = Map<string, SceneEntry | SceneFolder>;

function sceneTreeBuilder(
  current: SceneFolder,
  entries: string[],
  index: number,
  ref: string[],
): void {
  const next = current.has(entries[0])
    ? (current.get(entries[0]) as SceneFolder)
    : (new Map() as SceneFolder);

  if (entries.length > 1) {
    current.set(entries.shift() as string, next);
    sceneTreeBuilder(next, entries, index, ref);
  } else {
    current.set(entries[0], {
      name: entries[0].substring(0, entries[0].length - 3),
    });
  }
}

async function fetchSceneIndex(): Promise<SceneFolder> {
  const indexRef: string[] = await (await fetch("/sceneindex.json")).json();

  return indexRef.reduce((root, entry, index) => {
    const entries = `scenes${entry}`.split("/");
    sceneTreeBuilder(root, entries, index, indexRef);

    return root;
  }, new Map() as SceneFolder);
}

export const SceneBrowser: Component = () => {
  const [sceneIndex] = createResource(createSignal([])[0], fetchSceneIndex);

  const SceneFile: Component<{ entry: SceneEntry }> = ({ entry }) => {
    return (
      <div class="file-label">
        <ScriptIcon />
        <span onClick={() => swapScene(entry.name)}>{entry.name}</span>
      </div>
    );
  };

  const SceneFolder: Component<{
    folder: SceneFolder;
    name: string;
    index: number;
  }> = ({ folder, name, index }) => {
    const [isOpen, setIsOpen] = createSignal(index < 1);

    return (
      <>
        <div class="file-label">
          {isOpen() ? <FolderOpenIcon /> : <FolderIcon />}
          <span onClick={() => setIsOpen(!isOpen())}>{name}</span>
        </div>

        <Show when={isOpen()}>
          <SceneEntry folder={folder} />
        </Show>
      </>
    );
  };

  const SceneEntry: Component<{ folder: SceneFolder }> = ({ folder }) => {
    return (
      <ul class="file-list">
        <Index each={[...folder.entries()]}>
          {(item, index) => {
            const [name, entry] = item();

            return (
              <li class="file-item">
                {typeof (entry as SceneFolder)[Symbol.iterator] ===
                "function" ? (
                  <SceneFolder
                    folder={entry as SceneFolder}
                    name={name}
                    index={index}
                  />
                ) : (
                  <SceneFile entry={entry as SceneEntry} />
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
        <Show when={sceneIndex.loading}>
          <span>Loading...</span>
        </Show>
        <Show when={sceneIndex.error}>
          <span>Error: {sceneIndex.error}</span>
        </Show>
        <Show when={sceneIndex()}>
          <SceneEntry folder={sceneIndex() as SceneFolder} />
        </Show>
      </div>
    </>
  );
};
