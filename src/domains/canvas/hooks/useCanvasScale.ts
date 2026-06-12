import { useEffect, useRef, useState, type RefObject } from 'react';
import type { CanvasSize } from '../types';
import { getFittedPlayerLayout, VIEWPORT_PADDING } from '../utils/player';

export interface ViewportLayout {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  mainWidth: number;
  mainHeight: number;
}

export function useViewportLayout(
  mainRef: RefObject<HTMLElement | null>,
  playerSize: CanvasSize,
): {
  labelRef: RefObject<HTMLDivElement | null>;
  layout: ViewportLayout;
} {
  const labelRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<ViewportLayout>(() => {
    const fitted = getFittedPlayerLayout(playerSize, playerSize);
    return {
      ...fitted,
      mainWidth: playerSize.width,
      mainHeight: playerSize.height,
    };
  });

  useEffect(() => {
    const main = mainRef.current;
    if (!main) {
      return;
    }

    const updateLayout = () => {
      const { width, height } = main.getBoundingClientRect();
      const labelHeight = labelRef.current?.offsetHeight ?? 0;
      const stageGap = labelHeight > 0 ? 10 : 0;
      const fitted = getFittedPlayerLayout(
        { width, height },
        playerSize,
        labelHeight + stageGap,
        VIEWPORT_PADDING,
      );

      setLayout({
        ...fitted,
        mainWidth: width,
        mainHeight: height,
      });
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(main);

    const label = labelRef.current;
    if (label) {
      observer.observe(label);
    }

    return () => observer.disconnect();
  }, [mainRef, playerSize.height, playerSize.width]);

  return { labelRef, layout };
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
