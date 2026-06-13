import { createCanvasElement } from '../common/elementFactory';
import type { ClipBuildContext, CompositionClip } from '../common/clips';
import type { AudioCanvasElement } from '../common/types';

export class AudioClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;

  constructor(src: string, startTime: number, duration?: number) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
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
    };
  }
}
