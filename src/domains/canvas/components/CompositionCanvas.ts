import { CanvasStore } from '../canvasStore';
import { createCompositionCanvasAPI, type CompositionCanvasAPI } from '../compositionCanvasApi';
import type { CanvasState } from '../types';
import { mountCanvasViewport } from './CanvasViewport';

export interface CompositionCanvasOptions {
  initialState?: Partial<CanvasState>;
  className?: string;
}

export interface CompositionCanvasHandle {
  api: CompositionCanvasAPI;
  element: HTMLElement;
  destroy: () => void;
}

export function mountCompositionCanvas(
  container: HTMLElement,
  options: CompositionCanvasOptions = {},
): CompositionCanvasHandle {
  const store = new CanvasStore(options.initialState);

  const root = document.createElement('div');
  root.className = [
    'absolute inset-0 min-w-0 min-h-0 overflow-hidden [contain:layout_size]',
    options.className,
  ]
    .filter(Boolean)
    .join(' ');

  container.append(root);

  const cleanupViewport = mountCanvasViewport(root, store);
  const api = createCompositionCanvasAPI(store, store.events);

  return {
    api,
    element: root,
    destroy: () => {
      cleanupViewport();
      root.remove();
    },
  };
}
