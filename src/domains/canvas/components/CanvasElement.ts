import type { RenderOptions } from '../compositionCanvasApi';
import type { CanvasElement as CanvasElementType } from '../types';
import { getVideoMediaTime } from '../utils/timing';
import { elementTransformStyle } from '../utils/transform';

const baseClass =
  'absolute box-border cursor-move select-none touch-none [contain:layout_style_paint]';

export interface CanvasElementNodeRefs {
  node: HTMLDivElement;
  media?: HTMLVideoElement | HTMLAudioElement | HTMLImageElement;
  text?: HTMLDivElement;
}

export function createCanvasElementNode(
  element: CanvasElementType,
  onSelect: (id: string) => void,
): CanvasElementNodeRefs {
  const node = document.createElement('div');
  node.className = `${baseClass} canvas-element--${element.type}`;
  node.dataset.elementId = element.id;
  applyElementStyles(node, element);

  if (element.type === 'audio') {
    node.style.display = 'none';
    node.style.pointerEvents = 'none';
  } else {
    node.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      onSelect(element.id);
    });
  }

  const content = createElementContent(element);
  node.replaceChildren(content.node);
  return { node, media: content.media, text: content.text };
}

export function updateCanvasElementNode(
  refs: CanvasElementNodeRefs,
  element: CanvasElementType,
): void {
  applyElementStyles(refs.node, element);

  const { media, text } = refs;

  if (element.type === 'video' && media instanceof HTMLVideoElement) {
    if (media.src !== element.src) {
      media.src = element.src;
    }
    if (media.muted !== element.muted) {
      media.muted = element.muted;
    }
    if (media.loop !== element.loop) {
      media.loop = element.loop;
    }
    return;
  }

  if (element.type === 'image' && media instanceof HTMLImageElement) {
    if (media.src !== element.src) {
      media.src = element.src;
    }
    if (media.alt !== element.name) {
      media.alt = element.name;
    }
    const objectFit = element.objectFit;
    if (media.style.objectFit !== objectFit) {
      media.style.objectFit = objectFit;
    }
    return;
  }

  if (element.type === 'audio' && media instanceof HTMLAudioElement) {
    if (media.src !== element.src) {
      media.src = element.src;
    }
    if (media.loop !== element.loop) {
      media.loop = element.loop;
    }
    if (media.volume !== element.volume) {
      media.volume = element.volume;
    }
    return;
  }

  if (element.type === 'text' && text) {
    if (text.textContent !== element.content) {
      text.textContent = element.content;
    }
    const fontSize = `${element.fontSize}px`;
    if (text.style.fontSize !== fontSize) {
      text.style.fontSize = fontSize;
    }
    if (text.style.fontFamily !== element.fontFamily) {
      text.style.fontFamily = element.fontFamily;
    }
    const fontWeight = String(element.fontWeight);
    if (text.style.fontWeight !== fontWeight) {
      text.style.fontWeight = fontWeight;
    }
    if (text.style.color !== element.color) {
      text.style.color = element.color;
    }
    if (text.style.textAlign !== element.textAlign) {
      text.style.textAlign = element.textAlign;
    }
    if (text.style.backgroundColor !== element.backgroundColor) {
      text.style.backgroundColor = element.backgroundColor;
    }
  }
}

function applyElementStyles(node: HTMLDivElement, element: CanvasElementType): void {
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

function createElementContent(element: CanvasElementType): {
  node: HTMLElement;
  media?: HTMLVideoElement | HTMLAudioElement | HTMLImageElement;
  text?: HTMLDivElement;
} {
  if (element.type === 'video') {
    const video = document.createElement('video');
    video.className = 'block w-full h-full pointer-events-none canvas-element__media';
    video.src = element.src;
    video.muted = element.muted;
    video.loop = element.loop;
    video.playsInline = true;
    video.preload = 'auto';
    return { node: video, media: video };
  }

  if (element.type === 'image') {
    const image = document.createElement('img');
    image.className = 'block w-full h-full pointer-events-none canvas-element__media';
    image.src = element.src;
    image.alt = element.name;
    image.draggable = false;
    image.style.objectFit = element.objectFit;
    image.loading = 'lazy';
    image.decoding = 'async';
    return { node: image, media: image };
  }

  if (element.type === 'audio') {
    const audio = document.createElement('audio');
    audio.className = 'canvas-element__media';
    audio.src = element.src;
    audio.loop = element.loop;
    audio.volume = element.volume;
    audio.preload = 'auto';
    return { node: audio, media: audio };
  }

  const text = document.createElement('div');
  text.className =
    'canvas-element__text flex items-center justify-center p-2 box-border whitespace-pre-wrap break-words w-full h-full pointer-events-none';
  text.textContent = element.content;
  text.style.fontSize = `${element.fontSize}px`;
  text.style.fontFamily = element.fontFamily;
  text.style.fontWeight = String(element.fontWeight);
  text.style.color = element.color;
  text.style.textAlign = element.textAlign;
  text.style.backgroundColor = element.backgroundColor;
  return { node: text, text };
}

export function syncElementPlayback(
  refs: CanvasElementNodeRefs,
  element: CanvasElementType,
  compositionTime: number,
  options: RenderOptions = {},
): void {
  if (element.type !== 'video' && element.type !== 'audio') {
    return;
  }

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
