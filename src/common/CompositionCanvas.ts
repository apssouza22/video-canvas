import type { CompositionClip } from './clips';
import { CanvasStore } from './canvasStore';
import type { CompositionCanvasAPI, RenderOptions } from './compositionCanvasApi';
import type { CanvasEventHandler, CanvasEventType } from '../event/events';
import type { Disposable } from './Disposable';
import type { AspectRatioId, CanvasElement, CanvasSize, CanvasState } from './types';
import { CanvasViewport } from '../viewport/CanvasViewport';

const ROOT_CLASSES = ['min-w-0', 'min-h-0', 'overflow-hidden', '[contain:layout_size]'];

export interface CompositionCanvasOptions {
  initialState?: Partial<CanvasState>;
  className?: string;
}

export class CompositionCanvas implements CompositionCanvasAPI, Disposable {
  readonly element: HTMLElement;
  private readonly store: CanvasStore;
  private viewport: CanvasViewport | null = null;
  private currentTime = 0;

  constructor(container: HTMLElement, options: CompositionCanvasOptions = {}) {
    this.element = container;
    for (const className of ROOT_CLASSES) {
      this.element.classList.add(className);
    }

    if (options.className) {
      for (const className of options.className.split(/\s+/).filter(Boolean)) {
        this.element.classList.add(className);
      }
    }

    this.store = new CanvasStore(options.initialState);
    this.viewport = new CanvasViewport(this.element, this.store);
    this.render(0);
  }

  addLayer(clip: CompositionClip): this {
    this.store.addLayer(clip);
    return this;
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

  render(time: number, options: RenderOptions = {}): void {
    this.currentTime = time;
    this.viewport?.render(time, options);
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.store.getDuration();
  }

  getActiveElementIds(time = this.currentTime): string[] {
    return this.store.getActiveElementIds(time);
  }

  getNextVisibilityBoundaryAfter(time = this.currentTime): number | null {
    return this.store.getNextVisibilityBoundaryAfter(time);
  }

  getState(): CanvasState {
    return this.store.getState();
  }

  loadState(state: CanvasState): void {
    this.store.loadState(state);
    this.render(this.currentTime, { playing: false });
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
  }
}

export function mountCompositionCanvas(
  container: HTMLElement,
  options: CompositionCanvasOptions = {},
): CompositionCanvas {
  return new CompositionCanvas(container, options);
}
