import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Switch,
} from "solid-js";
import {
  PencilIcon,
  RefreshAlertIcon,
  RefreshDotIcon,
  RefreshIcon,
  StackBackwardIcon,
  StackForwardIcon,
} from "#/devTools/icons/index.ts";
import { dev, pixelBase, scaleBase, tileSize } from "#/config.ts";
import {
  checkSyncState,
  isUnsynced,
  setIsUnsynced,
  setSceneDataRef,
  setTileset,
  tileset,
} from "#/devTools/main.tsx";
import { InputField } from "./InputField.tsx";
import { createVector, type Vector } from "#/lib/Vector.ts";
import { currentScene, drawTilemap } from "#/lib/Scene.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { createGrid, drawGrid, type Grid } from "#/lib/Grid.ts";
import { placeViewport, resizeViewport } from "#/lib/Viewport.ts";
import { pointer, setIsPaused, viewport } from "#/game/game.ts";

const [tileCoord, setTileCoord] = createSignal<Vector>(createVector());
const [isDrawing, setIsDrawing] = createSignal(false);
const mouse: Vector = createVector();
const grid: Grid = createGrid(
  tileSize,
  currentScene.data.xCount,
  currentScene.data.yCount,
);

function resizeBoundings(): void {
  grid.xCount = currentScene.data.xCount;
  grid.yCount = currentScene.data.yCount;
  console.log(currentScene.data);
  resizeViewport(viewport, currentScene.data.width, currentScene.data.height);
}

function isPointInDOMRect(point: Vector, rect: DOMRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function handleDrawing(ctx: CanvasRenderingContext2D): void {
  if (isDrawing()) {
    if (pointer.isDown) {
      const x = (pointer.position.x / tileSize) | 0;
      const y = (pointer.position.y / tileSize) | 0;
      currentScene.data.tilemap[y][x] = tileCoord();
      checkSyncState();
    }

    drawTilemap(tileset(), currentScene.data, ctx);
    if (isPointInDOMRect(mouse, ctx.canvas.getBoundingClientRect())) {
      ctx.drawImage(
        tileset(),
        tileCoord().x * pixelBase,
        tileCoord().y * pixelBase,
        pixelBase,
        pixelBase,
        ((pointer.position.x / tileSize) | 0) * tileSize,
        ((pointer.position.y / tileSize) | 0) * tileSize,
        tileSize,
        tileSize,
      );
    }
    drawGrid(grid, ctx);
  }
}

export const TileWindow: Component = () => {
  const [isSyncing, setIsSyncing] = createSignal(false);
  const [syncError, setSyncError] = createSignal(null);

  const [dataXCount, setDataXCount] = createSignal(currentScene.data.xCount);
  const [dataYCount, setDataYCount] = createSignal(currentScene.data.yCount);
  const [dataTileset, setDataTileset] = createSignal(currentScene.data.tileset);

  // TODO
  createEffect(() => {
    if (tileset()) {
      setDataXCount(currentScene.data.xCount);
      setDataYCount(currentScene.data.yCount);
      setDataTileset(currentScene.data.tileset);
    }
  });

  const handleXCountChange = (value: string): void => {
    setDataXCount(parseInt(value));

    if (currentScene.data.xCount > dataXCount()) {
      for (const row of currentScene.data.tilemap) {
        row.length = dataXCount();
      }
    } else {
      for (const row of currentScene.data.tilemap) {
        row.push(createVector());
      }
    }

    currentScene.data.xCount = dataXCount();
    currentScene.data.width = dataXCount() * tileSize;
    resizeBoundings();
    checkSyncState();
  };

  const handleYCountChange = (value: string): void => {
    setDataYCount(parseInt(value));

    if (currentScene.data.yCount > dataYCount()) {
      currentScene.data.tilemap.length = dataYCount();
    } else {
      currentScene.data.tilemap.push(
        [...Array(currentScene.data.xCount)].map(() => createVector()),
      );
    }

    currentScene.data.yCount = dataYCount();
    currentScene.data.height = dataYCount() * tileSize;
    resizeBoundings();
    checkSyncState();
  };

  const panOrigin: Vector = createVector();
  const panDelta: Vector = createVector();

  const handleMouse = (event: MouseEvent): void => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    switch (event.buttons) {
      case 0: {
        break;
      }
      case 1: {
        break;
      }
      case 2: {
        if (isDrawing()) {
          panDelta.x = panOrigin.x - mouse.x;
          panDelta.y = panOrigin.y - mouse.y;

          placeViewport(
            viewport,
            viewport.translation.x + panDelta.x,
            viewport.translation.y + panDelta.y,
            currentScene.data.width,
            currentScene.data.height,
          );
        }

        break;
      }
    }

    panOrigin.x = mouse.x;
    panOrigin.y = mouse.y;
  };

  const syncSceneData = (): void => {
    if (isSyncing()) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    fetch(`http://${dev.host}:${dev.port}/dev`, {
      method: "POST",
      body: JSON.stringify(currentScene.data),
    })
      .then(() => {
        setSceneDataRef(structuredClone(currentScene.data));
        setIsUnsynced(false);
      })
      .catch((error) => {
        setIsUnsynced(true);
        setSyncError(error);
        console.error(error);
      })
      .finally(() => {
        setIsSyncing(false);
      });
  };

  const xCount = createMemo(() =>
    tileset() ? tileset().naturalWidth / pixelBase : 0,
  );
  const yCount = createMemo(() =>
    tileset() ? tileset().naturalHeight / pixelBase : 0,
  );
  const xSize = createMemo(() =>
    tileset() ? tileset().naturalWidth * scaleBase : 0,
  );
  const ySize = createMemo(() =>
    tileset() ? tileset().naturalHeight * scaleBase : 0,
  );

  onMount(() => {
    self.addEventListener("mousemove", handleMouse);
    // self.addEventListener("mousedown", handleMouse);
    // self.addEventListener("mouseup", handleMouse);
  });

  onCleanup(() => {
    self.removeEventListener("mousemove", handleMouse);
    // self.removeEventListener("mousedown", handleMouse);
    // self.removeEventListener("mouseup", handleMouse);
  });

  return (
    <div class="tile-window">
      <div class="icon-bar">
        <button type="button" class="btn">
          <StackBackwardIcon />
        </button>
        <button type="button" class="btn">
          <StackForwardIcon />
        </button>
        <button type="button" class="btn" onClick={syncSceneData}>
          <Switch
            fallback={
              <span class={isSyncing() ? "rotate" : undefined}>
                <RefreshIcon />
              </span>
            }
          >
            <Match when={syncError()}>
              <span class="c-error">
                <RefreshAlertIcon />
              </span>
            </Match>
            <Match when={isUnsynced()}>
              <span class="c-alert">
                <RefreshDotIcon />
              </span>
            </Match>
          </Switch>
        </button>
        <button
          type="button"
          class="btn"
          classList={{
            active: isDrawing(),
          }}
          onClick={() => {
            setIsDrawing(!isDrawing());
            setIsPaused(isDrawing());
          }}
        >
          <PencilIcon />
        </button>
      </div>

      <div class="tileset">
        {[...Array(xCount() * yCount())].map((_, index) => {
          const x = index % xCount();
          const y = (index / yCount()) | 0;

          return (
            <div
              class="tileset-tile"
              classList={{
                active: tileCoord().x === x && tileCoord().y === y,
              }}
              style={{
                ["width"]: `${tileSize}px`,
                ["height"]: `${tileSize}px`,
                ["background-image"]: `url(${tileset().src})`,
                ["background-position-x"]: `-${x * tileSize}px`,
                ["background-position-y"]: `-${y * tileSize}px`,
                ["background-size"]: `${xSize()}px ${ySize()}px`,
              }}
              onClick={() => setTileCoord(createVector(x, y))}
            ></div>
          );
        })}
      </div>

      <div class="tile-src">
        <InputField
          name="tileset"
          type="text"
          value={dataTileset()}
          onChange={(value) => {
            setDataTileset(value);
            loadImage(value).then((image) => {
              setTileset(image);
            });
            currentScene.data.tileset = value;
            checkSyncState();
          }}
        >
          <span>tileset</span>
        </InputField>
      </div>

      <div class="tile-ratio">
        <InputField
          name="xCount"
          type="number"
          value={dataXCount().toString()}
          onChange={handleXCountChange}
        >
          <span>xCount</span>
        </InputField>

        <InputField
          name="yCount"
          type="number"
          value={dataYCount().toString()}
          onChange={handleYCountChange}
        >
          <span>yCount</span>
        </InputField>
      </div>
    </div>
  );
};
