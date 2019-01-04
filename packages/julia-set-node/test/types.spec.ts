import fs from 'fs';
import os from 'os';
import path from 'path';
import render from '..';
import { Options } from 'julia-set';

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
    const options = Object.assign({ screenshot }, fractalOptions);
    const buffer: Uint8Array = await render(options);
    expect(buffer).toBeInstanceOf(Uint8Array);
  });

  it('renders to a string buffer', async () => {
    const screenshot = {
      width: 100,
      height: 100,
      type: ('jpeg' as 'jpeg'),
      quality: 90,
      encoding: ('base64' as 'base64'),
    };
    const options = Object.assign({ screenshot }, fractalOptions);
    const buffer: string = await render(options);
    expect(buffer).toMatch(/^[A-Za-z0-9\/+]+$/);
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
    const options = Object.assign({ screenshot }, fractalOptions);
    <void>await render(options);
    expect(fs.existsSync(imagePath)).toBeTruthy();
    fs.unlinkSync(imagePath);
  });
});
