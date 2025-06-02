import { type Vector } from "./Vector.ts";

export type Viewport = {
  ctx: CanvasRenderingContext2D;
  translation: Vector;
  scale: Vector;
  imageSmoothing: CanvasImageSmoothing;
};

export function createViewport(
  ctx: CanvasRenderingContext2D,
  imageSmoothing: CanvasImageSmoothing = {
    imageSmoothingEnabled: false,
    imageSmoothingQuality: "low",
  },
): Viewport {
  const viewport = {
    ctx,
    translation: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    imageSmoothing,
  };

  return viewport;
}

export function resetViewport(viewport: Viewport): void {
  const { ctx, translation, scale } = viewport;

  ctx.restore();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-translation.x, -translation.y);
  ctx.scale(scale.x, scale.y);
}

export function resizeViewport(
  viewport: Viewport,
  width: number,
  height: number,
): void {
  const { ctx, scale, imageSmoothing } = viewport;

  ctx.canvas.width = Math.min(self.innerWidth, width * scale.x);
  ctx.canvas.height = Math.min(self.innerHeight, height * scale.y);

  ctx.imageSmoothingEnabled = imageSmoothing.imageSmoothingEnabled;
  ctx.imageSmoothingQuality = imageSmoothing.imageSmoothingQuality;
}

export function zoomViewport(
  viewport: Viewport,
  zoom: number,
  width: number,
  height: number,
): void {
  viewport.scale = { x: zoom, y: zoom };

  resizeViewport(viewport, width, height);
}

export function placeViewport(
  viewport: Viewport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const { translation, scale } = viewport;

  translation.x = Math.max(0, Math.min(x, width * scale.x - self.innerWidth));
  translation.y = Math.max(0, Math.min(y, height * scale.y - self.innerHeight));
}

export function focusViewport(
  viewport: Viewport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const { scale } = viewport;

  placeViewport(
    viewport,
    x * scale.x - self.innerWidth / 2,
    y * scale.y - self.innerHeight / 2,
    width,
    height,
  );
}

export function centerViewport(
  viewport: Viewport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const { translation, scale } = viewport;

  const halfWidth = self.innerWidth / 2;
  translation.x = Math.max(
    -halfWidth,
    Math.min(x * scale.x - halfWidth, width * scale.x - halfWidth),
  );

  const halfHeight = self.innerHeight / 2;
  translation.y = Math.max(
    -halfHeight,
    Math.min(y * scale.y - halfHeight, height * scale.y - halfHeight),
  );
}
