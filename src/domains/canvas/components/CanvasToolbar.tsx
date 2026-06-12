import { useRef } from 'react';
import { useCanvas } from '../CanvasContext';
import { createCanvasElement } from '../elementFactory';
import type { CanvasElementType } from '../types';

export function CanvasToolbar() {
  const { state, addElement, dispatch, deleteElement, selectedElement } = useCanvas();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const addByType = (type: CanvasElementType, src?: string) => {
    addElement(
      createCanvasElement({
        type,
        src,
        zIndex: state.elements.length,
      }),
    );
  };

  const handleFile = (type: 'image' | 'video', file: File | undefined) => {
    if (!file) {
      return;
    }
    addByType(type, URL.createObjectURL(file));
  };

  return (
    <div className="canvas-toolbar">
      <div className="canvas-toolbar__group">
        <span className="canvas-toolbar__label">Add</span>
        <button type="button" onClick={() => addByType('text')}>
          Text
        </button>
        <button type="button" onClick={() => imageInputRef.current?.click()}>
          Image
        </button>
        <button type="button" onClick={() => videoInputRef.current?.click()}>
          Video
        </button>
        <button type="button" onClick={() => addByType('video')}>
          Sample Video
        </button>
      </div>

      <div className="canvas-toolbar__group">
        <span className="canvas-toolbar__label">Layer</span>
        <button
          type="button"
          disabled={!selectedElement}
          onClick={() => selectedElement && dispatch({ type: 'BRING_FORWARD', id: selectedElement.id })}
        >
          Forward
        </button>
        <button
          type="button"
          disabled={!selectedElement}
          onClick={() => selectedElement && dispatch({ type: 'SEND_BACKWARD', id: selectedElement.id })}
        >
          Backward
        </button>
        <button
          type="button"
          disabled={!selectedElement}
          onClick={() => selectedElement && deleteElement(selectedElement.id)}
        >
          Delete
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleFile('image', event.target.files?.[0])}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => handleFile('video', event.target.files?.[0])}
      />
    </div>
  );
}
