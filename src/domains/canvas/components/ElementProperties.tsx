import { useCanvas } from '../CanvasContext';

export function ElementProperties() {
  const { selectedElement, updateElement } = useCanvas();

  if (!selectedElement) {
    return (
      <div className="element-properties element-properties--empty">
        <h2>Properties</h2>
        <p>Select an element on the canvas to edit its properties.</p>
      </div>
    );
  }

  const updateTransform = (field: 'x' | 'y' | 'width' | 'height' | 'rotation', value: number) => {
    updateElement(selectedElement.id, { [field]: value });
  };

  return (
    <div className="element-properties">
      <h2>{selectedElement.name}</h2>
      <p className="element-properties__type">{selectedElement.type}</p>

      <label>
        Name
        <input
          value={selectedElement.name}
          onChange={(event) => updateElement(selectedElement.id, { name: event.target.value })}
        />
      </label>

      <div className="element-properties__grid">
        <label>
          X
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(event) => updateTransform('x', Number(event.target.value))}
          />
        </label>
        <label>
          Y
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(event) => updateTransform('y', Number(event.target.value))}
          />
        </label>
        <label>
          Width
          <input
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(event) => updateTransform('width', Number(event.target.value))}
          />
        </label>
        <label>
          Height
          <input
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(event) => updateTransform('height', Number(event.target.value))}
          />
        </label>
        <label>
          Rotation
          <input
            type="number"
            value={Math.round(selectedElement.rotation)}
            onChange={(event) => updateTransform('rotation', Number(event.target.value))}
          />
        </label>
      </div>

      {selectedElement.type === 'text' && (
        <>
          <label>
            Content
            <textarea
              rows={3}
              value={selectedElement.content}
              onChange={(event) =>
                updateElement(selectedElement.id, { content: event.target.value })
              }
            />
          </label>
          <label>
            Font size
            <input
              type="number"
              value={selectedElement.fontSize}
              onChange={(event) =>
                updateElement(selectedElement.id, { fontSize: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Color
            <input
              type="color"
              value={selectedElement.color}
              onChange={(event) =>
                updateElement(selectedElement.id, { color: event.target.value })
              }
            />
          </label>
          <label>
            Align
            <select
              value={selectedElement.textAlign}
              onChange={(event) =>
                updateElement(selectedElement.id, {
                  textAlign: event.target.value as 'left' | 'center' | 'right',
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </>
      )}

      {selectedElement.type === 'image' && (
        <label>
          Fit
          <select
            value={selectedElement.objectFit}
            onChange={(event) =>
              updateElement(selectedElement.id, {
                objectFit: event.target.value as 'cover' | 'contain' | 'fill',
              })
            }
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </label>
      )}

      {selectedElement.type === 'video' && (
        <>
          <label className="element-properties__checkbox">
            <input
              type="checkbox"
              checked={selectedElement.muted}
              onChange={(event) =>
                updateElement(selectedElement.id, { muted: event.target.checked })
              }
            />
            Muted
          </label>
          <label className="element-properties__checkbox">
            <input
              type="checkbox"
              checked={selectedElement.loop}
              onChange={(event) =>
                updateElement(selectedElement.id, { loop: event.target.checked })
              }
            />
            Loop
          </label>
        </>
      )}
    </div>
  );
}
