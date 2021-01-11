// eslint-disable-next-line import/no-extraneous-dependencies
import puppeteer from 'puppeteer';

function createDataUrl({ width, height }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
    <body style="margin: 0; padding: 0;">
      <canvas id="canvas" width="${width}" height="${height}" style="width: ${width}px; height: ${height}px;" />
    </body>
    </html>`;

  const base64Data = Buffer.from(html, 'utf8').toString('base64');
  return `data:text/html;base64,${base64Data}`;
}

export default async function render(options) {
  // Separate options into functional components.
  const { screenshot, browser: maybeBrowser, ...fractalOptions } = options;
  const { width, height, ...screenshotOptions } = screenshot;

  const browserNeedsClosing = !maybeBrowser;
  const browser = maybeBrowser || await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(createDataUrl({ width, height }));
  await page.setViewport({ width, height });
  await page.addScriptTag({ path: require.resolve('julia-set') });

  try {
    // istanbul ignore next: instrumentation breaks test
    await page.evaluate((opt) => {
      const { JuliaSet } = window;
      JuliaSet.render(document.getElementById('canvas'), opt);
    }, fractalOptions);

    return await page.screenshot(screenshotOptions);
  } finally {
    await page.close();
    if (browserNeedsClosing) {
      await browser.close();
    }
  }
}
