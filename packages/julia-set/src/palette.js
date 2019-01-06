// @flow

const PALETTES = {
  grayscale: [[0, 0, 0], [187, 187, 187], [255, 255, 255]],
  tree: [
    [0, 0, 0],
    [170, 0, 0],
    [136, 204, 0],
    [170, 255, 136],
    [255, 255, 170],
    [255, 255, 255],
  ],
  gold: [
    [0, 0, 0],
    [187, 187, 0],
    [255, 187, 0],
    [255, 255, 0],
    [255, 255, 136],
    [255, 255, 255],
  ],
  snow: [[0, 0, 0], [136, 170, 255], [255, 255, 255]],
  red: [
    [0, 0, 0],
    [170, 34, 0],
    [255, 34, 0],
    [255, 102, 34],
    [255, 255, 255],
  ],
  green: [
    [0, 0, 0],
    [0, 136, 0],
    [0, 204, 34],
    [0, 204, 136],
    [255, 255, 255],
  ],
};

export const PALETTE_SIZE = 256;

// eslint-disable-next-line no-undef
export type Palette = $Keys<typeof PALETTES> | [number, number, number, ?number][];

export type Color = [number, number, number, number];

function toColorArray(palette: Palette): Color[] {
  let colors;
  if (typeof palette === 'string') {
    if (!{}.hasOwnProperty.call(PALETTES, palette)) {
      throw new Error(`Unknown named palette: ${palette}`);
    }
    colors = PALETTES[palette];
  } else {
    colors = palette;
  }

  // eslint-disable-next-line object-curly-newline
  return colors.map(([r, g, b, alpha]) => [
    r, g, b, typeof alpha === 'number' ? alpha : 255,
  ]);
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
