import type { CanvasElement } from './types';

export const DEFAULT_ELEMENT_DURATION = 5;

export function getElementEndTime(element: Pick<CanvasElement, 'startTime' | 'duration'>): number {
  return element.startTime + element.duration;
}

export function isElementVisibleAtTime(
  element: Pick<CanvasElement, 'startTime' | 'duration'>,
  time: number,
): boolean {
  return time >= element.startTime && time < getElementEndTime(element);
}

export function getCompositionDuration(elements: CanvasElement[]): number {
  if (elements.length === 0) {
    return 0;
  }

  return Math.max(...elements.map(getElementEndTime));
}

export function getVisibleElements(elements: CanvasElement[], time: number): CanvasElement[] {
  return elements.filter((element) => isElementVisibleAtTime(element, time));
}

export function getElementLocalTime(
  element: Pick<CanvasElement, 'startTime'>,
  compositionTime: number,
): number {
  const startTime = element.startTime ?? 0;
  return Math.max(0, compositionTime - startTime);
}

/**
 * Position within the video source file in seconds.
 * When playing, time advances from the playhead position at playback start,
 * but only while the clip is visible (after its startTime).
 */
export function getVideoMediaTime(
  element: Pick<CanvasElement, 'startTime' | 'duration'> & { sourceOffset?: number },
  compositionTime: number,
  options: { playing?: boolean; playbackStartedAt?: number } = {},
): number {
  const startTime = element.startTime ?? 0;
  const sourceOffset = element.sourceOffset ?? 0;

  if (!options.playing) {
    const local = getElementLocalTime(element, compositionTime);
    return Math.min(sourceOffset + local, sourceOffset + element.duration);
  }

  const playbackStartedAt = options.playbackStartedAt ?? startTime;
  const anchor = Math.max(playbackStartedAt, startTime);
  const localTimeAtAnchor = Math.max(0, anchor - startTime);
  const elapsed = Math.max(0, compositionTime - anchor);
  return Math.min(sourceOffset + localTimeAtAnchor + elapsed, sourceOffset + element.duration);
}
