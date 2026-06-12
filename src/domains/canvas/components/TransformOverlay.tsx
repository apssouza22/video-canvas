import { useEffect, useRef, useState } from 'react';
import type { CanvasElement, ElementTransform } from '../types';
import {
  elementTransformStyle,
  resizeElement,
  rotateElement,
  type ResizeHandle,
} from '../utils/transform';
import { toCanvasPoint } from '../hooks/useCanvasScale';

type InteractionMode =
  | { type: 'move'; start: ElementTransform; startPointer: { x: number; y: number } }
  | {
      type: 'resize';
      handle: ResizeHandle;
      start: ElementTransform;
      startPointer: { x: number; y: number };
    }
  | {
      type: 'rotate';
      start: ElementTransform;
      startPointer: { x: number; y: number };
    };

const RESIZE_HANDLES: ResizeHandle[] = [
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
];

interface TransformOverlayProps {
  element: CanvasElement;
  scale: number;
  getCompositionRect: () => DOMRect | null;
  onTransform: (patch: Partial<ElementTransform>) => void;
}

export function TransformOverlay({
  element,
  scale,
  getCompositionRect,
  onTransform,
}: TransformOverlayProps) {
  const [interaction, setInteraction] = useState<InteractionMode | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!interaction) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const compositionRect = getCompositionRect();
      if (!compositionRect) {
        return;
      }

      const pointer = toCanvasPoint(event.clientX, event.clientY, compositionRect, scale);

      if (interaction.type === 'move') {
        const dx = pointer.x - interaction.startPointer.x;
        const dy = pointer.y - interaction.startPointer.y;
        onTransform({
          x: interaction.start.x + dx,
          y: interaction.start.y + dy,
        });
        return;
      }

      if (interaction.type === 'resize') {
        onTransform(
          resizeElement(
            interaction.start,
            interaction.handle,
            pointer,
            interaction.startPointer,
          ),
        );
        return;
      }

      onTransform(rotateElement(interaction.start, pointer, interaction.startPointer));
    };

    const handlePointerUp = () => setInteraction(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [getCompositionRect, interaction, onTransform, scale]);

  const beginInteraction = (
    mode: InteractionMode,
    event: React.PointerEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setInteraction(mode);
  };

  return (
    <div
      ref={overlayRef}
      className="transform-overlay"
      style={{
        ...elementTransformStyle(element),
        zIndex: element.zIndex + 1,
      }}
    >
      <div
        className="transform-overlay__box"
        onPointerDown={(event) => {
          const compositionRect = getCompositionRect();
          if (!compositionRect) {
            return;
          }
          beginInteraction(
            {
              type: 'move',
              start: element,
              startPointer: toCanvasPoint(
                event.clientX,
                event.clientY,
                compositionRect,
                scale,
              ),
            },
            event,
          );
        }}
      />

      {RESIZE_HANDLES.map((handle) => (
        <button
          key={handle}
          type="button"
          className={`transform-overlay__handle transform-overlay__handle--${handle}`}
          aria-label={`Resize ${handle}`}
          onPointerDown={(event) => {
            const compositionRect = getCompositionRect();
            if (!compositionRect) {
              return;
            }
            beginInteraction(
              {
                type: 'resize',
                handle,
                start: element,
                startPointer: toCanvasPoint(
                  event.clientX,
                  event.clientY,
                  compositionRect,
                  scale,
                ),
              },
              event,
            );
          }}
        />
      ))}

      <button
        type="button"
        className="transform-overlay__rotate-handle"
        aria-label="Rotate element"
        onPointerDown={(event) => {
          const compositionRect = getCompositionRect();
          if (!compositionRect) {
            return;
          }
          beginInteraction(
            {
              type: 'rotate',
              start: element,
              startPointer: toCanvasPoint(
                event.clientX,
                event.clientY,
                compositionRect,
                scale,
              ),
            },
            event,
          );
        }}
      />
    </div>
  );
}
