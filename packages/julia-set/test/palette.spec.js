/* eslint-env jest */

import rasterize, { PALETTE_SIZE } from '../src/palette';

describe('rasterize', () => {
  it('creates smooth two-color palette', () => {
    const palette = [[0, 0, 0, 255], [255, 255, 255, 255]];
    const colors = rasterize(palette);
    expect(colors).toHaveLength(PALETTE_SIZE);
    expect(colors.every(({ 3: alpha }) => alpha === 255)).toBe(true);
    colors.forEach(({ 0: r, 1: g, 2: b }, i) => {
      expect(r).toBe(i);
      expect(g).toBe(i);
      expect(b).toBe(i);
    });
  });

  it('creates smooth three-color palette', () => {
    const palette = [[0, 0, 0, 255], [255, 0, 0, 255], [0, 0, 255, 255]];
    const colors = rasterize(palette);

    expect(colors).toHaveLength(PALETTE_SIZE);
    expect(colors.every(({ 3: alpha }) => alpha === 255)).toBe(true);

    colors.slice(0, 128).forEach(({ 0: r, 1: g, 2: b }, i) => {
      expect(r).toBe(2 * i);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    colors.slice(127).forEach(({ 0: r, 1: g, 2: b }, i) => {
      expect(Math.abs(r - 255 + 2 * i)).toBeLessThan(2);
      expect(g).toBe(0);
      expect(Math.abs(b - 2 * i)).toBeLessThan(2);
    });
  });
});
