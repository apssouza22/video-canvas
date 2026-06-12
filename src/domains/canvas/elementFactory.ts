import { DEFAULT_CANVAS_SIZE, SAMPLE_IMAGE_SRC, SAMPLE_VIDEO_SRC } from './constants';
import type { CanvasElement, CanvasElementType } from './types';
import { createElementId } from './utils/id';

interface CreateElementOptions {
  type: CanvasElementType;
  src?: string;
  zIndex: number;
}

export function createCanvasElement({ type, src, zIndex }: CreateElementOptions): CanvasElement {
  const base = {
    id: createElementId(),
    zIndex,
    x: DEFAULT_CANVAS_SIZE.width / 2 - 200,
    y: DEFAULT_CANVAS_SIZE.height / 2 - 120,
    width: 400,
    height: 240,
    rotation: 0,
  };

  if (type === 'video') {
    return {
      ...base,
      type: 'video',
      name: 'Video',
      src: src ?? SAMPLE_VIDEO_SRC,
      muted: true,
      loop: true,
    };
  }

  if (type === 'image') {
    return {
      ...base,
      type: 'image',
      name: 'Image',
      src: src ?? SAMPLE_IMAGE_SRC,
      objectFit: 'cover',
    };
  }

  return {
    ...base,
    type: 'text',
    name: 'Text',
    width: 420,
    height: 120,
    content: 'Double-click style editing in the panel →',
    fontSize: 42,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'transparent',
  };
}
