import { useEffect, useRef, useState, type RefObject } from 'react';
import type { CanvasSize } from '../types';

interface CanvasScale {
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

export function useCanvasScale(canvasSize: CanvasSize): {
  containerRef: RefObject<HTMLDivElement | null>;
  scale: CanvasScale;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<CanvasScale>({
    scale: 1,
    containerWidth: canvasSize.width,
    containerHeight: canvasSize.height,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateScale = () => {
      const { width, height } = container.getBoundingClientRect();
      const nextScale = Math.min(width / canvasSize.width, height / canvasSize.height);
      setScale({
        scale: nextScale,
        containerWidth: width,
        containerHeight: height,
      });
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [canvasSize.height, canvasSize.width]);

  return { containerRef, scale };
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
