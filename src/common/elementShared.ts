import { elementTransformStyle } from '../transform/transform';
import type { RenderOptions } from './compositionPreviewApi';
import { DEFAULT_PLAYER_SIZE } from './constants';
import { createElementId } from './id';
import { DEFAULT_ELEMENT_DURATION, getVideoMediaTime } from './timing';
import type { CanvasElement, CanvasSize } from './types';
export interface CanvasElementNodeRefs {
  node: HTMLDivElement;
  media?: HTMLVideoElement | HTMLAudioElement | HTMLImageElement;
  text?: HTMLDivElement;
}

export const BASE_ELEMENT_CLASS =
  'absolute box-border cursor-move select-none touch-none [contain:layout_style_paint]';

export interface CreateElementOptions {
  src?: string;
  zIndex: number;
  playerSize?: CanvasSize;
}

export interface ElementContent {
  node: HTMLElement;
  media?: HTMLVideoElement | HTMLAudioElement | HTMLImageElement;
  text?: HTMLDivElement;
}

export function createElementBase(options: CreateElementOptions) {
  const playerSize = options.playerSize ?? DEFAULT_PLAYER_SIZE;

  return {
    id: createElementId(),
    zIndex: options.zIndex,
    x: playerSize.width / 2 - 200,
    y: playerSize.height / 2 - 120,
    width: 400,
    height: 240,
    rotation: 0,
    startTime: 0,
    duration: DEFAULT_ELEMENT_DURATION,
    opacity: 1,
  };
}

export function applyElementStyles(node: HTMLDivElement, element: CanvasElement): void {
  const style = elementTransformStyle(element);
  const nodeStyle = node.style;
  const left = `${style.left}px`;
  const top = `${style.top}px`;
  const width = `${style.width}px`;
  const height = `${style.height}px`;
  const zIndex = String(element.zIndex);
  const opacity = String(element.opacity);

  if (nodeStyle.left !== left) {
    nodeStyle.left = left;
  }
  if (nodeStyle.top !== top) {
    nodeStyle.top = top;
  }
  if (nodeStyle.width !== width) {
    nodeStyle.width = width;
  }
  if (nodeStyle.height !== height) {
    nodeStyle.height = height;
  }
  if (nodeStyle.transform !== style.transform) {
    nodeStyle.transform = String(style.transform);
  }
  if (nodeStyle.transformOrigin !== style.transformOrigin) {
    nodeStyle.transformOrigin = String(style.transformOrigin);
  }
  if (nodeStyle.zIndex !== zIndex) {
    nodeStyle.zIndex = zIndex;
  }
  if (nodeStyle.opacity !== opacity) {
    nodeStyle.opacity = opacity;
  }
}

export function bindElementSelection(
  node: HTMLDivElement,
  elementId: string,
  onSelect: (id: string) => void,
): void {
  node.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    onSelect(elementId);
  });
}

function applyMediaPlaybackRate(
  media: HTMLVideoElement | HTMLAudioElement,
  node: HTMLDivElement,
  rate: number,
): void {
  const normalizedRate = rate > 0 ? rate : 1;

  if (media.playbackRate !== normalizedRate) {
    media.playbackRate = normalizedRate;
    // Restart the playback session so media re-seeks with the new rate.
    if (node.dataset.mediaPlaying === 'true') {
      node.dataset.mediaPlaying = 'false';
    }
  }

  if (media.preservesPitch !== true) {
    media.preservesPitch = true;
  }
}

export function syncMediaPlayback(
  refs: CanvasElementNodeRefs,
  element: CanvasElement,
  compositionTime: number,
  options: RenderOptions = {},
): void {
  const { node, media } = refs;
  if (node.hidden || !(media instanceof HTMLVideoElement || media instanceof HTMLAudioElement)) {
    return;
  }

  applyMediaPlaybackRate(media, node, options.playbackRate ?? 1);

  const isPlaying = options.playing ?? false;
  const mediaTime = getVideoMediaTime(element, compositionTime, options);
  const drift = Math.abs(media.currentTime - mediaTime);

  if (!isPlaying) {
    if (drift > 0.15) {
      try {
        media.currentTime = mediaTime;
      } catch {
        // Ignore seek errors while metadata is loading.
      }
    }
  }

  if (isPlaying) {
    const starting = node.dataset.mediaPlaying !== 'true';
    if (starting) {
      node.dataset.mediaPlaying = 'true';
      if (drift > 0.05) {
        try {
          media.currentTime = mediaTime;
        } catch {
          // Ignore seek errors while metadata is loading.
        }
      }
      void media.play().catch(() => {
        // Autoplay may be blocked until the user interacts with the page.
      });
    } else if (drift > 0.15) {
      // External seek during playback (e.g. transcription jump) — re-sync audio/video.
      try {
        media.currentTime = mediaTime;
      } catch {
        // Ignore seek errors while metadata is loading.
      }
    }
    return;
  }

  if (node.dataset.mediaPlaying === 'true') {
    node.dataset.mediaPlaying = 'false';
    media.pause();
  }
}
