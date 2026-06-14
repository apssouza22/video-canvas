import { createCanvasElement } from '../common/elementFactory';
import type { ClipBuildContext, CompositionClip } from '../common/clips';
import type { VideoCanvasElement } from '../common/types';

export interface VideoClipOptions {
  sourceOffset?: number;
  /** When false, the video element plays its own audio track. Defaults to true. */
  muted?: boolean;
}

export class VideoClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly sourceOffset?: number;
  readonly muted?: boolean;

  constructor(
    src: string,
    startTime: number,
    duration?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    options: VideoClipOptions = {},
  ) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sourceOffset = options.sourceOffset;
    this.muted = options.muted;
  }

  toElement({ zIndex, playerSize }: ClipBuildContext): VideoCanvasElement {
    const defaults = createCanvasElement({
      type: 'video',
      src: this.src,
      zIndex,
      playerSize,
    }) as VideoCanvasElement;

    return {
      ...defaults,
      startTime: this.startTime,
      duration: this.duration ?? defaults.duration,
      x: this.x ?? defaults.x,
      y: this.y ?? defaults.y,
      width: this.width ?? defaults.width,
      height: this.height ?? defaults.height,
      sourceOffset: this.sourceOffset ?? 0,
      muted: this.muted ?? defaults.muted,
    };
  }
}
