import { elementTransformStyle } from '../transform/transform';
import type { RenderOptions } from './compositionCanvasApi';
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

  const isPlaying = options.playing ?? false;
  const mediaTime = getVideoMediaTime(element, compositionTime, options);
  const isVideo = media instanceof HTMLVideoElement;

  // Scrubbing and audio need direct seeks; playing video is corrected via RVFC.
  const shouldSeek = !isPlaying || !isVideo;
  if (shouldSeek && Math.abs(media.currentTime - mediaTime) > 0.15) {
    try {
      media.currentTime = mediaTime;
    } catch {
      // Ignore seek errors while metadata is loading.
    }
  }

  if (isPlaying) {
    if (node.dataset.mediaPlaying !== 'true') {
      node.dataset.mediaPlaying = 'true';
      void media.play().catch(() => {
        // Autoplay may be blocked until the user interacts with the page.
      });
    }
    return;
  }

  if (node.dataset.mediaPlaying === 'true') {
    node.dataset.mediaPlaying = 'false';
    media.pause();
  }
}
