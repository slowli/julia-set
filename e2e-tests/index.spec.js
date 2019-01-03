/* eslint-env jest */
/* global page */

import {
  FRACTALS,
  FRACTAL_SIZE,
  checkSnapshot,
  parsePng,
} from './samples';

const { width, height } = FRACTAL_SIZE;
const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
    </head>
  <body style="margin: 0; padding: 0;">
    <canvas
      id="canvas"
      width="${width}"
      height="${height}"
      style="width: ${width}px; height: ${height}px;"
    />
  </body>
  </html>`;

describe('fractal', () => {
  beforeAll(async () => {
    const base64Html = Buffer.from(html, 'utf8').toString('base64');
    const dataUrl = `data:text/html;base64,${base64Html}`;
    await page.goto(dataUrl);
    await page.setViewport({ width, height });

    const scriptPath = require.resolve('../packages/julia-set');
    await page.addScriptTag({ path: scriptPath });
  });

  Object.keys(FRACTALS).forEach((name) => {
    const options = Object.assign({}, FRACTALS[name]);
    options.palette = [[255, 255, 255, 255], [0, 0, 0, 255]];

    it(`renders sample fractal: ${name}`, async () => {
      const pixels = await page.evaluate((fractalOptions) => {
        const { JuliaSet } = window;
        const canvas = document.getElementById('canvas');
        JuliaSet.render(canvas, fractalOptions);
        return canvas.toDataURL();
      }, options);

      const png = parsePng(pixels);
      checkSnapshot(png, name);
    });
  });
});
