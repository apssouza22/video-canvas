import { describe, expect, it } from 'vitest';
import { resizeElement, rotatePoint } from './transform';

describe('transform utils', () => {
  it('rotates a point around a center', () => {
    const rotated = rotatePoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);
    expect(rotated.x).toBeCloseTo(0, 5);
    expect(rotated.y).toBeCloseTo(10, 5);
  });

  it('resizes from the right handle', () => {
    const start = { x: 100, y: 100, width: 200, height: 120, rotation: 0 };
    const resized = resizeElement(
      start,
      'right',
      { x: 360, y: 160 },
      { x: 300, y: 160 },
    );

    expect(resized.width).toBe(260);
    expect(resized.x).toBe(100);
  });
});
