import type { CanvasSize } from './types';
import { getFittedPlayerLayout, VIEWPORT_PADDING } from './utils/player';

export interface ViewportLayout {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  mainWidth: number;
  mainHeight: number;
}

export function createInitialLayout(playerSize: CanvasSize): ViewportLayout {
  const fitted = getFittedPlayerLayout(playerSize, playerSize);
  return {
    ...fitted,
    mainWidth: playerSize.width,
    mainHeight: playerSize.height,
  };
}

export function computeViewportLayout(
  mainSize: CanvasSize,
  playerSize: CanvasSize,
  labelHeight: number,
): ViewportLayout {
  const stageGap = labelHeight > 0 ? 10 : 0;
  const fitted = getFittedPlayerLayout(
    mainSize,
    playerSize,
    labelHeight + stageGap,
    VIEWPORT_PADDING,
  );

  return {
    ...fitted,
    mainWidth: mainSize.width,
    mainHeight: mainSize.height,
  };
}

export function toCanvasPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  scale: number,
): { x: number; y: number } {
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
  };
}

export function observeViewportLayout(
  main: HTMLElement,
  label: HTMLElement | null,
  playerSize: CanvasSize,
  onLayout: (layout: ViewportLayout) => void,
): () => void {
  let rafId: number | null = null;
  let lastLayout: ViewportLayout | null = null;

  const updateLayout = () => {
    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      rafId = null;
      const { width, height } = main.getBoundingClientRect();
      const labelHeight = label?.offsetHeight ?? 0;
      const nextLayout = computeViewportLayout({ width, height }, playerSize, labelHeight);

      if (
        lastLayout &&
        lastLayout.scale === nextLayout.scale &&
        lastLayout.displayWidth === nextLayout.displayWidth &&
        lastLayout.displayHeight === nextLayout.displayHeight &&
        lastLayout.mainWidth === nextLayout.mainWidth &&
        lastLayout.mainHeight === nextLayout.mainHeight
      ) {
        return;
      }

      lastLayout = nextLayout;
      onLayout(nextLayout);
    });
  };

  updateLayout();

  const observer = new ResizeObserver(updateLayout);
  observer.observe(main);
  if (label) {
    observer.observe(label);
  }

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    observer.disconnect();
  };
}
