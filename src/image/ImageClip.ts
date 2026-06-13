import { createCanvasElement } from '../common/elementFactory';
import type { ClipBuildContext, CompositionClip } from '../common/clips';
import type { ImageCanvasElement } from '../common/types';

export class ImageClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly opacity: number;

  constructor(
    src: string,
    startTime: number,
    duration?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    opacity = 1,
  ) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
  }

  toElement({ zIndex, playerSize }: ClipBuildContext): ImageCanvasElement {
    const defaults = createCanvasElement({
      type: 'image',
      src: this.src,
      zIndex,
      playerSize,
    }) as ImageCanvasElement;

    return {
      ...defaults,
      startTime: this.startTime,
      duration: this.duration ?? defaults.duration,
      x: this.x ?? defaults.x,
      y: this.y ?? defaults.y,
      width: this.width ?? defaults.width,
      height: this.height ?? defaults.height,
      opacity: this.opacity,
    };
  }
}
