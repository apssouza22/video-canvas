import type { CanvasStore } from '../canvasStore';
import type { Disposable } from '../core/Disposable';
import type { CanvasElement } from '../types';
import { createInitialLayout, observeViewportLayout, type ViewportLayout } from '../viewportLayout';
import { createCanvasElementNode, updateCanvasElementNode } from './CanvasElement';
import {
  createTransformOverlay,
  destroyTransformOverlay,
  updateTransformOverlay,
  type TransformOverlayContext,
} from './TransformOverlay';

export class CanvasViewport implements Disposable {
  private readonly container: HTMLElement;
  private readonly store: CanvasStore;
  private readonly viewport: HTMLDivElement;
  private readonly composition: HTMLDivElement;
  private readonly player: HTMLDivElement;
  private readonly label: HTMLDivElement;

  private layout: ViewportLayout;
  private readonly elementNodes = new Map<string, HTMLDivElement>();
  private overlay: ReturnType<typeof createTransformOverlay> | null = null;
  private overlayElementId: string | null = null;
  private stopObserving = () => {};
  private lastPlayerSize: { width: number; height: number };
  private readonly unsubscribe: () => void;
  private readonly unsubscribeSize: () => void;

  constructor(container: HTMLElement, store: CanvasStore) {
    this.container = container;
    this.store = store;
    this.lastPlayerSize = store.getState().playerSize;

    this.viewport = document.createElement('div');
    this.viewport.className =
      'absolute inset-0 flex items-center justify-center p-12 box-border bg-vc-viewport-bg overflow-hidden';

    const stage = document.createElement('div');
    stage.className = 'flex flex-col items-center gap-2.5 max-w-full max-h-full';

    this.label = document.createElement('div');
    this.label.className =
      'shrink-0 px-2 py-0.5 rounded-md bg-[rgba(62,138,245,0.18)] text-[#d9e8ff] text-[0.7rem] font-semibold tracking-wide uppercase whitespace-nowrap pointer-events-none';

    this.player = document.createElement('div');
    this.player.className = 'relative shrink-0';

    this.composition = document.createElement('div');
    this.composition.className =
      'absolute top-0 left-0 origin-top-left bg-vc-player-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)] overflow-visible';

    const frame = document.createElement('div');
    frame.className =
      'absolute inset-0 border-2 border-[rgba(62,138,245,0.95)] rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none';
    frame.setAttribute('aria-hidden', 'true');

    this.player.append(this.composition, frame);
    stage.append(this.label, this.player);
    this.viewport.append(stage);
    this.container.append(this.viewport);

    this.layout = createInitialLayout(this.store.getState().playerSize);
    this.unsubscribe = this.store.subscribe(() => {
      this.syncElements();
    });
    this.unsubscribeSize = this.store.subscribe(() => {
      this.checkPlayerSize();
    });

    this.bind();
    this.startObserving();
    this.applyLayout();
    this.syncElements();
  }

  destroy(): void {
    this.unsubscribe();
    this.unsubscribeSize();
    this.stopObserving();
    if (this.overlay) {
      destroyTransformOverlay(this.overlay);
    }
    this.viewport.remove();
  }

  private bind(): void {
    this.viewport.addEventListener('pointerdown', () => this.store.selectElement(null));
  }

  private get overlayContext(): TransformOverlayContext {
    return {
      getCompositionRect: () => this.composition.getBoundingClientRect(),
      getScale: () => this.layout.scale,
      onTransform: (patch) => {
        const selected = this.store.selectedElement;
        if (selected) {
          this.store.updateElement(selected.id, patch);
        }
      },
    };
  }

  private applyLayout(): void {
    const { playerSize } = this.store.getState();
    const aspectRatio = playerSize.width / playerSize.height;

    this.player.style.width = `${this.layout.displayWidth}px`;
    this.player.style.height = `${this.layout.displayHeight}px`;
    this.player.style.aspectRatio = String(aspectRatio);

    this.composition.style.width = `${playerSize.width}px`;
    this.composition.style.height = `${playerSize.height}px`;
    this.composition.style.transform = `scale(${this.layout.scale})`;

    this.label.textContent = `Export · ${playerSize.width} × ${playerSize.height}`;
  }

  private syncElements(): void {
    const state = this.store.getState();
    const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const nextIds = new Set(sorted.map((element) => element.id));

    for (const [id, node] of this.elementNodes) {
      if (!nextIds.has(id)) {
        node.remove();
        this.elementNodes.delete(id);
      }
    }

    for (const element of sorted) {
      const existing = this.elementNodes.get(element.id);
      if (existing) {
        updateCanvasElementNode(existing, element);
      } else {
        const node = createCanvasElementNode(element, (id) => this.store.selectElement(id));
        this.elementNodes.set(element.id, node);
        this.composition.append(node);
      }
    }

    this.syncOverlay(
      state.selectedId ? sorted.find((element) => element.id === state.selectedId) ?? null : null,
    );
  }

  private syncOverlay(element: CanvasElement | null): void {
    if (!element) {
      if (this.overlay) {
        destroyTransformOverlay(this.overlay);
        this.overlay = null;
        this.overlayElementId = null;
      }
      return;
    }

    if (this.overlay && this.overlayElementId === element.id) {
      updateTransformOverlay(this.overlay);
      return;
    }

    if (this.overlay) {
      destroyTransformOverlay(this.overlay);
    }

    this.overlayElementId = element.id;
    this.overlay = createTransformOverlay(
      () => this.store.selectedElement ?? element,
      this.overlayContext,
    );
    this.composition.append(this.overlay);
  }

  private startObserving(): void {
    this.stopObserving();
    this.stopObserving = observeViewportLayout(
      this.container,
      this.label,
      this.store.getState().playerSize,
      (nextLayout) => {
        this.layout = nextLayout;
        this.applyLayout();
      },
    );
  }

  private checkPlayerSize(): void {
    const { playerSize } = this.store.getState();
    if (
      playerSize.width !== this.lastPlayerSize.width ||
      playerSize.height !== this.lastPlayerSize.height
    ) {
      this.lastPlayerSize = playerSize;
      this.layout = createInitialLayout(playerSize);
      this.applyLayout();
      this.startObserving();
    }
  }
}
