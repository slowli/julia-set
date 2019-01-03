/* eslint-env jest */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { PNG } from 'pngjs';
import puppeteer from 'puppeteer';
import rimraf from 'rimraf';

import render from '../src';
import {
  FRACTALS,
  FRACTAL_SIZE,
  checkSnapshot,
} from '../../../e2e-tests/samples';

describe('render', () => {
  let tempDir = '';
  let browser = null;

  beforeAll(async () => {
    tempDir = await new Promise((resolve, reject) => {
      fs.mkdtemp(path.join(os.tmpdir(), 'julia-set-node-'), (err, dir) => {
        if (err) {
          reject(err);
        } else {
          resolve(dir);
        }
      });
    });
    browser = await puppeteer.launch();
  });

  afterAll(async () => {
    await browser.close();
    await new Promise((resolve, reject) => {
      rimraf(tempDir, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('works without browser instance', async () => {
    const options = FRACTALS.simple;
    const buffer = await render({
      screenshot: {
        type: 'png',
        encoding: 'binary',
        ...FRACTAL_SIZE,
      },
      palette: [[255, 255, 255, 255], [0, 0, 0, 255]],
      ...options,
    });

    const png = PNG.sync.read(buffer);
    checkSnapshot(png, 'simple');
  });

  it('works with large rendering sizes', async () => {
    const options = FRACTALS.simple;
    const buffer = await render({
      browser,
      screenshot: {
        type: 'png',
        encoding: 'binary',
        width: 1280,
        height: 720,
      },
      palette: [[255, 255, 255, 255], [0, 0, 0, 255]],
      ...options,
    });
    const png = PNG.sync.read(buffer);
    expect(png.width).toBe(1280);
    expect(png.height).toBe(720);
  });

  Object.keys(FRACTALS).forEach((name) => {
    const options = FRACTALS[name];

    it(`saves sample fractal ${name} to buffer`, async () => {
      const buffer = await render({
        browser,
        screenshot: {
          type: 'png',
          encoding: 'binary',
          ...FRACTAL_SIZE,
        },
        palette: [[255, 255, 255, 255], [0, 0, 0, 255]],
        ...options,
      });

      const png = PNG.sync.read(buffer);
      checkSnapshot(png, name);
    });

    it(`saves sample fractal ${name} to file system with given browser`, async () => {
      const savePath = path.join(tempDir, `${name}.singleBrowser.png`);

      await render({
        browser,
        screenshot: {
          path: savePath,
          ...FRACTAL_SIZE,
        },
        palette: [[255, 255, 255, 255], [0, 0, 0, 255]],
        ...options,
      });

      const buffer = fs.readFileSync(savePath);
      const png = PNG.sync.read(buffer);
      checkSnapshot(png, name);
    });
  });
});
