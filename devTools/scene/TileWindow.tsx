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
import { InputField } from "#/devTools/InputField.tsx";
import { createVector, type Vector } from "#/lib/Vector.ts";
import { currentScene, drawTilemap } from "#/lib/Scene.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { createGrid, drawGrid } from "#/lib/Grid.ts";
import { placeViewport, resizeViewport } from "#/lib/Viewport.ts";
import { pointer, setIsPaused, viewport } from "#/game/game.ts";
import {
  checkSync,
  isUnsynced,
  setIsUnsynced,
  setSceneDataRef,
  setTileset,
  tileset,
  xCount,
  yCount,
} from "./sceneHandler.ts";

const [tileCoord, setTileCoord] = createSignal<Vector>(createVector());
const [tilesetImage, setTilesetImage] = createSignal<HTMLImageElement>(
  await loadImage(currentScene.data.tileset),
);
const [isDrawing, setIsDrawing] = createSignal(false);
const mouse = createVector();
const grid = createGrid(
  tileSize,
  currentScene.data.xCount,
  currentScene.data.yCount,
);

function resizeBoundings(): void {
  grid.xCount = currentScene.data.xCount;
  grid.yCount = currentScene.data.yCount;
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
      checkSync(currentScene.data);
    }

    drawTilemap(tilesetImage(), currentScene.data, ctx);
    if (isPointInDOMRect(mouse, ctx.canvas.getBoundingClientRect())) {
      ctx.drawImage(
        tilesetImage(),
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
  createEffect(() => {
    loadImage(tileset()).then((image) => {
      setTilesetImage(image);
    });
  });

  const [isSyncing, setIsSyncing] = createSignal(false);
  const [syncError, setSyncError] = createSignal(null);

  const handleXCountChange = (value: string): void => {
    const xCount = parseInt(value);
    if (currentScene.data.xCount > xCount) {
      for (const row of currentScene.data.tilemap) {
        row.length = xCount;
      }
    } else {
      for (const row of currentScene.data.tilemap) {
        row.push(createVector());
      }
    }

    currentScene.data.xCount = xCount;
    currentScene.data.width = xCount * tileSize;
    resizeBoundings();
    checkSync(currentScene.data);
  };

  const handleYCountChange = (value: string): void => {
    const yCount = parseInt(value);
    if (currentScene.data.yCount > yCount) {
      currentScene.data.tilemap.length = yCount;
    } else {
      currentScene.data.tilemap.push(
        [...Array(currentScene.data.xCount)].map(() => createVector()),
      );
    }

    currentScene.data.yCount = yCount;
    currentScene.data.height = yCount * tileSize;
    resizeBoundings();
    checkSync(currentScene.data);
  };

  const panOrigin: Vector = createVector();
  const panDelta: Vector = createVector();

  const handleMouse = (event: MouseEvent): void => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    switch (event.buttons) {
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

  const cols = createMemo(() => tilesetImage().naturalWidth / pixelBase);
  const rows = createMemo(() => tilesetImage().naturalHeight / pixelBase);
  const width = createMemo(() => tilesetImage().naturalWidth * scaleBase);
  const height = createMemo(() => tilesetImage().naturalHeight * scaleBase);

  onMount(() => {
    self.addEventListener("mousemove", handleMouse);
  });

  onCleanup(() => {
    self.removeEventListener("mousemove", handleMouse);
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
        {[...Array(cols() * rows())].map((_, index) => {
          const x = index % cols();
          const y = (index / rows()) | 0;

          return (
            <div
              class="tileset-tile"
              classList={{
                active: tileCoord().x === x && tileCoord().y === y,
              }}
              style={{
                ["width"]: `${tileSize}px`,
                ["height"]: `${tileSize}px`,
                ["background-image"]: `url(${tileset()})`,
                ["background-position-x"]: `-${x * tileSize}px`,
                ["background-position-y"]: `-${y * tileSize}px`,
                ["background-size"]: `${width()}px ${height()}px`,
              }}
              onClick={() => setTileCoord(createVector(x, y))}
            ></div>
          );
        })}
      </div>

      <div class="tileset-src">
        <InputField
          name="tileset"
          type="text"
          value={tileset()}
          onChange={(value) => {
            setTileset(value);
            currentScene.data.tileset = value;
            checkSync(currentScene.data);
          }}
        >
          <span>tileset</span>
        </InputField>
      </div>

      <div class="scene-ratio">
        <InputField
          name="xCount"
          type="number"
          value={xCount().toString()}
          onChange={handleXCountChange}
        >
          <span>xCount</span>
        </InputField>

        <InputField
          name="yCount"
          type="number"
          value={yCount().toString()}
          onChange={handleYCountChange}
        >
          <span>yCount</span>
        </InputField>
      </div>
    </div>
  );
};
