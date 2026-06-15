import type { CompositionClip } from './clips';
import { DEFAULT_ASPECT_RATIO, DEFAULT_PLAYER_SIZE } from './constants';
import type { CanvasEventHandler, CanvasEventType } from '../event/events';
import { CanvasEventEmitter } from '../event/events';
import type { AspectRatioId, CanvasElement, CanvasState } from './types';
import { getPlayerSizeFromAspectRatio } from '../viewport/player';
import { getCompositionDuration } from './timing';
import { VisibilityTimeline } from './visibilityTimeline';

type Listener = () => void;

export const initialCanvasState: CanvasState = {
  elements: [],
  selectedId: null,
  playerSize: DEFAULT_PLAYER_SIZE,
  aspectRatio: DEFAULT_ASPECT_RATIO,
};

function normalizeZIndex(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((element, index) => ({ ...element, zIndex: index }));
}

function sortByZIndex(elements: CanvasElement[]): CanvasElement[] {
  return elements.slice().sort((a, b) => a.zIndex - b.zIndex);
}

export class CanvasStore {
  private state: CanvasState;
  private readonly listeners = new Set<Listener>();
  private readonly visibilityTimeline = new VisibilityTimeline();
  readonly events = new CanvasEventEmitter();

  constructor(initialState?: Partial<CanvasState>) {
    this.state = {
      ...initialCanvasState,
      ...initialState,
      elements: initialState?.elements ?? initialCanvasState.elements,
    };
    this.rebuildVisibilityIndex();
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

  getDuration(): number {
    return getCompositionDuration(this.state.elements);
  }

  getActiveElementIds(time: number): string[] {
    return this.visibilityTimeline.getActiveIds(time);
  }

  getNextVisibilityBoundaryAfter(time: number): number | null {
    return this.visibilityTimeline.getNextBoundaryAfter(time);
  }

  getElement(id: string): CanvasElement | undefined {
    return this.state.elements.find((element) => element.id === id);
  }

  getElements(): CanvasElement[] {
    return [...this.state.elements];
  }

  loadState(state: CanvasState): void {
    const previous = this.state;
    this.state = {
      ...initialCanvasState,
      ...state,
      elements: state.elements ?? initialCanvasState.elements,
    };
    this.rebuildVisibilityIndex();
    this.commit(previous);
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

  addElement(element: CanvasElement): string {
    const previous = this.state;

    this.state = {
      ...this.state,
      elements: normalizeZIndex(sortByZIndex([...this.state.elements, element])),
      selectedId: element.id,
    };

    const added = this.getElement(element.id);
    if (added) {
      this.rebuildVisibilityIndex();
      this.commit(previous, { element: added });
    }

    return element.id;
  }

  addLayer(clip: CompositionClip): string {
    const element = clip.toElement({
      zIndex: this.state.elements.length,
      playerSize: this.state.playerSize,
    });

    return this.addElement(element);
  }

  updateElement(id: string, patch: Partial<CanvasElement>): void {
    const previous = this.state;
    const elements = this.state.elements.map((element) =>
      element.id === id ? ({ ...element, ...patch } as CanvasElement) : element,
    );

    this.state = { ...this.state, elements };

    const updated = this.getElement(id);
    if (updated) {
      this.rebuildVisibilityIndex();
      this.commit(previous, { id, patch, element: updated });
    }
  }

  removeElement(id: string): boolean {
    const element = this.getElement(id);
    if (!element) {
      return false;
    }

    const previous = this.state;

    this.state = {
      ...this.state,
      elements: normalizeZIndex(this.state.elements.filter((item) => item.id !== id)),
      selectedId: this.state.selectedId === id ? null : this.state.selectedId,
    };

    this.rebuildVisibilityIndex();
    this.commit(previous, { removedId: id, removedElement: element });
    return true;
  }

  selectElement(id: string | null): void {
    const previous = this.state;
    this.state = { ...this.state, selectedId: id };
    this.commit(previous);
  }

  setAspectRatio(aspectRatio: AspectRatioId): void {
    if (aspectRatio === this.state.aspectRatio) {
      return;
    }

    const previous = this.state;

    this.state = {
      ...this.state,
      aspectRatio,
      playerSize: getPlayerSizeFromAspectRatio(aspectRatio),
    };

    this.commit(previous);
  }

  bringForward(id: string): void {
    const index = this.state.elements.findIndex((element) => element.id === id);
    if (index === -1 || index === this.state.elements.length - 1) {
      return;
    }

    const previous = this.state;
    const elements = this.state.elements.slice();
    const [item] = elements.splice(index, 1);
    elements.splice(index + 1, 0, item);

    this.state = { ...this.state, elements: normalizeZIndex(elements) };
    this.commit(previous);
    this.events.emit('elements:reordered', { elements: this.state.elements });
  }

  sendBackward(id: string): void {
    const index = this.state.elements.findIndex((element) => element.id === id);
    if (index <= 0) {
      return;
    }

    const previous = this.state;
    const elements = this.state.elements.slice();
    const [item] = elements.splice(index, 1);
    elements.splice(index - 1, 0, item);

    this.state = { ...this.state, elements: normalizeZIndex(elements) };
    this.commit(previous);
    this.events.emit('elements:reordered', { elements: this.state.elements });
  }

  setZIndex(id: string, zIndex: number): void {
    const index = this.state.elements.findIndex((element) => element.id === id);
    if (index === -1) {
      return;
    }

    const previous = this.state;
    const elements = this.state.elements.slice();
    const [item] = elements.splice(index, 1);
    const targetIndex = Math.max(0, Math.min(zIndex, elements.length));
    elements.splice(targetIndex, 0, item);

    this.state = { ...this.state, elements: normalizeZIndex(elements) };
    this.commit(previous);
    this.events.emit('elements:reordered', { elements: this.state.elements });
  }

  private commit(
    previous: CanvasState,
    change?: {
      element?: CanvasElement;
      id?: string;
      patch?: Partial<CanvasElement>;
      removedId?: string;
      removedElement?: CanvasElement;
    },
  ): void {
    this.events.emit('state:changed', { state: this.state });

    if (change?.element && !change.id && !change.removedId) {
      this.events.emit('element:added', { element: change.element });
    }

    if (change?.removedId && change.removedElement) {
      this.events.emit('element:removed', {
        id: change.removedId,
        element: change.removedElement,
      });
    }

    if (change?.id && change.patch && change.element) {
      this.events.emit('element:updated', {
        id: change.id,
        patch: change.patch,
        element: change.element,
      });
    }

    if (previous.selectedId !== this.state.selectedId) {
      this.events.emit('selection:changed', {
        selectedId: this.state.selectedId,
        selectedElement:
          this.state.elements.find((element) => element.id === this.state.selectedId) ?? null,
      });
    }

    if (
      previous.aspectRatio !== this.state.aspectRatio ||
      previous.playerSize.width !== this.state.playerSize.width ||
      previous.playerSize.height !== this.state.playerSize.height
    ) {
      this.events.emit('aspect-ratio:changed', {
        aspectRatio: this.state.aspectRatio,
        playerSize: this.state.playerSize,
      });
    }

    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private rebuildVisibilityIndex(): void {
    this.visibilityTimeline.rebuild(this.state.elements);
  }
}
