/**
 * This script is little tricky: we need a real browser environment in order to test
 * that TS declarations correspond to reality.
 */

import JuliaSet_ from '..';

// Hacky way to get necessary declarations for `jest-puppeteer`.
declare var page: {
  evaluate<T>(eval: () => T): Promise<T>,
  addScriptTag(options: { path: string }): Promise<void>,
};

declare namespace window {
  // We import `JuliaSet` in `beforeAll` hook.
  class JuliaSet extends JuliaSet_ {}
}

describe('JuliaSet (TypeScript)', () => {
  beforeAll(async () => {
    const scriptPath = require.resolve('..');
    await page.addScriptTag({ path: scriptPath });
  });

  it('renders stuff', async () => {
    await page.evaluate(() => {
      const { JuliaSet } = window;
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      JuliaSet.render(canvas, {
        code: 'z * z + 0.33i0.5',
        palette: [[255, 255, 255], [0, 192, 0]],
        height: 3,
        center: [0, 0],
        iterations: 75,
        runawayDistance: 4,
      });
    });
  });

  it('can be updated', async () => {
    await page.evaluate(() => {
      const { JuliaSet } = window;
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const fractal = new JuliaSet(canvas, {
        code: 'z * z + 0.33i0.5',
        palette: [[255, 255, 255], [0, 192, 0]],
        iterations: 75,
      });
      fractal.update();
      fractal.update({height: 4});
      fractal.update({
        runawayDistance: 8,
        center: [-1, 1],
      });
    });
  });
});
