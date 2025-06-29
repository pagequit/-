import { type Vector } from "./Vector.ts";
import { type Viewport } from "./Viewport.ts";

export type Pointer = {
  isDown: boolean;
  position: Vector;
};

export function createPointer(): Pointer {
  return {
    isDown: false,
    position: { x: 0, y: 0 },
  };
}

export function adjustPointerPosition(
  pointer: Pointer,
  clientX: number,
  clientY: number,
  viewport: Viewport,
): void {
  const { ctx, translation: position, scale } = viewport;
  const clientRect = ctx.canvas.getBoundingClientRect();

  pointer.position.x = (clientX - clientRect.x + position.x) / scale.x;
  pointer.position.y = (clientY - clientRect.y + position.y) / scale.y;
}

export function usePointer(
  pointer: Pointer,
  viewport: Viewport,
): [() => void, () => void] {
  const canvas = viewport.ctx.canvas;

  function onMouseDown(event: MouseEvent): void {
    adjustPointerPosition(pointer, event.clientX, event.clientY, viewport);
    pointer.isDown = event.button === 0 ? true : pointer.isDown;
  }

  function onTouchStart(event: TouchEvent): void {
    adjustPointerPosition(
      pointer,
      event.touches[0].clientX,
      event.touches[0].clientY,
      viewport,
    );
    pointer.isDown = true;
  }

  function onMouseMove(event: MouseEvent): void {
    adjustPointerPosition(pointer, event.clientX, event.clientY, viewport);
  }

  function onTouchMove(event: TouchEvent): void {
    adjustPointerPosition(
      pointer,
      event.touches[0].clientX,
      event.touches[0].clientY,
      viewport,
    );
  }

  function onMouseUp(event: MouseEvent): void {
    pointer.isDown = event.button === 0 ? false : pointer.isDown;
  }

  function onTouchEnd(event: TouchEvent): void {
    pointer.isDown = event.touches.length === 0 ? false : pointer.isDown;
  }

  function onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  function bindPointer(): void {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("contextmenu", onContextMenu);
  }

  function unbindPointer(): void {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.removeEventListener("contextmenu", onContextMenu);
  }

  return [bindPointer, unbindPointer];
}
