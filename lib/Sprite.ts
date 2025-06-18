import { FolderOpenIcon } from "../devTools/icons/FolderOpen.tsx";
import { type Vector } from "./Vector.ts";

export type Sprite = {
  image: HTMLImageElement;
  width: number;
  height: number;
  framePosition: Vector;
  frameWidth: number;
  frameHeight: number;
  xLength: number;
  yLength: number;
  xIndex: number;
  yIndex: number;
  frameDuration: number;
  frameDelta: number;
};

export function createSprite(data: {
  image: HTMLImageElement;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  xFrames: number;
  yFrames: number;
  animationTime: number;
}): Sprite {
  return {
    image: data.image,
    width: data.width,
    height: data.height,
    framePosition: { x: 0, y: 0 },
    frameWidth: data.frameWidth,
    frameHeight: data.frameHeight,
    xLength: data.xFrames - 1,
    yLength: data.yFrames - 1,
    xIndex: 0,
    yIndex: 0,
    frameDuration: data.animationTime / data.xFrames - 1,
    frameDelta: 0,
  };
}

export function drawSprite(
  sprite: Sprite,
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.drawImage(
    sprite.image,
    sprite.framePosition.x,
    sprite.framePosition.y,
    sprite.frameWidth,
    sprite.frameHeight,
    x,
    y,
    sprite.width,
    sprite.height,
  );
}

export function animateSprite(
  sprite: Sprite,
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  delta: number,
): void {
  drawSprite(sprite, x, y, ctx);

  sprite.framePosition.x = sprite.frameWidth * sprite.xIndex;
  if ((sprite.frameDelta += delta) > sprite.frameDuration) {
    sprite.frameDelta = 0;
    if ((sprite.xIndex += 1) > sprite.xLength) {
      sprite.xIndex = 0;
    }
  }
}

export function setSpriteXFrame(sprite: Sprite, index: number): void {
  sprite.xIndex = index;
  sprite.framePosition.x = sprite.frameWidth * index;
  sprite.frameDelta = 0;
}

export function setSpriteYFrame(sprite: Sprite, index: number): void {
  sprite.yIndex = index;
  sprite.framePosition.y = sprite.frameHeight * index;
  sprite.frameDelta = 0;
}
