import { pointer, viewport } from "../main.ts";
import {
  createVector,
  isBelowThreshold,
  normalize,
  type Vector,
} from "../lib/Vector.ts";
import { tileSize, pixelBase, scaleBase } from "./constants.ts";
import { type Sprite, createSprite } from "../lib/Sprite.ts";
import { loadImage } from "../lib/loadImage.ts";
import {
  drawCircle,
  drawPoint,
  drawRectangle,
  toPixelCoord,
  plotLine,
} from "./misc.ts";
import { animateSprite } from "../lib/Sprite.ts";
import type { Circle } from "../lib/collision.ts";

const { ctx } = viewport;

const position = createVector();
const velocity = createVector();
const collisionShape = {
  position: createVector(),
  radius: (pixelBase / 2) * scaleBase - scaleBase,
};
const collisionOffset = {
  x: 0,
  y: (pixelBase * scaleBase) / 3 - scaleBase,
};
const graphics = {
  idle: null as unknown as Sprite,
  walk: null as unknown as Sprite,
};
const spriteOffset = {
  x: pixelBase * scaleBase,
  y: pixelBase * scaleBase * 1.5,
};
const targetPosition = createVector();
const targetDelta = createVector();
const targetNormal = createVector();

export type Hero = {
  position: Vector;
  collisionShape: Circle;
};

export async function loadHero(): Promise<Hero> {
  graphics.idle = await loadIdleSprite();
  graphics.walk = await loadWalkSprite();

  console.log(graphics);

  return {
    position,
    collisionShape,
  };
}

export function updateHeroPosition(x: number, y: number): void {
  position.x = x;
  position.y = y;
  collisionShape.position.x = x - collisionOffset.x;
  collisionShape.position.y = y - collisionOffset.y;
}

export function setHeroPosition(x: number, y: number): void {
  updateHeroPosition(x, y);
  targetPosition.x = collisionShape.position.x;
  targetPosition.y = collisionShape.position.y;
}

export function processHero(delta: number): void {
  if (pointer.isDown) {
    targetPosition.x = pointer.position.x;
    targetPosition.y = pointer.position.y;
  }

  targetDelta.x = targetPosition.x - collisionShape.position.x;
  targetDelta.y = targetPosition.y - collisionShape.position.y;

  if (!isBelowThreshold(targetDelta, 4)) {
    targetNormal.x = targetDelta.x;
    targetNormal.y = targetDelta.y;
    normalize(targetNormal);

    velocity.x = targetNormal.x * 0.5;
    velocity.y = targetNormal.y * 0.5;

    updateHeroPosition(
      position.x + velocity.x * delta,
      position.y + velocity.y * delta,
    );
  }

  animateSprite(
    graphics.idle,
    position.x - spriteOffset.x,
    position.y - spriteOffset.y,
    ctx,
    delta,
  );
  drawHeroStuff(ctx);
}

async function loadIdleSprite(): Promise<Sprite> {
  return createSprite({
    image: await loadImage("/assets/hero/idle.png"),
    width: tileSize * 2,
    height: tileSize * 2,
    frameWidth: pixelBase * 2,
    frameHeight: pixelBase * 2,
    xFrames: 5,
    yFrames: 4,
    animationTime: 5 * 200,
  });
}

async function loadWalkSprite(): Promise<Sprite> {
  return createSprite({
    image: await loadImage("/assets/hero/walk.png"),
    width: tileSize * 2,
    height: tileSize * 2,
    frameWidth: pixelBase * 2,
    frameHeight: pixelBase * 2,
    xFrames: 6,
    yFrames: 4,
    animationTime: 5 * 200,
  });
}

const pixelCoordStart = createVector();
const pixelCoordTarget = createVector();

const pixelCoord = createVector();
function drawPixel(x: number, y: number): void {
  pixelCoord.x = x * scaleBase;
  pixelCoord.y = y * scaleBase;

  drawRectangle(ctx, pixelCoord, scaleBase, scaleBase, "rgba(128, 0, 0, 0.5)");
}

export function drawHeroStuff(ctx: CanvasRenderingContext2D): void {
  drawCircle(
    ctx,
    collisionShape.position,
    collisionShape.radius,
    "rgba(128, 0, 0, 0.5)",
  );

  drawPoint(ctx, position);

  toPixelCoord(collisionShape.position, pixelCoordStart);
  toPixelCoord(targetPosition, pixelCoordTarget);
  plotLine(pixelCoordStart, pixelCoordTarget, drawPixel);
}
