import type { AspectRatioId, CanvasElement, CanvasSize, CanvasState } from './types';

export interface CanvasEventMap {
  'element:added': { element: CanvasElement };
  'element:removed': { id: string; element: CanvasElement };
  'element:updated': { id: string; patch: Partial<CanvasElement>; element: CanvasElement };
  'elements:reordered': { elements: CanvasElement[] };
  'selection:changed': { selectedId: string | null; selectedElement: CanvasElement | null };
  'aspect-ratio:changed': { aspectRatio: AspectRatioId; playerSize: CanvasSize };
  'state:changed': { state: CanvasState };
}

export type CanvasEventType = keyof CanvasEventMap;

export type CanvasEventHandler<T extends CanvasEventType> = (
  payload: CanvasEventMap[T],
) => void;

type ListenerMap = {
  [K in CanvasEventType]: Set<CanvasEventHandler<K>>;
};

export class CanvasEventEmitter {
  private readonly listeners: ListenerMap = {
    'element:added': new Set(),
    'element:removed': new Set(),
    'element:updated': new Set(),
    'elements:reordered': new Set(),
    'selection:changed': new Set(),
    'aspect-ratio:changed': new Set(),
    'state:changed': new Set(),
  };

  on<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): () => void {
    this.listeners[event].add(handler);
    return () => this.off(event, handler);
  }

  off<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): void {
    this.listeners[event].delete(handler);
  }

  emit<T extends CanvasEventType>(event: T, payload: CanvasEventMap[T]): void {
    for (const handler of this.listeners[event]) {
      handler(payload);
    }
  }
}
