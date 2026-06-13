import { describe, expect, it } from 'vitest';
import { AudioClip, ImageClip, TextClip, VideoClip } from './clips';
import { DEFAULT_PLAYER_SIZE } from './constants';

const context = {
  zIndex: 0,
  playerSize: DEFAULT_PLAYER_SIZE,
};

describe('composition clips', () => {
  it('builds a video clip with explicit layout and timing', () => {
    const element = new VideoClip('clip.mp4', 2, 8, 10, 20, 640, 360).toElement(context);

    expect(element.type).toBe('video');
    if (element.type !== 'video') {
      return;
    }

    expect(element.src).toBe('clip.mp4');
    expect(element.startTime).toBe(2);
    expect(element.duration).toBe(8);
    expect(element.x).toBe(10);
    expect(element.y).toBe(20);
    expect(element.width).toBe(640);
    expect(element.height).toBe(360);
  });

  it('builds a video clip with defaults when only url and start are provided', () => {
    const element = new VideoClip('samples/video.mp4', 0).toElement(context);

    expect(element.type).toBe('video');
    if (element.type !== 'video') {
      return;
    }

    expect(element.src).toBe('samples/video.mp4');
    expect(element.startTime).toBe(0);
    expect(element.duration).toBeGreaterThan(0);
    expect(element.width).toBeGreaterThan(0);
    expect(element.height).toBeGreaterThan(0);
  });

  it('builds an audio clip', () => {
    const element = new AudioClip('samples/audio.mp3', 1, 12).toElement(context);

    expect(element.type).toBe('audio');
    if (element.type !== 'audio') {
      return;
    }

    expect(element.src).toBe('samples/audio.mp3');
    expect(element.startTime).toBe(1);
    expect(element.duration).toBe(12);
  });

  it('builds text and image clips with opacity', () => {
    const text = new TextClip('Hello', 0, 5, 100, 120, 300, 80, 0.5).toElement(context);
    const image = new ImageClip('cover.png', 2, 4, 0, 0, 200, 200, 0.75).toElement({
      ...context,
      zIndex: 1,
    });

    expect(text.type).toBe('text');
    if (text.type === 'text') {
      expect(text.content).toBe('Hello');
    }
    expect(text.opacity).toBe(0.5);

    expect(image.type).toBe('image');
    if (image.type === 'image') {
      expect(image.src).toBe('cover.png');
    }
    expect(image.opacity).toBe(0.75);
  });
});
