import { pixelBase, scaleBase, tileSize } from "../constants.ts";
import { focusViewport } from "../../lib/Viewport.ts";
import { viewport, pointer } from "../../main.ts";
import { type Scene } from "../../lib/Scene.ts";
import { createGrid, drawGrid, highlightGridTile } from "../../lib/Grid.ts";
import {
  drawCircle,
  drawPoint,
  drawRectangle,
  getGridCoord,
  getPixelCoord,
  plotLine,
} from "../misc.ts";
import {
  hero,
  getHeroGraphics,
  processHero,
  drawHeroStuff,
  updateHeroPosition,
} from "../Hero.ts";
import { animateSprite } from "../../lib/Sprite.ts";
import {
  circleCollideRectangle,
  isPointInRectangle,
  type Rectangle,
} from "../../lib/collision.ts";
import { createVector, equals, scale, type Vector } from "../../lib/Vector.ts";
import {
  createSegmentIntersection,
  drawSegment,
  setSegmentIntersection,
  type Segment,
} from "../../lib/Segment.ts";

const { ctx } = viewport;

// prettier-ignore
const tileSet = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const grid = createGrid(tileSize, tileSet[0].length, tileSet.length);
const width = grid.tileSize * grid.xSize;
const height = grid.tileSize * grid.ySize;

const asyncData = {
  hero: {},
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const aThing: Rectangle = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (grid.xSize - 8) * grid.tileSize,
    y: (grid.ySize - 12) * grid.tileSize,
  },
};

function drawTileSet(
  tileSet: Array<Array<number>>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = "rgba(128, 128, 128, 1.0)";
  const ySize = tileSet.length;
  const xSize = tileSet[0].length;

  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      if (tileSet[y][x] === 1) {
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

function mapTiles(tileSet: Array<Array<number>>): Array<Vector> {
  const map = [];
  const ySize = tileSet.length;
  const xSize = tileSet[0].length;

  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      if (tileSet[y][x] === 1) {
        map.push(createVector(x * tileSize, y * tileSize));
      }
    }
  }

  return map;
}

const walls = mapTiles(tileSet);

function isTileFree(coord: Vector): boolean {
  return !tileSet[coord.y][coord.x];
}

function getTileByPosition(position: Vector): number {
  return tileSet[Math.floor(position.y / tileSize)][
    Math.floor(position.x / tileSize)
  ];
}

const intersection = createSegmentIntersection();

function process(delta: number) {
  drawTileSet(tileSet, ctx);

  // inject the target position ?
  processHero(delta);

  focusViewport(viewport, hero.position.x, hero.position.y, width, height);
  animateSprite(
    asyncData.hero.idle,
    hero.position.x - hero.spriteOffset.x,
    hero.position.y - hero.spriteOffset.y,
    ctx,
    delta,
  );
  drawHeroStuff(ctx);
  highlightGridTile(grid, hero.position, ctx);
  {
    if (getTileByPosition(hero.targetPosition) > 0) {
      hero.targetPosition.x = hero.position.x;
      hero.targetPosition.y = hero.position.y;
    } else {
      const start = getPixelCoord(hero.collisionShape.position);
      const target = getPixelCoord(hero.targetPosition);
      // findPath(start, target);
      plotLine(start, target, (x, y) => {
        drawRectangle(
          ctx,
          {
            x: x * scaleBase,
            y: y * scaleBase,
          },
          scaleBase,
          scaleBase,
          "rgba(176, 235, 39, 0.2)",
        );
      });
    }
  }

  {
    let color = "rgba(128, 128, 128, 0.5)";
    if (isPointInRectangle(pointer.position, aThing)) {
      color = "rgba(0, 0, 128, 0.5)";
    }
    if (circleCollideRectangle(hero.collisionShape, aThing)) {
      color = "rgba(128, 0, 0, 0.5)";
    }
    drawRectangle(ctx, aThing.position, aThing.width, aThing.height, color);
  }

  const segment: Segment = [hero.collisionShape.position, hero.targetPosition];
  for (const wall of walls) {
    drawCircle(ctx, wall, 4, "orange");

    const localCenter = createVector(wall.x + pixelBase, wall.y);
    const localSegment: Segment = [
      localCenter,
      createVector(localCenter.x, localCenter.y + tileSize),
    ];
    drawSegment(localSegment, ctx, "white");
    setSegmentIntersection(intersection, segment, localSegment);

    if (isNaN(intersection.offset)) {
      const localCenter = createVector(wall.x, wall.y + pixelBase);
      const localSegment: Segment = [
        localCenter,
        createVector(localCenter.x + tileSize, localCenter.y),
      ];
      drawSegment(localSegment, ctx, "white");
      setSegmentIntersection(intersection, segment, localSegment);
    }

    if (!isNaN(intersection.offset)) {
      drawRectangle(ctx, wall, tileSize, tileSize, "orange");
      break;
    }
  }

  drawGrid(grid, ctx);
}

export default async function (): Promise<Scene> {
  asyncData.hero.idle = await getHeroGraphics().idle;

  updateHeroPosition(tileSize * 15, tileSize * 5);

  console.log("load testSceneOne");

  return { width, height, process };
}
