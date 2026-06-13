import { describe, expect, it } from 'vitest';
import type { TextCanvasElement } from '../types';
import { VisibilityTimeline } from './visibilityTimeline';

function textClip(
  id: string,
  startTime: number,
  duration: number,
): TextCanvasElement {
  return {
    id,
    type: 'text',
    name: id,
    zIndex: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    rotation: 0,
    startTime,
    duration,
    opacity: 1,
    content: id,
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'transparent',
  };
}

describe('VisibilityTimeline', () => {
  it('returns only clips active at the requested time', () => {
    const timeline = new VisibilityTimeline();
    timeline.rebuild([
      textClip('a', 0, 5),
      textClip('b', 2, 4),
      textClip('c', 8, 2),
    ]);

    expect(timeline.getActiveIds(1)).toEqual(['a']);
    expect(timeline.getActiveIds(3)).toEqual(['a', 'b']);
    expect(timeline.getActiveIds(7.9)).toEqual([]);
    expect(timeline.getActiveIds(8)).toEqual(['c']);
  });

  it('reports the next visibility boundary after a time', () => {
    const timeline = new VisibilityTimeline();
    timeline.rebuild([
      textClip('a', 0, 5),
      textClip('b', 4, 6),
      textClip('c', 12, 2),
    ]);

    expect(timeline.getNextBoundaryAfter(1)).toBe(4);
    expect(timeline.getNextBoundaryAfter(4)).toBe(5);
    expect(timeline.getNextBoundaryAfter(10)).toBe(12);
    expect(timeline.getNextBoundaryAfter(20)).toBeNull();
  });
});
