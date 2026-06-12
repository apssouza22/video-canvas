import type { CanvasElement as CanvasElementType } from '../types';
import { elementTransformStyle } from '../utils/transform';

const baseClass =
  'absolute box-border cursor-move select-none touch-none';

export function createCanvasElementNode(
  element: CanvasElementType,
  onSelect: (id: string) => void,
): HTMLDivElement {
  const node = document.createElement('div');
  node.className = `${baseClass} canvas-element--${element.type}`;
  node.dataset.elementId = element.id;
  applyElementStyles(node, element);

  node.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    onSelect(element.id);
  });

  node.replaceChildren(createElementContent(element));
  return node;
}

export function updateCanvasElementNode(
  node: HTMLDivElement,
  element: CanvasElementType,
): void {
  applyElementStyles(node, element);

  const media = node.querySelector<HTMLVideoElement | HTMLImageElement>('.canvas-element__media');
  const text = node.querySelector<HTMLDivElement>('.canvas-element__text');

  if (element.type === 'video' && media instanceof HTMLVideoElement) {
    if (media.src !== element.src) {
      media.src = element.src;
    }
    media.muted = element.muted;
    media.loop = element.loop;
    return;
  }

  if (element.type === 'image' && media instanceof HTMLImageElement) {
    if (media.src !== element.src) {
      media.src = element.src;
    }
    media.alt = element.name;
    media.style.objectFit = element.objectFit;
    return;
  }

  if (element.type === 'text' && text) {
    text.textContent = element.content;
    text.style.fontSize = `${element.fontSize}px`;
    text.style.fontFamily = element.fontFamily;
    text.style.fontWeight = String(element.fontWeight);
    text.style.color = element.color;
    text.style.textAlign = element.textAlign;
    text.style.backgroundColor = element.backgroundColor;
  }
}

function applyElementStyles(node: HTMLDivElement, element: CanvasElementType): void {
  const style = elementTransformStyle(element);
  Object.assign(node.style, {
    left: `${style.left}px`,
    top: `${style.top}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    transform: style.transform,
    transformOrigin: style.transformOrigin,
    zIndex: String(element.zIndex),
  });
}

function createElementContent(element: CanvasElementType): HTMLElement {
  if (element.type === 'video') {
    const video = document.createElement('video');
    video.className = 'block w-full h-full pointer-events-none canvas-element__media';
    video.src = element.src;
    video.muted = element.muted;
    video.loop = element.loop;
    video.autoplay = true;
    video.playsInline = true;
    return video;
  }

  if (element.type === 'image') {
    const image = document.createElement('img');
    image.className = 'block w-full h-full pointer-events-none canvas-element__media';
    image.src = element.src;
    image.alt = element.name;
    image.draggable = false;
    image.style.objectFit = element.objectFit;
    return image;
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
  return text;
}
