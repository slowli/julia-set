/* eslint-disable no-console */

const puppeteer = require('puppeteer');
const path = require('path');

const render = require('../packages/julia-set-node');

const fractals = {
  hills: {
    code: '0i1 * acosh(cosh(0i1 * z) - arg z^-2) + -0.05i0.05',
    height: 8,
    center: [-9.41, 0],
    iterations: 80,
    runawayDistance: 5.25,
    palette: 'snow',
  },
  star: {
    code: '0.8i0.3 * z + z/atanh(z^-6)',
    height: 0.43,
    center: [0, 0],
    iterations: 64,
    runawayDistance: 10,
    palette: 'red',
  },
  tiles: {
    code: 'log cosh(0i1.02 * z) + -5.61i0.2',
    height: 12.21,
    center: [0, 0],
    iterations: 64,
    runawayDistance: 7,
    palette: 'green',
  },
  field: {
    code: 'z + 0.25*z*atanh(z^8) - 0i0.33',
    height: 2.5,
    center: [0, 3.292],
    iterations: 48,
    runawayDistance: 10,
    palette: 'gold',
  },
  cup: {
    code: 'z*(1.2 + asinh z^-4) + 0i-0.34',
    height: 0.275,
    center: [0, 0.843],
    iterations: 48,
    runawayDistance: 6,
    palette: 'tree',
  },
};

async function main() {
  if (process.argv.length < 4) {
    console.error(`Usage: ${path.basename(__filename)} WIDTH HEIGHT

    WIDTH and HEIGHT denote the size of generated images in pixels`);
    process.exit(1);
  }
  const width = parseInt(process.argv[2], 10);
  const height = parseInt(process.argv[3], 10);
  console.log(`Creating ${width}x${height} images...`);

  const browser = await puppeteer.launch();
  console.log('Created browser');

  const renderTasks = Object.keys(fractals).map((name) => {
    const options = { browser, ...fractals[name] };
    options.screenshot = {
      width,
      height,
      quality: 92,
      path: path.join(__dirname, `${name}.jpg`),
    };

    return render(options)
      .then(() => console.log(`Successfully rendered fractal ${name}`));
  });
  await Promise.all(renderTasks);
  await browser.close();
}

main().catch(console.error);
