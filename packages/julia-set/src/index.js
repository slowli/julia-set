// @flow

import { parse } from './parser';
import paletteColors from './palette';
import draw, { newGLParams } from './gl';

import type { Palette } from './palette';
import type { DrawingOptions, GLParams } from './gl';

export type RequiredOptions = {| code: string |};

type Options = {
  code: string,
  center: [number, number],
  height: number,
  palette: Palette,
  iterations: number,
  runawayDistance: number,
  antialias: boolean,
};

const DEFAULT_OPTIONS = {
  center: [0, 0],
  height: 5,
  palette: 'grayscale',
  iterations: 60,
  runawayDistance: 4,
  antialias: false,
};

function createDrawingOptions(
  canvas: HTMLCanvasElement,
  options: Options,
): DrawingOptions {
  const height = +options.height;
  const width = (height * canvas.width) / canvas.height;

  return {
    func: parse(options.code),
    width: canvas.width,
    height: canvas.height,
    iterations: +options.iterations,
    distance: +options.runawayDistance,
    paletteColors: paletteColors(options.palette),
    minX: +options.center[0] - width / 2,
    maxX: +options.center[0] + width / 2,
    minY: +options.center[1] - height / 2,
    maxY: +options.center[1] + height / 2,
  };
}

export default class JuliaSet {
  /**
   * GL parameters associated with the fractal.
   * @api private
   */
  _glParams: GLParams;

  /**
   * Options for the fractal.
   * @api private
   */
  _options: Options;

  /**
   * Canvas used to draw the fractal.
   * @api private
   */
  _canvas: HTMLCanvasElement;

  static render(canvas: HTMLCanvasElement, options: RequiredOptions): this {
    return new this(canvas, options);
  }

  constructor(canvas: HTMLCanvasElement, options: RequiredOptions) {
    const resolvedOptions: Options = { ...DEFAULT_OPTIONS, ...options };
    const canvasParams: { antialias: boolean } = { antialias: resolvedOptions.antialias };

    const context = canvas.getContext('webgl', canvasParams)
      || canvas.getContext('experimental-webgl', canvasParams);
    if (!context) {
      throw new Error('Cannot get WebGL context for rendering');
    }

    const drawingOptions = createDrawingOptions(canvas, resolvedOptions);
    const glParams = newGLParams(context);

    this._canvas = canvas;
    this._options = resolvedOptions;
    this._glParams = draw(glParams, drawingOptions);
  }

  // eslint-disable-next-line no-undef
  update(options?: $Shape<Options>): void {
    Object.assign(this._options, options || {});
    this._glParams = draw(this._glParams, createDrawingOptions(this._canvas, this._options));
  }
}
