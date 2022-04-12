declare type NamedPalette = 'grayscale' | 'tree' | 'gold' | 'snow' | 'red' | 'green';

/**
 * Palette specification to use when rendering a Julia set. Can be specified
 * as either a `NamedPalette`, or as a sequence of stop colors in RGB(A) format
 * (each channel ranging from 0 to 255 inclusive), kind of like when specifying
 * a CSS gradient. In the latter case, the palette will be interpolated based
 * on the provided colors.
 */
declare type Palette = NamedPalette | [number, number, number, number?][];

/**
 * Julia set rendering options.
 */
export interface Options {
  /**
   * Code of the function to use, with `z` being a free variable.
   *
   * Numbers are denoted using infix notation; e.g., `0.2i0.5` denotes a complex number
   * with real part `0.2` and imaginary part `0.5i`. Besides arithmetic operations
   * `+`, `-`, `*`, `/` and `^`, some unary complex-valued functions are supported;
   * see the package readme for details.
   */
  code: string,

  /**
   * Center of the rendered rectangular viewport specified as a real part
   * and imaginary part tuple. If not specified, defaults to `[0, 0]`.
   */
  center?: [number, number],
  /**
   * Height of the rendered rectangular viewport. If not specified, defaults to `1`.
   */
  height?: number,
  /**
   * `Palette` to use to visualize the Julia set.
   *
   * The palette is used to map the number of iterations (specified by the `iterations` option)
   * necessary for a particular pixel in the viewport to escape to "infinity"
   * (determined by the `runawayDistance` option) when sequentially applying
   * the complex-valued function specified by the `code` option.
   *
   * If not specified, defaults to `'grayscale'`.
   */
  palette?: Palette,

  /**
   * Maximum number of iterations when calculating runaway behavior of points
   * in the viewport. Greater values reveal more details, but the image
   * may become desaturated.
   *
   * If not specified, defaults to `60`.
   */
  iterations?: number,
  /**
   * Threshold magnitude of complex values to consider "infinite".
   * In some cases, increasing it may reveal fractal details.
   *
   * If not specified, defaults to `4`.
   */
  runawayDistance?: number,

  /**
   * Whether to perform smoothing for outlier points of the rendered image,
   * which are usually caused by loss of precision during calculations.
   *
   * If not specified, defaults to `false`.
   */
  antialias?: boolean,
}

/**
 * Partial `Options` that can be used to update a rendered Julia set.
 */
declare type UpdateOptions = Partial<Omit<Options, 'antialias'>>;

/**
 * Rendered Julia set.
 */
declare class JuliaSet {
  /**
   * One-off utility method to render a Julia set with the specified `options`
   * on the `element`.
   *
   * @param element canvas to use to render the set
   * @param options Julia set options
   */
  static render(element: HTMLCanvasElement, options: Options): JuliaSet;

  /**
   * Constructs and renders a new Julia set.
   *
   * @param element canvas to use to render the set
   * @param options Julia set options
   */
  constructor(element: HTMLCanvasElement, options: Options);

  /**
   * Updates the parameters of the Julia set and re-renders it
   * on the same canvas element.
   *
   * @param options updated Julia set options
   */
  update(options?: UpdateOptions): void;
}

export default JuliaSet;
