import type { CanvasStore } from '../canvasStore';
import type { CanvasElement } from '../types';
import { createInitialLayout, observeViewportLayout, type ViewportLayout } from '../viewportLayout';
import { createCanvasElementNode, updateCanvasElementNode } from './CanvasElement';
import {
  createTransformOverlay,
  destroyTransformOverlay,
  updateTransformOverlay,
  type TransformOverlayContext,
} from './TransformOverlay';

export function mountCanvasViewport(main: HTMLElement, store: CanvasStore): () => void {
  const viewport = document.createElement('div');
  viewport.className =
    'absolute inset-0 flex items-center justify-center p-12 box-border bg-vc-viewport-bg overflow-hidden';

  const stage = document.createElement('div');
  stage.className = 'flex flex-col items-center gap-2.5 max-w-full max-h-full';

  const label = document.createElement('div');
  label.className =
    'shrink-0 px-2 py-0.5 rounded-md bg-[rgba(62,138,245,0.18)] text-[#d9e8ff] text-[0.7rem] font-semibold tracking-wide uppercase whitespace-nowrap pointer-events-none';

  const player = document.createElement('div');
  player.className = 'relative shrink-0';

  const composition = document.createElement('div');
  composition.className =
    'absolute top-0 left-0 origin-top-left bg-vc-player-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)] overflow-visible';

  const frame = document.createElement('div');
  frame.className =
    'absolute inset-0 border-2 border-[rgba(62,138,245,0.95)] rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.06)] pointer-events-none';
  frame.setAttribute('aria-hidden', 'true');

  player.append(composition, frame);
  stage.append(label, player);
  viewport.append(stage);
  main.append(viewport);

  viewport.addEventListener('pointerdown', () => store.selectElement(null));

  let layout: ViewportLayout = createInitialLayout(store.getState().playerSize);
  const elementNodes = new Map<string, HTMLDivElement>();
  let overlay: ReturnType<typeof createTransformOverlay> | null = null;
  let overlayElementId: string | null = null;

  const overlayContext: TransformOverlayContext = {
    getCompositionRect: () => composition.getBoundingClientRect(),
    getScale: () => layout.scale,
    onTransform: (patch) => {
      const selected = store.selectedElement;
      if (selected) {
        store.updateElement(selected.id, patch);
      }
    },
  };

  const applyLayout = () => {
    const { playerSize } = store.getState();
    const aspectRatio = playerSize.width / playerSize.height;

    player.style.width = `${layout.displayWidth}px`;
    player.style.height = `${layout.displayHeight}px`;
    player.style.aspectRatio = String(aspectRatio);

    composition.style.width = `${playerSize.width}px`;
    composition.style.height = `${playerSize.height}px`;
    composition.style.transform = `scale(${layout.scale})`;

    label.textContent = `Export · ${playerSize.width} × ${playerSize.height}`;
  };

  const syncElements = () => {
    const state = store.getState();
    const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const nextIds = new Set(sorted.map((element) => element.id));

    for (const [id, node] of elementNodes) {
      if (!nextIds.has(id)) {
        node.remove();
        elementNodes.delete(id);
      }
    }

    for (const element of sorted) {
      const existing = elementNodes.get(element.id);
      if (existing) {
        updateCanvasElementNode(existing, element);
      } else {
        const node = createCanvasElementNode(element, (id) => store.selectElement(id));
        elementNodes.set(element.id, node);
        composition.append(node);
      }
    }

    syncOverlay(state.selectedId ? sorted.find((e) => e.id === state.selectedId) ?? null : null);
  };

  const syncOverlay = (element: CanvasElement | null) => {
    if (!element) {
      if (overlay) {
        destroyTransformOverlay(overlay);
        overlay = null;
        overlayElementId = null;
      }
      return;
    }

    if (overlay && overlayElementId === element.id) {
      updateTransformOverlay(overlay);
      return;
    }

    if (overlay) {
      destroyTransformOverlay(overlay);
    }

    overlayElementId = element.id;
    overlay = createTransformOverlay(() => store.selectedElement ?? element, overlayContext);
    composition.append(overlay);
  };

  const unsubscribe = store.subscribe(() => {
    syncElements();
  });

  let stopObserving = () => {};
  const startObserving = () => {
    stopObserving();
    stopObserving = observeViewportLayout(
      main,
      label,
      store.getState().playerSize,
      (nextLayout) => {
        layout = nextLayout;
        applyLayout();
      },
    );
  };

  let lastPlayerSize = store.getState().playerSize;
  const checkPlayerSize = () => {
    const { playerSize } = store.getState();
    if (
      playerSize.width !== lastPlayerSize.width ||
      playerSize.height !== lastPlayerSize.height
    ) {
      lastPlayerSize = playerSize;
      layout = createInitialLayout(playerSize);
      applyLayout();
      startObserving();
    }
  };

  startObserving();
  const unsubscribeSize = store.subscribe(checkPlayerSize);

  applyLayout();
  syncElements();

  return () => {
    unsubscribe();
    unsubscribeSize();
    stopObserving();
    if (overlay) {
      destroyTransformOverlay(overlay);
    }
    viewport.remove();
  };
}
