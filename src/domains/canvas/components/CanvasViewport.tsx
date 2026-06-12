import { useMemo, useRef, type RefObject } from 'react';
import { useCanvas } from '../CanvasContext';
import { useViewportLayout } from '../hooks/useCanvasScale';
import { CanvasElement } from './CanvasElement';
import { TransformOverlay } from './TransformOverlay';

interface CanvasViewportProps {
  mainRef: RefObject<HTMLElement | null>;
}

export function CanvasViewport({ mainRef }: CanvasViewportProps) {
  const { state, selectedElement, selectElement, updateElement } = useCanvas();
  const compositionRef = useRef<HTMLDivElement | null>(null);
  const { labelRef, layout } = useViewportLayout(mainRef, state.playerSize);

  const sortedElements = useMemo(
    () => [...state.elements].sort((a, b) => a.zIndex - b.zIndex),
    [state.elements],
  );

  const playerAspectRatio = state.playerSize.width / state.playerSize.height;

  return (
    <div className="canvas-viewport" onPointerDown={() => selectElement(null)}>
      <div className="canvas-viewport__player-stage">
        <div ref={labelRef} className="canvas-viewport__player-label">
          Export · {state.playerSize.width} × {state.playerSize.height}
        </div>

        <div
          className="canvas-viewport__player"
          style={{
            width: layout.displayWidth,
            height: layout.displayHeight,
            aspectRatio: playerAspectRatio,
          }}
        >
          <div
            ref={compositionRef}
            className="canvas-viewport__player-surface"
            style={{
              width: state.playerSize.width,
              height: state.playerSize.height,
              transform: `scale(${layout.scale})`,
            }}
          >
            {sortedElements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={element.id === state.selectedId}
                onSelect={selectElement}
              />
            ))}

            {selectedElement && (
              <TransformOverlay
                element={selectedElement}
                scale={layout.scale}
                getCompositionRect={() => compositionRef.current?.getBoundingClientRect() ?? null}
                onTransform={(patch) => updateElement(selectedElement.id, patch)}
              />
            )}
          </div>

          <div className="canvas-viewport__player-frame" aria-hidden />
        </div>
      </div>
    </div>
  );
}
