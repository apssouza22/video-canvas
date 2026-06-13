import type { RenderOptions } from '../common/compositionCanvasApi';
import { BaseCanvasElementHandler } from '../common/BaseCanvasElementHandler';
import {
  createElementBase,
  syncMediaPlayback,
  type CanvasElementNodeRefs,
  type CreateElementOptions,
} from '../common/elementShared';
import type { AudioCanvasElement } from '../common/types';

export class AudioElementHandler extends BaseCanvasElementHandler<AudioCanvasElement> {
  readonly type = 'audio' as const;

  override get isSelectable(): boolean {
    return false;
  }

  override configureNode(node: HTMLDivElement): void {
    node.style.display = 'none';
    node.style.pointerEvents = 'none';
  }

  createDefault({ src, ...options }: CreateElementOptions): AudioCanvasElement {
    return {
      ...createElementBase(options),
      type: 'audio',
      name: 'Audio',
      src: src ?? '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      loop: false,
      volume: 1,
    };
  }

  createContent(element: AudioCanvasElement) {
    const audio = document.createElement('audio');
    audio.className = 'canvas-element__media';
    audio.src = element.src;
    audio.loop = element.loop;
    audio.volume = element.volume;
    audio.preload = 'auto';
    return { node: audio, media: audio };
  }

  updateContent(
    refs: Pick<CanvasElementNodeRefs, 'media' | 'text'>,
    element: AudioCanvasElement,
  ): void {
    const { media } = refs;
    if (!(media instanceof HTMLAudioElement)) {
      return;
    }

    if (media.src !== element.src) {
      media.src = element.src;
    }
    if (media.loop !== element.loop) {
      media.loop = element.loop;
    }
    if (media.volume !== element.volume) {
      media.volume = element.volume;
    }
  }

  override syncPlayback(
    refs: CanvasElementNodeRefs,
    element: AudioCanvasElement,
    compositionTime: number,
    options: RenderOptions = {},
  ): void {
    syncMediaPlayback(refs, element, compositionTime, options);
  }
}
