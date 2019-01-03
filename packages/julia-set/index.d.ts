declare type NamedPalette = 'grayscale';
declare type Palette = NamedPalette | [number, number, number, number?][];

declare type Options = {
  code: string,
  center?: [number, number],
  height?: number,
  palette?: Palette,
  iterations?: number,
  runawayDistance?: number,
  antialias?: boolean,
};

declare type UpdateOptions = {
  code?: string,
  center?: [number, number],
  height?: number,
  palette?: Palette,
  iterations?: number,
  runawayDistance?: number,
};

declare class JuliaSet {
  static render(element: HTMLCanvasElement, options: Options): JuliaSet;
  constructor(element: HTMLCanvasElement, options: Options);
  update(options?: UpdateOptions): void;
}

export default JuliaSet;
