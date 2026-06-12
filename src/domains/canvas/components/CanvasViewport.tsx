import { useMemo, useRef } from 'react';
import { useCanvas } from '../CanvasContext';
import { useCanvasScale } from '../hooks/useCanvasScale';
import { CanvasElement } from './CanvasElement';
import { TransformOverlay } from './TransformOverlay';

export function CanvasViewport() {
  const { state, selectedElement, selectElement, updateElement } = useCanvas();
  const compositionRef = useRef<HTMLDivElement | null>(null);
  const { containerRef, scale } = useCanvasScale(state.canvasSize);

  const sortedElements = useMemo(
    () => [...state.elements].sort((a, b) => a.zIndex - b.zIndex),
    [state.elements],
  );

  return (
    <div ref={containerRef} className="canvas-viewport" onPointerDown={() => selectElement(null)}>
      <div
        className="canvas-viewport__stage"
        style={{
          width: state.canvasSize.width * scale.scale,
          height: state.canvasSize.height * scale.scale,
        }}
      >
        <div
          ref={compositionRef}
          className="canvas-viewport__composition"
          style={{
            width: state.canvasSize.width,
            height: state.canvasSize.height,
            transform: `scale(${scale.scale})`,
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
              scale={scale.scale}
              getCompositionRect={() => compositionRef.current?.getBoundingClientRect() ?? null}
              onTransform={(patch) => updateElement(selectedElement.id, patch)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
