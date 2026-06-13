import { AudioElementHandler } from '../audio/AudioElement';
import { ImageElementHandler } from '../image/ImageElement';
import { TextElementHandler } from '../text/TextElement';
import { VideoElementHandler } from '../video/VideoElement';
import { BaseCanvasElementHandler } from './BaseCanvasElementHandler';
import type { CanvasElement, CanvasElementType } from './types';

const handlers: { [K in CanvasElementType]: BaseCanvasElementHandler<Extract<CanvasElement, { type: K }>> } = {
  video: new VideoElementHandler(),
  image: new ImageElementHandler(),
  text: new TextElementHandler(),
  audio: new AudioElementHandler(),
};

export function getElementHandler<T extends CanvasElement>(element: T): BaseCanvasElementHandler<T> {
  return handlers[element.type] as BaseCanvasElementHandler<T>;
}

export function getElementHandlerByType<T extends CanvasElementType>(
  type: T,
): BaseCanvasElementHandler<Extract<CanvasElement, { type: T }>> {
  return handlers[type];
}
