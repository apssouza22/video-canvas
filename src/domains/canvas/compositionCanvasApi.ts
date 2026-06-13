import type { CanvasEventHandler, CanvasEventMap, CanvasEventType } from './events';
import type {
  AspectRatioId,
  CanvasElement,
  CanvasElementType,
  CanvasSize,
  CanvasState,
  ElementTransform,
} from './types';

export interface AddMediaOptions {
  type: CanvasElementType;
  src?: string;
  zIndex?: number;
  name?: string;
  transform?: Partial<ElementTransform>;
}

export interface RenderOptions {
  playing?: boolean;
  /** Composition time when the current playback session started. */
  playbackStartedAt?: number;
}

export interface CompositionCanvasAPI {
  addMedia(options: AddMediaOptions): string;
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
  render(time: number, options?: RenderOptions): void;
  getDuration(): number;
  getState(): CanvasState;
  on<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): () => void;
  off<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): void;
}

export type { CanvasEventMap, CanvasEventType, CanvasEventHandler };
