import type { RenderOptions } from '../compositionCanvasApi';
import type { CanvasStore } from '../canvasStore';
import type { Disposable } from '../core/Disposable';
import type { CanvasElement } from '../types';
import { getElementHandler } from '../elements';
import { createInitialLayout, observeViewportLayout, type ViewportLayout } from '../viewportLayout';
import { getVideoMediaTime } from '../utils/timing';
import {
  createCanvasElementNode,
  syncElementPlayback,
  updateCanvasElementNode,
  type CanvasElementNodeRefs,
} from './CanvasElement';
import { startVideoFrameSync } from '../utils/videoFrameSync';
import {
  createTransformOverlay,
  destroyTransformOverlay,
  updateTransformOverlay,
  type TransformOverlayContext,
} from './TransformOverlay';

interface ElementNodeEntry extends CanvasElementNodeRefs {
  visible: boolean;
  stopVideoFrameSync?: () => void;
}

export class CanvasViewport implements Disposable {
  private readonly container: HTMLElement;
  private readonly store: CanvasStore;
  private readonly viewport: HTMLDivElement;
  private readonly composition: HTMLDivElement;
  private readonly player: HTMLDivElement;
  private readonly label: HTMLDivElement;

  private layout: ViewportLayout;
  private readonly elementNodes = new Map<string, ElementNodeEntry>();
  private overlay: ReturnType<typeof createTransformOverlay> | null = null;
  private overlayElementId: string | null = null;
  private stopObserving = () => {};
  private lastPlayerSize: { width: number; height: number };
  private renderTime = 0;
  private renderOptions: RenderOptions = {};
  private renderRafId: number | null = null;
  private activeElementIds = new Set<string>();
  private readonly unsubscribe: () => void;

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
      'absolute top-0 left-0 origin-top-left bg-vc-player-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)] overflow-visible [contain:layout]';

    const frame = document.createElement('div');
    frame.className =
      'absolute inset-0 border-2 border-[rgba(62,138,245,0.95)] rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none';
    frame.setAttribute('aria-hidden', 'true');

    this.player.append(this.composition, frame);
    stage.append(this.label, this.player);
    this.viewport.append(stage);
    this.container.append(this.viewport);

    this.layout = createInitialLayout(this.store.getState().playerSize);
    this.unsubscribe = this.bindStore();
    this.bind();
    this.startObserving();
    this.applyLayout();
    this.syncAllElements();
  }

  destroy(): void {
    this.unsubscribe();
    this.cancelScheduledRender();
    this.stopAllVideoFrameSync();
    this.stopObserving();
    if (this.overlay) {
      destroyTransformOverlay(this.overlay);
    }
    this.viewport.remove();
  }

  render(time: number, options: RenderOptions = {}): void {
    this.renderTime = time;
    this.renderOptions = options;
    this.scheduleRender();
  }

  private bindStore(): () => void {
    const { events } = this.store;
    const unsubs = [
      events.on('element:added', ({ element }) => {
        this.addElementNode(element);
        this.flushRender();
      }),
      events.on('element:removed', ({ id }) => {
        this.removeElementNode(id);
        this.flushRender();
      }),
      events.on('element:updated', ({ element }) => {
        this.updateElementNode(element);
        this.flushRender();
      }),
      events.on('elements:reordered', ({ elements }) => {
        this.reorderElementNodes(elements);
        this.flushRender();
      }),
      events.on('selection:changed', () => {
        this.flushRender();
      }),
      events.on('aspect-ratio:changed', () => {
        this.checkPlayerSize();
      }),
    ];

    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  }

  private bind(): void {
    this.viewport.addEventListener('pointerdown', () => {
      if (!this.renderOptions.playing) {
        this.store.selectElement(null);
      }
    });
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

  private syncAllElements(): void {
    const { elements } = this.store.getState();
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const nextIds = new Set(sorted.map((element) => element.id));

    for (const [id, entry] of this.elementNodes) {
      if (!nextIds.has(id)) {
        entry.node.remove();
        this.elementNodes.delete(id);
      }
    }

    for (const element of sorted) {
      const existing = this.elementNodes.get(element.id);
      if (existing) {
        updateCanvasElementNode(existing, element);
      } else {
        this.addElementNode(element);
      }
    }

    this.reorderElementNodes(sorted);
    this.flushRender();
  }

  private addElementNode(element: CanvasElement): void {
    if (this.elementNodes.has(element.id)) {
      this.updateElementNode(element);
      return;
    }

    const refs = createCanvasElementNode(element, (id) => {
      if (!this.renderOptions.playing) {
        this.store.selectElement(id);
      }
    });

    const entry: ElementNodeEntry = {
      ...refs,
      visible: this.store.getActiveElementIds(this.renderTime).includes(element.id),
    };
    this.setElementVisibility(entry, entry.visible);
    this.elementNodes.set(element.id, entry);
    this.composition.append(entry.node);
  }

  private removeElementNode(id: string): void {
    const entry = this.elementNodes.get(id);
    if (!entry) {
      return;
    }

    this.stopVideoFrameSync(entry);
    entry.node.remove();
    this.elementNodes.delete(id);
    this.activeElementIds.delete(id);
  }

  private updateElementNode(element: CanvasElement): void {
    const entry = this.elementNodes.get(element.id);
    if (!entry) {
      this.addElementNode(element);
      return;
    }

    updateCanvasElementNode(entry, element);
  }

  private reorderElementNodes(elements: CanvasElement[]): void {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    let previous: HTMLElement | null = null;

    for (const element of sorted) {
      const entry = this.elementNodes.get(element.id);
      if (!entry) {
        continue;
      }

      const { node } = entry;
      if (previous === null) {
        if (this.composition.firstChild !== node) {
          this.composition.prepend(node);
        }
      } else if (previous.nextSibling !== node) {
        this.composition.insertBefore(node, previous.nextSibling);
      }

      previous = node;
    }
  }

  private scheduleRender(): void {
    if (this.renderRafId !== null) {
      return;
    }

    this.renderRafId = requestAnimationFrame(() => {
      this.renderRafId = null;
      this.runRender();
    });
  }

  private flushRender(): void {
    this.cancelScheduledRender();
    this.runRender();
  }

  private cancelScheduledRender(): void {
    if (this.renderRafId !== null) {
      cancelAnimationFrame(this.renderRafId);
      this.renderRafId = null;
    }
  }

  private runRender(): void {
    const isPlaying = this.renderOptions.playing ?? false;
    this.composition.style.willChange = isPlaying ? 'transform' : '';

    this.syncPlayback();
    this.syncSelectionOverlay();
  }

  private syncSelectionOverlay(): void {
    const state = this.store.getState();
    const selected =
      !this.renderOptions.playing && state.selectedId
        ? state.elements.find((element) => {
            if (element.id !== state.selectedId) {
              return false;
            }
            return getElementHandler(element).isSelectable;
          }) ?? null
        : null;

    this.syncOverlay(selected);
  }

  private syncPlayback(): void {
    const activeIds = this.store.getActiveElementIds(this.renderTime);
    const nextActive = new Set(activeIds);
    const isPlaying = this.renderOptions.playing ?? false;

    for (const id of this.activeElementIds) {
      if (!nextActive.has(id)) {
        const entry = this.elementNodes.get(id);
        if (entry) {
          this.setElementVisibility(entry, false);
        }
      }
    }

    for (const id of nextActive) {
      const entry = this.elementNodes.get(id);
      const element = this.store.getElement(id);
      if (!entry || !element) {
        continue;
      }

      if (!this.activeElementIds.has(id)) {
        this.setElementVisibility(entry, true);
      }

      syncElementPlayback(entry, element, this.renderTime, this.renderOptions);
      this.syncVideoFrameLoop(entry, element, isPlaying);
    }

    this.activeElementIds = nextActive;
  }

  private setElementVisibility(entry: ElementNodeEntry, visible: boolean): void {
    if (entry.visible === visible) {
      return;
    }

    entry.visible = visible;
    entry.node.hidden = !visible;
    entry.node.style.contentVisibility = visible ? 'visible' : 'hidden';

    if (visible) {
      return;
    }

    this.stopVideoFrameSync(entry);
    entry.node.dataset.mediaPlaying = 'false';
    if (
      entry.media instanceof HTMLVideoElement ||
      entry.media instanceof HTMLAudioElement
    ) {
      entry.media.pause();
    }
  }

  private syncVideoFrameLoop(
    entry: ElementNodeEntry,
    element: CanvasElement,
    isPlaying: boolean,
  ): void {
    if (
      !isPlaying ||
      !getElementHandler(element).supportsVideoFrameSync ||
      !(entry.media instanceof HTMLVideoElement) ||
      entry.node.hidden
    ) {
      this.stopVideoFrameSync(entry);
      return;
    }

    if (entry.stopVideoFrameSync) {
      return;
    }

    const video = entry.media;
    entry.stopVideoFrameSync = startVideoFrameSync(
      video,
      () => getVideoMediaTime(element, this.renderTime, this.renderOptions),
      () =>
        (this.renderOptions.playing ?? false) &&
        !entry.node.hidden &&
        this.activeElementIds.has(element.id),
    );
  }

  private stopVideoFrameSync(entry: ElementNodeEntry): void {
    entry.stopVideoFrameSync?.();
    entry.stopVideoFrameSync = undefined;
  }

  private stopAllVideoFrameSync(): void {
    for (const entry of this.elementNodes.values()) {
      this.stopVideoFrameSync(entry);
    }
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
