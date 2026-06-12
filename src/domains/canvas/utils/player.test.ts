import { describe, expect, it } from 'vitest';
import {
  getFittedPlayerLayout,
  getPlayerSizeFromAspectRatio,
  VIEWPORT_PADDING,
} from './player';

describe('player utils', () => {
  it('returns portrait dimensions for 9:16', () => {
    const size = getPlayerSizeFromAspectRatio('9:16');
    expect(size).toEqual({ width: 720, height: 1280 });
  });

  it('fits the player proportionally inside the main area', () => {
    const playerSize = { width: 1280, height: 720 };
    const fitted = getFittedPlayerLayout(
      { width: 900, height: 700 },
      playerSize,
      34,
      VIEWPORT_PADDING,
    );

    expect(fitted.displayWidth / fitted.displayHeight).toBeCloseTo(1280 / 720, 5);
    expect(fitted.displayWidth).toBeLessThanOrEqual(900 - VIEWPORT_PADDING * 2);
    expect(fitted.displayHeight + 34).toBeLessThanOrEqual(700 - VIEWPORT_PADDING * 2 + 0.01);
  });

  it('uses height as the limiting axis for portrait ratios in a wide main area', () => {
    const playerSize = getPlayerSizeFromAspectRatio('9:16');
    const fitted = getFittedPlayerLayout(
      { width: 1200, height: 800 },
      playerSize,
      34,
      VIEWPORT_PADDING,
    );

    const availableHeight = 800 - VIEWPORT_PADDING * 2 - 34;
    expect(fitted.displayHeight).toBeCloseTo(availableHeight, 1);
    expect(fitted.displayWidth / fitted.displayHeight).toBeCloseTo(9 / 16, 5);
  });
});
