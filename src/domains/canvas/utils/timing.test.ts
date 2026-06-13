import { describe, expect, it } from 'vitest';
import type { TextCanvasElement } from '../types';
import {
  getCompositionDuration,
  getElementLocalTime,
  getVideoMediaTime,
  getVisibleElements,
  isElementVisibleAtTime,
} from './timing';

const textElement: TextCanvasElement = {
  id: 'text-1',
  type: 'text',
  name: 'Title',
  zIndex: 0,
  x: 0,
  y: 0,
  width: 100,
  height: 50,
  rotation: 0,
  startTime: 2,
  duration: 4,
  content: 'Hello',
  fontSize: 24,
  fontFamily: 'Inter',
  fontWeight: 700,
  color: '#ffffff',
  textAlign: 'center',
  backgroundColor: 'transparent',
};

describe('timing utils', () => {
  it('checks visibility within the element time range', () => {
    expect(isElementVisibleAtTime(textElement, 1.9)).toBe(false);
    expect(isElementVisibleAtTime(textElement, 2)).toBe(true);
    expect(isElementVisibleAtTime(textElement, 5.9)).toBe(true);
    expect(isElementVisibleAtTime(textElement, 6)).toBe(false);
  });

  it('returns local media time relative to element start', () => {
    expect(getElementLocalTime(textElement, 3.5)).toBe(1.5);
    expect(getElementLocalTime(textElement, 1)).toBe(0);
  });

  it('filters visible elements and computes composition duration', () => {
    const later = { ...textElement, id: 'text-2', startTime: 8, duration: 3 };
    const visible = getVisibleElements([textElement, later], 3);

    expect(visible.map((element) => element.id)).toEqual(['text-1']);
    expect(getCompositionDuration([textElement, later])).toBe(11);
  });

  it('maps video media time from clip visibility, not composition origin', () => {
    const clip = { startTime: 4, duration: 6 };

    expect(getVideoMediaTime(clip, 3)).toBe(0);
    expect(getVideoMediaTime(clip, 7)).toBe(3);

    expect(getVideoMediaTime(clip, 8, { playing: true, playbackStartedAt: 8 })).toBe(0);
    expect(getVideoMediaTime(clip, 10, { playing: true, playbackStartedAt: 8 })).toBe(2);
    expect(getVideoMediaTime(clip, 10, { playing: true, playbackStartedAt: 0 })).toBe(6);
  });
});
