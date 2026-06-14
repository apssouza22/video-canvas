import { createCanvasElement } from '../common/elementFactory';
import type { ClipBuildContext, CompositionClip } from '../common/clips';
import type { AudioCanvasElement } from '../common/types';

export class AudioClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly sourceOffset?: number;

  constructor(
    src: string,
    startTime: number,
    duration?: number,
    sourceOffset?: number,
  ) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
    this.sourceOffset = sourceOffset;
  }

  toElement({ zIndex }: ClipBuildContext): AudioCanvasElement {
    const defaults = createCanvasElement({
      type: 'audio',
      src: this.src,
      zIndex,
    }) as AudioCanvasElement;

    return {
      ...defaults,
      startTime: this.startTime,
      duration: this.duration ?? defaults.duration,
      sourceOffset: this.sourceOffset ?? 0,
    };
  }
}
