import type { CanvasElement } from '../types';
import { getElementEndTime } from './timing';

export interface VisibilitySegment {
  id: string;
  start: number;
  end: number;
}

/**
 * Sorted timeline index for clip visibility windows.
 * Queries only touch segments that can be active at the requested time.
 */
export class VisibilityTimeline {
  private segments: VisibilitySegment[] = [];

  rebuild(elements: Iterable<CanvasElement>): void {
    const segments: VisibilitySegment[] = [];

    for (const element of elements) {
      segments.push({
        id: element.id,
        start: element.startTime,
        end: getElementEndTime(element),
      });
    }

    segments.sort((a, b) => a.start - b.start || a.end - b.end);
    this.segments = segments;
  }

  getActiveIds(time: number): string[] {
    const active: string[] = [];

    for (const segment of this.segments) {
      if (segment.start > time) {
        break;
      }
      if (time < segment.end) {
        active.push(segment.id);
      }
    }

    return active;
  }

  /** Next composition time where visibility may change, if any. */
  getNextBoundaryAfter(time: number): number | null {
    let next: number | null = null;

    for (const segment of this.segments) {
      if (segment.start > time) {
        next = next === null ? segment.start : Math.min(next, segment.start);
      }
      if (segment.end > time) {
        next = next === null ? segment.end : Math.min(next, segment.end);
      }
    }

    return next;
  }
}
