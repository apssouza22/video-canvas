import { describe, expect, it, beforeAll } from 'vitest';
import { createCanvasElement } from './elementFactory';
import { CompositionCanvas } from './CompositionCanvas';

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
});

describe('CompositionCanvas', () => {
  it('supports adding multiple element types', () => {
    const container = document.createElement('div');
    const canvas = new CompositionCanvas(container);
    const playerSize = canvas.getPlayerSize();

    canvas.addElement({
      ...createCanvasElement({ type: 'video', src: 'samples/video.mp4', zIndex: 0, playerSize }),
      startTime: 0,
      duration: 10,
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
    });
    canvas.addElement({
      ...createCanvasElement({ type: 'video', src: 'samples/video.mp4', zIndex: 1, playerSize }),
      startTime: 0,
    });
    canvas.addElement({
      ...createCanvasElement({ type: 'audio', src: 'samples/audio.mp3', zIndex: 2, playerSize }),
      startTime: 1,
      duration: 8,
    });
    canvas.addElement({
      ...createCanvasElement({ type: 'text', zIndex: 3, playerSize }),
      content: 'Title',
      startTime: 2,
      duration: 6,
      x: 100,
      y: 100,
      width: 400,
      height: 120,
      opacity: 0.9,
    });
    canvas.addElement({
      ...createCanvasElement({
        type: 'image',
        src: 'samples/cover.png',
        zIndex: 4,
        playerSize,
      }),
      startTime: 0,
      duration: 10,
      x: 200,
      y: 200,
      width: 300,
      height: 300,
      opacity: 0.8,
    });

    const elements = canvas.getElements();

    expect(elements).toHaveLength(5);
    expect(elements.map((element) => element.type)).toEqual([
      'video',
      'video',
      'audio',
      'text',
      'image',
    ]);
    expect(canvas.getDuration()).toBe(10);

    canvas.destroy();
  });
});
