import type { CanvasEventEmitter, CanvasEventHandler, CanvasEventMap, CanvasEventType } from './events';
import type { AspectRatioId, CanvasElement, CanvasElementType, CanvasSize, CanvasState, ElementTransform } from './types';

export interface AddMediaOptions {
  type: CanvasElementType;
  src?: string;
  zIndex?: number;
  name?: string;
  transform?: Partial<ElementTransform>;
}

export interface CompositionCanvasAPI {
  addMedia(options: AddMediaOptions): string;
  addElement(element: CanvasElement): string;
  removeElement(id: string): boolean;
  updateElement(id: string, patch: Partial<CanvasElement>): void;
  getElement(id: string): CanvasElement | undefined;
  getElements(): CanvasElement[];
  selectElement(id: string | null): void;
  getSelectedElement(): CanvasElement | null;
  getSelectedId(): string | null;
  bringForward(id: string): void;
  sendBackward(id: string): void;
  setZIndex(id: string, zIndex: number): void;
  setAspectRatio(aspectRatio: AspectRatioId): void;
  getAspectRatio(): AspectRatioId;
  getPlayerSize(): CanvasSize;
  getState(): CanvasState;
  on<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): () => void;
  off<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): void;
}

export function createCompositionCanvasAPI(
  store: {
    getState(): CanvasState;
    get selectedElement(): CanvasElement | null;
    addElement(element: CanvasElement): void;
    updateElement(id: string, patch: Partial<CanvasElement>): void;
    deleteElement(id: string): void;
    selectElement(id: string | null): void;
    setAspectRatio(aspectRatio: AspectRatioId): void;
    bringForward(id: string): void;
    sendBackward(id: string): void;
    setZIndex(id: string, zIndex: number): void;
    addMedia(options: AddMediaOptions): string;
  },
  events: CanvasEventEmitter,
): CompositionCanvasAPI {
  return {
    addMedia: (options) => store.addMedia(options),
    addElement: (element) => {
      store.addElement(element);
      return element.id;
    },
    removeElement: (id) => {
      const element = store.getState().elements.find((item) => item.id === id);
      if (!element) {
        return false;
      }
      store.deleteElement(id);
      return true;
    },
    updateElement: (id, patch) => store.updateElement(id, patch),
    getElement: (id) => store.getState().elements.find((item) => item.id === id),
    getElements: () => [...store.getState().elements],
    selectElement: (id) => store.selectElement(id),
    getSelectedElement: () => store.selectedElement,
    getSelectedId: () => store.getState().selectedId,
    bringForward: (id) => store.bringForward(id),
    sendBackward: (id) => store.sendBackward(id),
    setZIndex: (id, zIndex) => store.setZIndex(id, zIndex),
    setAspectRatio: (aspectRatio) => store.setAspectRatio(aspectRatio),
    getAspectRatio: () => store.getState().aspectRatio,
    getPlayerSize: () => store.getState().playerSize,
    getState: () => store.getState(),
    on: (event, handler) => events.on(event, handler),
    off: (event, handler) => events.off(event, handler),
  };
}

export type { CanvasEventMap, CanvasEventType, CanvasEventHandler };
