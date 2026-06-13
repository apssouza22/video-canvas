import type { CanvasElement } from '../types';

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
 * When playing, time is measured from when playback began or the element
 * became visible — whichever is later — not from the composition origin.
 */
export function getVideoMediaTime(
  element: Pick<CanvasElement, 'startTime' | 'duration'>,
  compositionTime: number,
  options: { playing?: boolean; playbackStartedAt?: number } = {},
): number {
  const startTime = element.startTime ?? 0;

  if (!options.playing) {
    return Math.min(getElementLocalTime(element, compositionTime), element.duration);
  }

  const anchor = Math.max(options.playbackStartedAt ?? startTime, startTime);
  const elapsed = Math.max(0, compositionTime - anchor);
  return Math.min(elapsed, element.duration);
}
