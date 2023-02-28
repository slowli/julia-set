import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import render from '..';
import { Options } from 'julia-set';

// The default timeout doesn't always work.
jest.setTimeout(15000);

const fractalOptions: Options = {
  code: '0i1 * acosh(cosh(0i1 * z) - arg z^-2) + -0.05i0.05',
  height: 8,
  center: [-9.41, 0],
  iterations: 80,
  runawayDistance: 5.25,
  palette: [[0, 0, 0], [128, 128, 255], [255, 255, 255]],
};

describe('render (TypeScript)', () => {
  it('renders to a buffer', async () => {
    const screenshot = {
      width: 100,
      height: 100,
      type: ('png' as 'png'),
    };
    const buffer: Uint8Array = await render({ screenshot, ...fractalOptions });
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('renders to a string buffer', async () => {
    const screenshot = {
      width: 100,
      height: 100,
      type: ('jpeg' as 'jpeg'),
      quality: 90,
      encoding: ('base64' as 'base64'),
    };
    const buffer: string = await render({ screenshot, ...fractalOptions });
    expect(buffer).toMatch(/^[A-Za-z0-9\/+]+={0,2}$/);
  });

  it('renders to a file', async () => {
    const suffix = Buffer
      .from([0, 0, 0, 0].map(() => Math.random() * 255))
      .toString('hex');
    const imagePath = path.join(os.tmpdir(), `julia-set-node-types-${suffix}.png`);

    const screenshot = {
      width: 100,
      height: 100,
      path: imagePath,
    };
    <void>await render({ screenshot, ...fractalOptions });
    await expect(fs.access(imagePath)).resolves.toBeUndefined();
    await fs.unlink(imagePath);
  });
});
