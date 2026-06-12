import { describe, expect, it } from 'vitest';
import { canvasReducer, initialCanvasState } from './canvasReducer';
import type { TextCanvasElement } from './types';

const textElement: TextCanvasElement = {
  id: 'text-1',
  type: 'text',
  name: 'Title',
  zIndex: 0,
  x: 100,
  y: 100,
  width: 300,
  height: 80,
  rotation: 0,
  content: 'Hello',
  fontSize: 32,
  fontFamily: 'Inter',
  fontWeight: 700,
  color: '#ffffff',
  textAlign: 'center',
  backgroundColor: 'transparent',
};

describe('canvasReducer', () => {
  it('adds an element and selects it', () => {
    const next = canvasReducer(initialCanvasState, {
      type: 'ADD_ELEMENT',
      element: textElement,
    });

    expect(next.elements).toHaveLength(1);
    expect(next.selectedId).toBe('text-1');
  });

  it('updates element properties', () => {
    const withElement = canvasReducer(initialCanvasState, {
      type: 'ADD_ELEMENT',
      element: textElement,
    });

    const next = canvasReducer(withElement, {
      type: 'UPDATE_ELEMENT',
      id: 'text-1',
      patch: { x: 240, content: 'Updated' },
    });

    expect(next.elements[0].x).toBe(240);
    expect(next.elements[0].type === 'text' && next.elements[0].content).toBe('Updated');
  });

  it('reorders layers when bringing an element forward', () => {
    const imageElement = { ...textElement, id: 'image-1', type: 'image' as const, src: '/a.png', objectFit: 'cover' as const };
    const first = canvasReducer(initialCanvasState, { type: 'ADD_ELEMENT', element: textElement });
    const second = canvasReducer(first, { type: 'ADD_ELEMENT', element: imageElement });

    const next = canvasReducer(second, { type: 'BRING_FORWARD', id: 'text-1' });

    expect(next.elements.map((element) => element.id)).toEqual(['image-1', 'text-1']);
  });
});
