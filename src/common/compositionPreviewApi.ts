import type { CanvasEventHandler, CanvasEventMap, CanvasEventType } from '../event/events';
import type {
  AspectRatioId,
  CanvasElement,
  CanvasSize,
  CanvasState,
} from './types';

export interface RenderOptions {
  playing?: boolean;
  /** Composition time when the current playback session started. */
  playbackStartedAt?: number;
  /** Timeline playback speed multiplier (e.g. 2 for 2x). */
  playbackRate?: number;
}

export interface CompositionPreviewAPI {
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
  render(time: number, options?: RenderOptions): void;
  getCurrentTime(): number;
  getDuration(): number;
  getActiveElementIds(time?: number): string[];
  getNextVisibilityBoundaryAfter(time?: number): number | null;
  getState(): CanvasState;
  loadState(state: CanvasState): void;
  on<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): () => void;
  off<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): void;
}

export type { CanvasEventMap, CanvasEventType, CanvasEventHandler };
