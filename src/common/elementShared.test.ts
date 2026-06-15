import { describe, expect, it } from 'vitest';

import { syncMediaPlayback, type CanvasElementNodeRefs } from './elementShared';
import type { AudioCanvasElement } from './types';

function createAudioRefs(): {
  refs: CanvasElementNodeRefs;
  media: HTMLAudioElement;
} {
  const node = document.createElement('div');
  const media = document.createElement('audio');
  node.append(media);

  return {
    refs: { node, media },
    media,
  };
}

describe('syncMediaPlayback', () => {
  const element: AudioCanvasElement = {
    id: 'audio-1',
    type: 'audio',
    name: 'Audio',
    src: 'audio.mp3',
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    rotation: 0,
    zIndex: 1,
    startTime: 0,
    duration: 10,
    opacity: 1,
    loop: false,
    volume: 1,
  };

  it('applies playbackRate and preservesPitch on media elements', () => {
    const { refs, media } = createAudioRefs();

    syncMediaPlayback(refs, element, 0, { playing: false, playbackRate: 2 });

    expect(media.playbackRate).toBe(2);
    expect(media.preservesPitch).toBe(true);
  });

  it('restarts playback when playbackRate changes mid-session', () => {
    const { refs, media } = createAudioRefs();
    refs.node.dataset.mediaPlaying = 'true';
    media.playbackRate = 1;
    media.play = () => Promise.resolve();

    syncMediaPlayback(refs, element, 2, { playing: true, playbackRate: 2, playbackStartedAt: 0 });

    expect(media.playbackRate).toBe(2);
    expect(refs.node.dataset.mediaPlaying).toBe('true');
  });
});
