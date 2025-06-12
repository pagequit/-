import { pointer, viewport } from "../main.ts";
import {
  createVector,
  isBelowThreshold,
  normalize,
  type Vector,
} from "../lib/Vector.ts";
import { tileSize, pixelBase, scaleBase } from "./constants.ts";
import {
  type Sprite,
  createSprite,
  setSpriteXFrame,
  setSpriteYFrame,
} from "../lib/Sprite.ts";
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
import { useWithAsyncCache } from "../lib/cache.ts";

enum State {
  Idle,
  Walk,
}

enum Direction {
  Down,
  Left,
  Up,
  Right,
}

const { ctx } = viewport;

let state = -1;
let direction = -1;

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

const sprites = {
  current: null as unknown as Sprite,
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

const [heroLoader] = useWithAsyncCache(async (): Promise<Hero> => {
  sprites.idle = await loadIdleSprite();
  sprites.walk = await loadWalkSprite();

  return {
    position,
    collisionShape,
  };
});

export function loadHero(): Promise<Hero> {
  return heroLoader("/");
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

function getDirection(): Direction {
  let localDirection: Direction;
  if (Math.abs(targetDelta.x) > Math.abs(targetDelta.y)) {
    if (targetDelta.x < 0) {
      localDirection = Direction.Left;
    } else {
      localDirection = Direction.Right;
    }
  } else {
    if (targetDelta.y < 0) {
      localDirection = Direction.Up;
    } else {
      localDirection = Direction.Down;
    }
  }

  return localDirection;
}

function setState(newState: State): void {
  if (newState === state) {
    return;
  }
  state = newState;

  setSpriteXFrame(sprites.idle, 0);
  setSpriteXFrame(sprites.walk, 0);

  switch (state) {
    case State.Idle: {
      sprites.current = sprites.idle;
      break;
    }
    case State.Walk: {
      sprites.current = sprites.walk;
      break;
    }
  }
}

function setDirection(newDirection: Direction): void {
  if (newDirection === direction) {
    return;
  }
  direction = newDirection;

  setSpriteYFrame(sprites.idle, direction);
  setSpriteYFrame(sprites.walk, direction);
}

export function processHero(delta: number): void {
  if (pointer.isDown) {
    targetPosition.x = pointer.position.x;
    targetPosition.y = pointer.position.y;
  }

  targetDelta.x = targetPosition.x - collisionShape.position.x;
  targetDelta.y = targetPosition.y - collisionShape.position.y;

  if (isBelowThreshold(targetDelta, 4)) {
    setState(State.Idle);
  } else {
    setState(State.Walk);

    targetNormal.x = targetDelta.x;
    targetNormal.y = targetDelta.y;
    normalize(targetNormal);

    velocity.x = targetNormal.x * 0.3;
    velocity.y = targetNormal.y * 0.3;

    updateHeroPosition(
      position.x + velocity.x * delta,
      position.y + velocity.y * delta,
    );
  }

  setDirection(getDirection());

  drawHeroStuff(ctx);
  animateSprite(
    sprites.current,
    position.x - spriteOffset.x,
    position.y - spriteOffset.y,
    ctx,
    delta,
  );
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
