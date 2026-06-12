import { CanvasStore } from '../canvasStore';
import type { AddMediaOptions, CompositionCanvasAPI } from '../compositionCanvasApi';
import type { CanvasEventHandler, CanvasEventType } from '../events';
import type { Disposable } from '../core/Disposable';
import type { AspectRatioId, CanvasElement, CanvasSize, CanvasState } from '../types';
import { CanvasViewport } from './CanvasViewport';

export interface CompositionCanvasOptions {
  initialState?: Partial<CanvasState>;
  className?: string;
}

export class CompositionCanvas implements CompositionCanvasAPI, Disposable {
  readonly element: HTMLDivElement;
  private readonly store: CanvasStore;
  private viewport: CanvasViewport | null = null;

  constructor(container: HTMLElement, options: CompositionCanvasOptions = {}) {
    this.store = new CanvasStore(options.initialState);
    this.element = document.createElement('div');
    this.element.className = [
      'absolute inset-0 min-w-0 min-h-0 overflow-hidden [contain:layout_size]',
      options.className,
    ]
      .filter(Boolean)
      .join(' ');

    container.append(this.element);
    this.viewport = new CanvasViewport(this.element, this.store);
  }

  addMedia(options: AddMediaOptions): string {
    return this.store.addMedia(options);
  }

  addElement(element: CanvasElement): string {
    return this.store.addElement(element);
  }

  removeElement(id: string): boolean {
    return this.store.removeElement(id);
  }

  updateElement(id: string, patch: Partial<CanvasElement>): void {
    this.store.updateElement(id, patch);
  }

  getElement(id: string): CanvasElement | undefined {
    return this.store.getElement(id);
  }

  getElements(): CanvasElement[] {
    return this.store.getElements();
  }

  selectElement(id: string | null): void {
    this.store.selectElement(id);
  }

  getSelectedElement(): CanvasElement | null {
    return this.store.getSelectedElement();
  }

  getSelectedId(): string | null {
    return this.store.getSelectedId();
  }

  bringForward(id: string): void {
    this.store.bringForward(id);
  }

  sendBackward(id: string): void {
    this.store.sendBackward(id);
  }

  setZIndex(id: string, zIndex: number): void {
    this.store.setZIndex(id, zIndex);
  }

  setAspectRatio(aspectRatio: AspectRatioId): void {
    this.store.setAspectRatio(aspectRatio);
  }

  getAspectRatio(): AspectRatioId {
    return this.store.getAspectRatio();
  }

  getPlayerSize(): CanvasSize {
    return this.store.getPlayerSize();
  }

  getState(): CanvasState {
    return this.store.getState();
  }

  on<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): () => void {
    return this.store.on(event, handler);
  }

  off<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): void {
    this.store.off(event, handler);
  }

  destroy(): void {
    this.viewport?.destroy();
    this.viewport = null;
    this.element.remove();
  }
}

export function mountCompositionCanvas(
  container: HTMLElement,
  options: CompositionCanvasOptions = {},
): CompositionCanvas {
  return new CompositionCanvas(container, options);
}
