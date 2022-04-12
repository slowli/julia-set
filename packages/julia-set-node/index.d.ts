import { Options } from 'julia-set';
import { Browser } from 'puppeteer';

/**
 * Options for taking screenshots of Julia sets.
 */
export declare interface ScreenshotOptions {
  /** Width of the screenshot in pixels. */
  width: number,
  /** Height of the screenshot in pixels. */
  height: number,

  /**
   * Browser instance to use to generate the screenshot.
   * If not specified, the new browser instance will be created automatically.
   */
  browser?: Browser,

  /**
   * Quality of the screenshot image, in the range between 1 and 100 inclusive.
   * Only applicable to JPEG images.
   */
  quality?: number,
  /**
   * Filesystem path to save the snapshot to. If specified,
   * the `encoding` setting will be ignored. If not specified, the generated snapshot
   * will be asynchronously returned instead of being saved to the file system.
   */
  path?: string,
  /**
   * Type of the generated image. If not specified, defaults to `'jpeg'`.
   */
  type?: 'png' | 'jpeg',
  /**
   * Encoding of the returned image `Promise`. Binary encoding means returning the image data
   * as a `Uint8Array`, and `'base64'` means encoding it into a base64 string.
   * If not specified, defaults to `'binary'`.
   */
  encoding?: 'binary' | 'base64',
}

/**
 * Options for saving a Julia set image to the file system.
 */
declare type SaveScreenshotOptions = {
  /** Screenshot options. */
  screenshot: ScreenshotOptions & { path: string },
};
/**
 * Renders a Julia set and saves the resulting image to the file system.
 *
 * @param options rendering options
 */
declare function render(options: Options & SaveScreenshotOptions): Promise<void>;

/**
 * Options for generating a Julia set image as `Uint8Array` image data.
 */
declare type BinaryScreenshotOptions = {
  /** Screenshot options. */
  screenshot: ScreenshotOptions & { path?: never, encoding?: 'binary' },
};
/**
 * Renders a Julia set and returns the resulting image as `Uint8Array` image data.
 *
 * @param options rendering options
 */
declare function render(options: Options & BinaryScreenshotOptions): Promise<Uint8Array>;

/**
 * Options for generating a Julia set image as base64-encoded image data.
 */
declare type Base64ScreenshotOptions = {
  /** Screenshot options. */
  screenshot: ScreenshotOptions & { path?: never, encoding: 'base64' },
};
/**
 * Renders a Julia set and returns the resulting image as base64-encoded image data.
 *
 * @param options rendering options
 */
declare function render(options: Options & Base64ScreenshotOptions): Promise<string>;

export default render;
