import { describe, expect, it, beforeAll } from 'vitest';
import { AudioClip } from '../audio/AudioClip';
import { ImageClip } from '../image/ImageClip';
import { TextClip } from '../text/TextClip';
import { VideoClip } from '../video/VideoClip';
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
  it('supports fluent addLayer chaining', () => {
    const container = document.createElement('div');

    const canvas = new CompositionCanvas(container)
      .addLayer(new VideoClip('samples/video.mp4', 0, 10, 0, 0, 1280, 720))
      .addLayer(new VideoClip('samples/video.mp4', 0))
      .addLayer(new AudioClip('samples/audio.mp3', 1, 8))
      .addLayer(new TextClip('Title', 2, 6, 100, 100, 400, 120, 0.9))
      .addLayer(new ImageClip('samples/cover.png', 0, 10, 200, 200, 300, 300, 0.8));

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
