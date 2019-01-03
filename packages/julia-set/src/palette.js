// @flow

const PALETTES = {
  grayscale: [[0, 0, 0, 255], [255, 255, 255, 255]],
};

export const PALETTE_SIZE = 256;

// eslint-disable-next-line no-undef
export type Palette = $Keys<typeof PALETTES> | [number, number, number, ?number][];

export type Color = [number, number, number, number];

function toColorArray(palette: Palette): Color[] {
  if (typeof palette === 'string') {
    return PALETTES[palette];
  }
  return palette.map(([r, g, b, alpha]) =>
    [r, g, b, typeof alpha === 'number' ? alpha : 255]);
}

export default function rasterize(palette: Palette) {
  const paletteColors = toColorArray(palette);
  const nColors = paletteColors.length;
  const colorDist = (PALETTE_SIZE - 1) / (nColors - 1);

  const colors = [];
  // eslint-disable-next-line prefer-destructuring
  colors[0] = paletteColors[0];

  paletteColors.forEach((color, i) => {
    if (i === 0) return;

    const prev = Math.floor((i - 1) * colorDist);
    const idx = Math.floor(i * colorDist);
    colors[idx] = color;

    // Interpolate missing colors.
    for (let j = 1; j < colorDist; j += 1) {
      const alpha = j / colorDist;
      const blendedColor = [0, 0, 0, 0];
      for (let ch = 0; ch < 4; ch += 1) {
        blendedColor[ch] = Math.round(
          paletteColors[i - 1][ch] * (1 - alpha)
          + color[ch] * alpha,
        );
      }
      colors[prev + j] = blendedColor;
    }
  });

  return colors;
}
