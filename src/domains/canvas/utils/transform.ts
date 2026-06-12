import type { CSSProperties } from 'react';
import type { ElementTransform } from '../types';

export interface Point {
  x: number;
  y: number;
}

export function getElementCenter(transform: ElementTransform): Point {
  return {
    x: transform.x + transform.width / 2,
    y: transform.y + transform.height / 2,
  };
}

export function rotatePoint(point: Point, center: Point, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function inverseRotatePoint(point: Point, center: Point, degrees: number): Point {
  return rotatePoint(point, center, -degrees);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function elementTransformStyle(transform: ElementTransform): CSSProperties {
  return {
    left: transform.x,
    top: transform.y,
    width: transform.width,
    height: transform.height,
    transform: `rotate(${transform.rotation}deg)`,
    transformOrigin: 'center center',
  };
}

export type ResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

function pointerToLocal(pointer: Point, start: ElementTransform): Point {
  const center = getElementCenter(start);
  const unrotated = inverseRotatePoint(pointer, center, start.rotation);
  return {
    x: unrotated.x - start.x,
    y: unrotated.y - start.y,
  };
}

export function resizeElement(
  start: ElementTransform,
  handle: ResizeHandle,
  currentPointer: Point,
  startPointer: Point,
  minSize = 40,
): ElementTransform {
  const startLocal = pointerToLocal(startPointer, start);
  const currentLocal = pointerToLocal(currentPointer, start);
  const dx = currentLocal.x - startLocal.x;
  const dy = currentLocal.y - startLocal.y;

  let { x, y, width, height } = start;

  if (handle.includes('right')) {
    width = Math.max(minSize, start.width + dx);
  }
  if (handle.includes('left')) {
    const nextWidth = Math.max(minSize, start.width - dx);
    x = start.x + (start.width - nextWidth);
    width = nextWidth;
  }
  if (handle.includes('bottom')) {
    height = Math.max(minSize, start.height + dy);
  }
  if (handle.includes('top')) {
    const nextHeight = Math.max(minSize, start.height - dy);
    y = start.y + (start.height - nextHeight);
    height = nextHeight;
  }

  return { ...start, x, y, width, height };
}

export function rotateElement(
  start: ElementTransform,
  pointer: Point,
  startPointer: Point,
): ElementTransform {
  const center = getElementCenter(start);
  const startAngle = Math.atan2(startPointer.y - center.y, startPointer.x - center.x);
  const currentAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
  const deltaDegrees = ((currentAngle - startAngle) * 180) / Math.PI;

  return {
    ...start,
    rotation: start.rotation + deltaDegrees,
  };
}
