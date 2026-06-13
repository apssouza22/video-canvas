import { SAMPLE_VIDEO_SRC } from '../constants';
import type { VideoCanvasElement } from '../types';
import { BaseCanvasElementHandler } from './BaseCanvasElementHandler';
import { createElementBase, syncMediaPlayback, type CreateElementOptions } from './shared';
import type { CanvasElementNodeRefs } from './shared';
import type { RenderOptions } from '../compositionCanvasApi';

export class VideoElementHandler extends BaseCanvasElementHandler<VideoCanvasElement> {
  readonly type = 'video' as const;

  override get supportsVideoFrameSync(): boolean {
    return true;
  }

  createDefault({ src, ...options }: CreateElementOptions): VideoCanvasElement {
    return {
      ...createElementBase(options),
      type: 'video',
      name: 'Video',
      src: src ?? SAMPLE_VIDEO_SRC,
      muted: true,
      loop: true,
      duration: 10,
    };
  }

  createContent(element: VideoCanvasElement) {
    const video = document.createElement('video');
    video.className = 'block w-full h-full pointer-events-none canvas-element__media';
    video.src = element.src;
    video.muted = element.muted;
    video.loop = element.loop;
    video.playsInline = true;
    video.preload = 'auto';
    return { node: video, media: video };
  }

  updateContent(
    refs: Pick<CanvasElementNodeRefs, 'media' | 'text'>,
    element: VideoCanvasElement,
  ): void {
    const { media } = refs;
    if (!(media instanceof HTMLVideoElement)) {
      return;
    }

    if (media.src !== element.src) {
      media.src = element.src;
    }
    if (media.muted !== element.muted) {
      media.muted = element.muted;
    }
    if (media.loop !== element.loop) {
      media.loop = element.loop;
    }
  }

  override syncPlayback(
    refs: CanvasElementNodeRefs,
    element: VideoCanvasElement,
    compositionTime: number,
    options: RenderOptions = {},
  ): void {
    syncMediaPlayback(refs, element, compositionTime, options);
  }
}
