import { describe, expect, it } from 'vitest';
import { ImageClip } from './clips';
import { CanvasStore } from './canvasStore';
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
  startTime: 0,
  duration: 5,
  opacity: 1,
  content: 'Hello',
  fontSize: 32,
  fontFamily: 'Inter',
  fontWeight: 700,
  color: '#ffffff',
  textAlign: 'center',
  backgroundColor: 'transparent',
};

describe('CanvasStore', () => {
  it('adds an element and selects it', () => {
    const store = new CanvasStore();
    store.addElement(textElement);

    const state = store.getState();
    expect(state.elements).toHaveLength(1);
    expect(state.selectedId).toBe('text-1');
  });

  it('updates element properties', () => {
    const store = new CanvasStore();
    store.addElement(textElement);
    store.updateElement('text-1', { x: 240, content: 'Updated' });

    const element = store.getState().elements[0];
    expect(element.x).toBe(240);
    expect(element.type === 'text' && element.content).toBe('Updated');
  });

  it('reorders layers when bringing an element forward', () => {
    const imageElement = {
      ...textElement,
      id: 'image-1',
      type: 'image' as const,
      src: '/a.png',
      objectFit: 'cover' as const,
    };

    const store = new CanvasStore();
    store.addElement(textElement);
    store.addElement(imageElement);
    store.bringForward('text-1');

    expect(store.getState().elements.map((element) => element.id)).toEqual(['image-1', 'text-1']);
  });

  it('moves an element to an explicit z-index', () => {
    const imageElement = {
      ...textElement,
      id: 'image-1',
      type: 'image' as const,
      src: '/a.png',
      objectFit: 'cover' as const,
    };
    const videoElement = {
      ...textElement,
      id: 'video-1',
      type: 'video' as const,
      src: '/a.mp4',
      muted: true,
      loop: true,
    };

    const store = new CanvasStore();
    store.addElement(textElement);
    store.addElement(imageElement);
    store.addElement(videoElement);
    store.setZIndex('text-1', 2);

    const elements = store.getState().elements;
    expect(elements.at(-1)?.id).toBe('text-1');
    expect(elements.map((element) => element.zIndex)).toEqual([0, 1, 2]);
  });

  it('updates player size when aspect ratio changes', () => {
    const store = new CanvasStore();
    store.setAspectRatio('1:1');

    const state = store.getState();
    expect(state.aspectRatio).toBe('1:1');
    expect(state.playerSize).toEqual({ width: 1080, height: 1080 });
  });

  it('computes composition duration from element timing', () => {
    const store = new CanvasStore();
    store.addElement(textElement);
    store.addElement({ ...textElement, id: 'text-2', startTime: 8, duration: 3 });

    expect(store.getDuration()).toBe(11);
  });

  it('places new layers at the provided start time', () => {
    const store = new CanvasStore();
    store.addElement({ ...textElement, duration: 4 });

    store.addLayer(new ImageClip('', 2));
    const image = store.getElements().find((element) => element.type === 'image');

    expect(image?.startTime).toBe(2);
    expect(store.getDuration()).toBe(7);
  });
});
