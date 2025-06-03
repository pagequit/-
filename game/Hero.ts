import { pointer } from "../main.ts";
import { createVector, isBelowThreshold, normalize } from "../lib/Vector.ts";
import { tileSize, pixelBase, scaleBase } from "./constants.ts";
import { type Sprite, createSprite } from "../lib/Sprite.ts";
import { loadImage } from "../lib/loadImage.ts";
import { drawCircle, drawPoint } from "./misc.ts";

export const hero = {
  position: createVector(),
  velocity: createVector(),
  collisionShape: {
    position: createVector(),
    radius: (pixelBase / 2) * scaleBase - scaleBase,
  },
  collisionOffset: {
    x: 0,
    y: (pixelBase * scaleBase) / 3 - scaleBase,
  },
  spriteOffset: {
    x: pixelBase * scaleBase,
    y: pixelBase * scaleBase * 1.5,
  },
  targetPosition: createVector(),
};

const pointing = {
  position: hero.targetPosition,
  delta: createVector(),
  normal: createVector(),
};

export function updateHeroPosition(x: number, y: number): void {
  hero.position.x = x;
  hero.position.y = y;
  hero.collisionShape.position.x = x - hero.collisionOffset.x;
  hero.collisionShape.position.y = y - hero.collisionOffset.y;
}

export function processHero(delta: number): void {
  if (pointer.isDown) {
    pointing.position.x = pointer.position.x;
    pointing.position.y = pointer.position.y;
  }

  // TODO: improve that stupid pointing thing
  // make it a hero property or something...
  pointing.delta.x = pointing.position.x - hero.collisionShape.position.x;
  pointing.delta.y = pointing.position.y - hero.collisionShape.position.y;

  if (isBelowThreshold(pointing.delta, 4)) {
    return;
  }

  pointing.normal.x = pointing.delta.x;
  pointing.normal.y = pointing.delta.y;
  // TODO: there is probably a faster/cheaper solution to that
  normalize(pointing.normal);

  hero.velocity.x = pointing.normal.x * 0.5;
  hero.velocity.y = pointing.normal.y * 0.5;

  return;
  updateHeroPosition(
    hero.position.x + hero.velocity.x * delta,
    hero.position.y + hero.velocity.y * delta,
  );
}

export function getHeroGraphics(): {
  idle: Promise<Sprite>;
  walk: Promise<Sprite>;
} {
  return {
    idle: getIdleSprite(),
    walk: getWalkSprite(),
  };
}

async function getIdleSprite(): Promise<Sprite> {
  return createSprite({
    image: await loadImage("assets/hero/hero-idle.png"),
    width: tileSize * 2,
    height: tileSize * 2,
    frameWidth: pixelBase * 2,
    frameHeight: pixelBase * 2,
    xFrames: 5,
    yFrames: 4,
    animationTime: 5 * 200,
  });
}

async function getWalkSprite(): Promise<Sprite> {
  return createSprite({
    image: await loadImage("assets/hero/hero-walk.png"),
    width: tileSize * 2,
    height: tileSize * 2,
    frameWidth: pixelBase * 2,
    frameHeight: pixelBase * 2,
    xFrames: 6,
    yFrames: 4,
    animationTime: 5 * 200,
  });
}

export function drawHeroStuff(ctx: CanvasRenderingContext2D): void {
  drawCircle(
    ctx,
    hero.collisionShape.position,
    hero.collisionShape.radius,
    "rgba(128, 0, 0, 0.5)",
  );

  drawPoint(ctx, hero.position);
}
