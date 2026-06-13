import type { ImageCanvasElement } from '../common/types';
import { BaseCanvasElementHandler } from '../common/BaseCanvasElementHandler';
import {
  createElementBase,
  type CanvasElementNodeRefs,
  type CreateElementOptions,
} from '../common/elementShared';
import { SAMPLE_IMAGE_SRC } from './constants';

export class ImageElementHandler extends BaseCanvasElementHandler<ImageCanvasElement> {
  readonly type = 'image' as const;

  createDefault({ src, ...options }: CreateElementOptions): ImageCanvasElement {
    return {
      ...createElementBase(options),
      type: 'image',
      name: 'Image',
      src: src ?? SAMPLE_IMAGE_SRC,
      objectFit: 'cover',
    };
  }

  createContent(element: ImageCanvasElement) {
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

  updateContent(
    refs: Pick<CanvasElementNodeRefs, 'media' | 'text'>,
    element: ImageCanvasElement,
  ): void {
    const { media } = refs;
    if (!(media instanceof HTMLImageElement)) {
      return;
    }

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
  }
}
