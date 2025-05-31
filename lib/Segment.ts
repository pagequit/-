import { type Vector } from "./Vector.ts";
import { lerp } from "./lerp.ts";

export type Segment = [Vector, Vector];

export type SegmentIntersection = {
  position: Vector;
  offset: number;
};

export function createSegmentIntersection(): SegmentIntersection {
  return {
    position: {
      x: Number.NaN,
      y: Number.NaN,
    },
    offset: Number.NaN,
  };
}

export function setSegmentIntersection(
  segmentIntersection: SegmentIntersection,
  a: Segment,
  b: Segment,
): void {
  const bottom =
    (b[1].y - b[0].y) * (a[1].x - a[0].x) -
    (b[1].x - b[0].x) * (a[1].y - a[0].y);

  if (bottom === 0) {
    segmentIntersection.position.x = Number.NaN;
    segmentIntersection.position.y = Number.NaN;
    segmentIntersection.offset = Number.NaN;

    return;
  }

  const tTop =
    (b[1].x - b[0].x) * (a[0].y - b[0].y) -
    (b[1].y - b[0].y) * (a[0].x - b[0].x);
  const uTop =
    (b[0].y - a[0].y) * (a[0].x - a[1].x) -
    (b[0].x - a[0].x) * (a[0].y - a[1].y);

  const t = tTop / bottom;
  const u = uTop / bottom;

  if (t < 0 || t > 1 || u < 0 || u > 1) {
    segmentIntersection.position.x = Number.NaN;
    segmentIntersection.position.y = Number.NaN;
    segmentIntersection.offset = Number.NaN;

    return;
  }

  segmentIntersection.position.x = lerp(a[0].x, a[1].x, t);
  segmentIntersection.position.y = lerp(a[0].y, a[1].y, t);
  segmentIntersection.offset = t;
}

export function drawSegment(
  segment: Segment,
  ctx: CanvasRenderingContext2D,
  color: string,
): void {
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(segment[0].x, segment[0].y);
  ctx.lineTo(segment[1].x, segment[1].y);
  ctx.stroke();
}
