import { createCanvasElement } from '../common/elementFactory';
import type { ClipBuildContext, CompositionClip } from '../common/clips';
import type { TextCanvasElement } from '../common/types';

export class TextClip implements CompositionClip {
  readonly text: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly opacity: number;

  constructor(
    text: string,
    startTime: number,
    duration?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    opacity = 1,
  ) {
    this.text = text;
    this.startTime = startTime;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
  }

  toElement({ zIndex, playerSize }: ClipBuildContext): TextCanvasElement {
    const defaults = createCanvasElement({
      type: 'text',
      zIndex,
      playerSize,
    }) as TextCanvasElement;

    return {
      ...defaults,
      content: this.text,
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
