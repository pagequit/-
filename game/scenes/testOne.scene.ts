import { tileSize } from "#/config.ts";
import { pointer, viewport } from "#/game/game.ts";
import { drawTilemap, useScene } from "#/lib/Scene.ts";
import {
  drawHeroStuff,
  loadHero,
  processHero,
  setHeroCoords,
  setHeroPosition,
} from "#/game/Hero.ts";
import {
  type AABB,
  circleIntersectAABB,
  createPolygon,
  isPointInAABB,
  type Polygon,
  useSAT,
} from "#/lib/collision.ts";
import { drawPoint, drawRectangle } from "#/game/misc.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { focusViewport } from "#/lib/Viewport.ts";
import sceneData from "./testOne.json";
import { createVector } from "#/lib/Vector";

const { process, preProcess, linkScenes } = useScene(viewport, sceneData);

const swapScene = linkScenes(["testTwo"]);

const aThing: AABB = {
  width: tileSize,
  height: tileSize,
  position: {
    x: (sceneData.xCount - 8) * tileSize,
    y: (sceneData.yCount - 12) * tileSize,
  },
};

//

const polyA = createPolygon(
  createVector(
    (sceneData.xCount - 10) * tileSize,
    (sceneData.yCount - 5) * tileSize,
  ),
  [
    createVector(34, 28),
    createVector(32, 0),
    createVector(-32, -23),
    createVector(-42, 32),
    createVector(0, 32),
  ],
);

const polyB = createPolygon(
  createVector(
    (sceneData.xCount - 9) * tileSize,
    (sceneData.yCount - 5) * tileSize,
  ),
  [
    createVector(0, 42),
    createVector(36, 18),
    createVector(28, -24),
    createVector(-18, -36),
    createVector(-28, 24),
  ],
);

const polyC = createPolygon(
  createVector(
    (sceneData.xCount - 12) * tileSize,
    (sceneData.yCount - 5) * tileSize,
  ),
  [
    createVector(0, 47),
    createVector(36, 24),
    createVector(28, -37),
    createVector(6, -44),
    createVector(-18, -16),
    createVector(-36, 24),
  ],
);

const sat = useSAT();

function drawPoly(
  ctx: CanvasRenderingContext2D,
  poly: Polygon,
  trigger: boolean = false,
): void {
  drawPoint(ctx, poly.position);
  ctx.beginPath();
  ctx.moveTo(
    poly.points[0].x + poly.position.x,
    poly.points[0].y + poly.position.y,
  );

  for (let i = poly.points.length - 1; i >= 0; i--) {
    ctx.lineTo(
      poly.points[i].x + poly.position.x,
      poly.points[i].y + poly.position.y,
    );
  }

  ctx.strokeStyle = trigger ? "red" : "orange";
  ctx.stroke();
}

//

const hero = await loadHero();
const tileset = await loadImage(sceneData.tileset);

preProcess(() => {
  setHeroPosition(tileSize * 15, tileSize * 5);
});

process((ctx, delta) => {
  drawTilemap(tileset, sceneData, ctx);

  processHero(delta);
  focusViewport(
    viewport,
    hero.position.x,
    hero.position.y,
    sceneData.width,
    sceneData.height,
  );

  let color = "rgba(128, 128, 128, 0.5)";
  if (isPointInAABB(pointer.position, aThing)) {
    color = "rgba(0, 0, 128, 0.5)";
  }
  drawRectangle(ctx, aThing.position, aThing.width, aThing.height, color);

  if (circleIntersectAABB(hero.collisionShape, aThing)) {
    swapScene("testTwo").then(() => {
      setHeroCoords(10, 7);
    });
  }

  //

  polyA.position.x = hero.position.x;
  polyA.position.y = hero.position.y;

  drawPoly(ctx, polyC, sat(polyA, polyC));
  drawRectangle(
    ctx,
    {
      x: polyC.aabb.position.x + polyC.position.x,
      y: polyC.aabb.position.y + polyC.position.y,
    },
    polyC.aabb.width,
    polyC.aabb.height,
    "rbga(122, 122, 122, 0.4)",
  );

  drawPoly(ctx, polyB, sat(polyA, polyB));
  drawRectangle(
    ctx,
    {
      x: polyB.aabb.position.x + polyB.position.x,
      y: polyB.aabb.position.y + polyB.position.y,
    },
    polyB.aabb.width,
    polyB.aabb.height,
    "rbga(122, 122, 122, 0.4)",
  );

  drawPoly(ctx, polyA);
  drawRectangle(
    ctx,
    {
      x: polyA.aabb.position.x + polyA.position.x,
      y: polyA.aabb.position.y + polyA.position.y,
    },
    polyA.aabb.width,
    polyA.aabb.height,
    "rbga(122, 122, 122, 0.4)",
  );

  // drawHeroStuff(ctx);
});

console.log("testOne loaded");
