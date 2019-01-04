import { Options } from 'julia-set';
import { Browser } from 'puppeteer';

export declare interface ScreenshotOptions {
  width: number,
  height: number,
  browser?: Browser,
  quality?: number,
  path?: string,
  type?: 'png' | 'jpeg',
  encoding?: 'binary' | 'base64',
}

declare type SaveScreenshotOptions = { screenshot: ScreenshotOptions & { path: string }};
declare type BinaryScreenshotOptions = { screenshot: ScreenshotOptions & { path?: never, encoding?: 'binary' }};
declare type Base64ScreenshotOptions = { screenshot: ScreenshotOptions & { path?: never, encoding: 'base64' }};

declare function render(options: Options & SaveScreenshotOptions): Promise<void>;
declare function render(options: Options & Base64ScreenshotOptions): Promise<string>;
declare function render(options: Options & BinaryScreenshotOptions): Promise<Uint8Array>;

export default render;
