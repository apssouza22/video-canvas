import type { RenderOptions } from './compositionPreviewApi';
import {
  applyElementStyles,
  BASE_ELEMENT_CLASS,
  type CanvasElementNodeRefs,
} from './elementShared';
import { getElementHandler } from './registry';
import type { CanvasElement as CanvasElementType } from './types';

export type { CanvasElementNodeRefs };

export function createCanvasElementNode(
  element: CanvasElementType,
  onSelect: (id: string) => void,
): CanvasElementNodeRefs {
  const handler = getElementHandler(element);
  const node = document.createElement('div');
  node.className = `${BASE_ELEMENT_CLASS} canvas-element--${element.type}`;
  node.dataset.elementId = element.id;
  applyElementStyles(node, element);
  handler.configureNode(node, element, onSelect);

  const content = handler.createContent(element);
  node.replaceChildren(content.node);
  return { node, media: content.media, text: content.text };
}

export function updateCanvasElementNode(
  refs: CanvasElementNodeRefs,
  element: CanvasElementType,
): void {
  applyElementStyles(refs.node, element);
  getElementHandler(element).updateContent(refs, element);
}

export function syncElementPlayback(
  refs: CanvasElementNodeRefs,
  element: CanvasElementType,
  compositionTime: number,
  options: RenderOptions = {},
): void {
  getElementHandler(element).syncPlayback(refs, element, compositionTime, options);
}
