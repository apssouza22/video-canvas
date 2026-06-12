import type { CanvasElement as CanvasElementType } from '../types';
import { elementTransformStyle } from '../utils/transform';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function CanvasElement({ element, isSelected, onSelect }: CanvasElementProps) {
  return (
    <div
      className={`canvas-element canvas-element--${element.type}${isSelected ? ' is-selected' : ''}`}
      style={{
        ...elementTransformStyle(element),
        zIndex: element.zIndex,
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(element.id);
      }}
    >
      {element.type === 'video' && (
        <video
          className="canvas-element__media"
          src={element.src}
          muted={element.muted}
          loop={element.loop}
          autoPlay
          playsInline
        />
      )}

      {element.type === 'image' && (
        <img
          className="canvas-element__media"
          src={element.src}
          alt={element.name}
          style={{ objectFit: element.objectFit }}
          draggable={false}
        />
      )}

      {element.type === 'text' && (
        <div
          className="canvas-element__text"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.textAlign,
            backgroundColor: element.backgroundColor,
          }}
        >
          {element.content}
        </div>
      )}
    </div>
  );
}
