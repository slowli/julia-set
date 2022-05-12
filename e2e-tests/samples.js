/* eslint-env jest */

import path from 'path';
import fs from 'fs';
import ssim from 'ssim.js';
import { PNG } from 'pngjs';

export const FRACTAL_SIZE = { width: 200, height: 200 };

export const FRACTALS = {
  simple: {
    code: 'z*z + 0.2i0.5',
    height: 3,
    center: [0, 0],
    iterations: 80,
    runawayDistance: 4,
  },
  cosh: {
    code: 'z^2 * cosh z + 0.25',
    height: 3.75,
    center: [0, 0],
    iterations: 80,
    runawayDistance: 4,
  },
  exp: {
    code: 'exp(z^-4) + 0i0.15',
    height: 4,
    center: [0, 0],
    iterations: 60,
    runawayDistance: 9,
  },
  star: {
    code: 'z*(1.05 + atanh(z^-5))',
    height: 4,
    center: [0, 0],
    iterations: 80,
    runawayDistance: 10,
  },
  flower: {
    code: '0.8*z + z/atanh(z^-4)',
    height: 2,
    center: [0, 0],
    iterations: 80,
    runawayDistance: 10,
  },
  hills: {
    code: '0i1 * acosh(cosh(0i1 * z) - arg z^-2) + -0.05i0.05',
    height: 8,
    center: [-9.41, 0],
    iterations: 80,
    runawayDistance: 5,
  },
  fragmentedSpiral: {
    code: '0.15i0.1*z*acosh(z^-4) - z',
    height: 19,
    center: [0, 0],
    iterations: 40,
    runawayDistance: 12,
  },
  structures: {
    code: 'z*tanh z + 0.35i0.1',
    height: 2.1,
    center: [0, 0],
    iterations: 80,
    runawayDistance: 5,
  },
  outward: {
    code: 'z*(0i2.61 + atanh(z^8))',
    height: 2.5,
    center: [0, 0],
    iterations: 80,
    runawayDistance: 9,
  },
  spiral: {
    code: 'z + tanh sqrt z + -0.18i0.5',
    height: 2.3,
    center: [-6.84, 1.15],
    iterations: 80,
    runawayDistance: 9,
  },
};

function toBeDifferentImage(receivedPng, referencePng, ssimThreshold = 0.95) {
  if (receivedPng.width !== referencePng.width) {
    return {
      pass: true,
      message: () => `Differing image width: ${receivedPng.width} vs ${referencePng.width}`,
    };
  }
  if (receivedPng.height !== referencePng.height) {
    return {
      pass: true,
      message: () => `Differing image height: ${receivedPng.height} vs ${referencePng.height}`,
    };
  }

  const { mssim } = ssim(receivedPng, referencePng);
  return {
    pass: mssim < ssimThreshold,
    message: () => `SSIM: ${mssim.toFixed(4)}`,
  };
}

export function parsePng(url) {
  const matches = url.match(/^data:image\/png;base64,(.*)$/);
  if (!matches || !matches[1]) {
    throw new Error(`Invalid url: ${url}`);
  }
  const buffer = Buffer.from(matches[1], 'base64');
  return PNG.sync.read(buffer);
}

export function checkSnapshot(png, snapshotName) {
  const snapshotPath = path.join(__dirname, `__snapshots__/${snapshotName}.png`);

  if (!fs.existsSync(snapshotPath)) {
    if (process.env.UPDATE_SNAPSHOTS) {
      // Save snapshot
      const data = PNG.sync.write(png, { colorType: 0 });
      fs.writeFileSync(snapshotPath, data);
    } else {
      throw new Error(`Snapshot ${snapshotName} not found; aborting.`);
    }
  } else {
    // Load snapshot and compare to the supplied data.
    const data = fs.readFileSync(snapshotPath);
    const referencePng = PNG.sync.read(data);
    expect(png).not.toBeDifferentImage(referencePng);
  }
}

expect.extend({
  toBeDifferentImage,
});
