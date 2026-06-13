import type { CanvasElement, CanvasElementType, CanvasSize } from './types';
import { getElementHandlerByType } from './elements';

interface CreateElementOptions {
  type: CanvasElementType;
  src?: string;
  zIndex: number;
  playerSize?: CanvasSize;
}

export function createCanvasElement({
  type,
  src,
  zIndex,
  playerSize,
}: CreateElementOptions): CanvasElement {
  return getElementHandlerByType(type).createDefault({ src, zIndex, playerSize });
}
