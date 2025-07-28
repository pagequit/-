import { tileSize } from "#/config.ts";
import { pointer, viewport } from "#/game/game.ts";
import { drawTilemap, useScene } from "#/lib/Scene.ts";
import {
  loadHero,
  processHero,
  setHeroCoords,
  setHeroPosition,
} from "#/game/Hero.ts";
import {
  circleIntersectAABB,
  isPointInAABB,
  getAxes,
  sat,
  type AABB,
  type Polygon,
} from "#/lib/collision.ts";
import { drawPoint, drawRectangle } from "#/game/misc.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { focusViewport } from "#/lib/Viewport.ts";
import sceneData from "./testOne.json";
import { createVector } from "#/lib/Vector";
import { createTextChangeRange } from "typescript";

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

const polyA: Polygon = {
  position: createVector(
    (sceneData.xCount - 10) * tileSize,
    (sceneData.yCount - 5) * tileSize,
  ),
  points: [createVector(16, 16), createVector(16, -16), createVector(-16, 16)],
};
const polyB: Polygon = {
  position: createVector(
    (sceneData.xCount - 9) * tileSize,
    (sceneData.yCount - 5) * tileSize,
  ),
  points: [createVector(16, 16), createVector(16, -16), createVector(-16, 16)],
};

function drawPoly(ctx: CanvasRenderingContext2D, poly: Polygon): void {
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

  ctx.strokeStyle = "red";
  ctx.stroke();
}

const aa = getAxes(polyA);

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

  drawPoly(ctx, polyA);
  drawPoly(ctx, polyB);
  aa.forEach((v) =>
    drawPoint(
      ctx,
      {
        x: v.x + polyA.position.x,
        y: v.y + polyA.position.y,
      },
      2,
      "yellow",
    ),
  );
});

console.log("testOne loaded");
