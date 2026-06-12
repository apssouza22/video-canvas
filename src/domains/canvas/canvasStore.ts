import { canvasReducer, initialCanvasState } from './canvasReducer';
import type { AddMediaOptions, CompositionCanvasAPI } from './compositionCanvasApi';
import { createCanvasElement } from './elementFactory';
import type { CanvasEventHandler, CanvasEventType } from './events';
import { CanvasEventEmitter } from './events';
import type { AspectRatioId, CanvasAction, CanvasElement, CanvasState } from './types';

type Listener = () => void;

export class CanvasStore implements CompositionCanvasAPI {
  private state: CanvasState;
  private readonly listeners = new Set<Listener>();
  readonly events = new CanvasEventEmitter();

  constructor(initialState?: Partial<CanvasState>) {
    this.state = {
      ...initialCanvasState,
      ...initialState,
      elements: initialState?.elements ?? initialCanvasState.elements,
    };
  }

  getState(): CanvasState {
    return this.state;
  }

  get selectedElement(): CanvasElement | null {
    return this.state.elements.find((element) => element.id === this.state.selectedId) ?? null;
  }

  getSelectedElement(): CanvasElement | null {
    return this.selectedElement;
  }

  getSelectedId(): string | null {
    return this.state.selectedId;
  }

  getAspectRatio(): AspectRatioId {
    return this.state.aspectRatio;
  }

  getPlayerSize() {
    return this.state.playerSize;
  }

  getElement(id: string): CanvasElement | undefined {
    return this.state.elements.find((element) => element.id === id);
  }

  getElements(): CanvasElement[] {
    return [...this.state.elements];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  on<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): () => void {
    return this.events.on(event, handler);
  }

  off<T extends CanvasEventType>(event: T, handler: CanvasEventHandler<T>): void {
    this.events.off(event, handler);
  }

  dispatch(action: CanvasAction): void {
    const previous = this.state;
    const next = canvasReducer(previous, action);
    if (next === previous) {
      return;
    }

    this.state = next;
    this.emitDiffEvents(previous, next, action);
    this.notify();
  }

  addElement(element: CanvasElement): string {
    this.dispatch({ type: 'ADD_ELEMENT', element });
    return element.id;
  }

  addMedia(options: AddMediaOptions): string {
    const state = this.getState();
    const element = createCanvasElement({
      type: options.type,
      src: options.src,
      zIndex: options.zIndex ?? state.elements.length,
      playerSize: state.playerSize,
    });

    if (options.name) {
      element.name = options.name;
    }

    if (options.transform) {
      Object.assign(element, options.transform);
    }

    return this.addElement(element);
  }

  updateElement(id: string, patch: Partial<CanvasElement>): void {
    this.dispatch({ type: 'UPDATE_ELEMENT', id, patch });
  }

  removeElement(id: string): boolean {
    const element = this.getElement(id);
    if (!element) {
      return false;
    }

    this.dispatch({ type: 'DELETE_ELEMENT', id });
    return true;
  }

  deleteElement(id: string): void {
    this.removeElement(id);
  }

  selectElement(id: string | null): void {
    this.dispatch({ type: 'SELECT_ELEMENT', id });
  }

  setAspectRatio(aspectRatio: AspectRatioId): void {
    this.dispatch({ type: 'SET_ASPECT_RATIO', aspectRatio });
  }

  bringForward(id: string): void {
    this.dispatch({ type: 'BRING_FORWARD', id });
  }

  sendBackward(id: string): void {
    this.dispatch({ type: 'SEND_BACKWARD', id });
  }

  setZIndex(id: string, zIndex: number): void {
    this.dispatch({ type: 'SET_Z_INDEX', id, zIndex });
  }

  private emitDiffEvents(previous: CanvasState, next: CanvasState, action: CanvasAction): void {
    this.events.emit('state:changed', { state: next });

    if (action.type === 'ADD_ELEMENT') {
      const element = next.elements.find((item) => item.id === action.element.id);
      if (element) {
        this.events.emit('element:added', { element });
      }
    }

    if (action.type === 'DELETE_ELEMENT') {
      const element = previous.elements.find((item) => item.id === action.id);
      if (element) {
        this.events.emit('element:removed', { id: action.id, element });
      }
    }

    if (action.type === 'UPDATE_ELEMENT') {
      const element = next.elements.find((item) => item.id === action.id);
      if (element) {
        this.events.emit('element:updated', {
          id: action.id,
          patch: action.patch,
          element,
        });
      }
    }

    if (previous.selectedId !== next.selectedId) {
      this.events.emit('selection:changed', {
        selectedId: next.selectedId,
        selectedElement:
          next.elements.find((element) => element.id === next.selectedId) ?? null,
      });
    }

    if (
      previous.aspectRatio !== next.aspectRatio ||
      previous.playerSize.width !== next.playerSize.width ||
      previous.playerSize.height !== next.playerSize.height
    ) {
      this.events.emit('aspect-ratio:changed', {
        aspectRatio: next.aspectRatio,
        playerSize: next.playerSize,
      });
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
