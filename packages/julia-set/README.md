# julia-set

[![Build status][ci-image]][ci-url]
[![Coverage report][coverage-image]][coverage-url]
[![License: Apache-2.0][license-image]][license-url]

[ci-image]: https://github.com/slowli/julia-set/workflows/CI/badge.svg?branch=master
[ci-url]: https://github.com/slowli/julia-set/actions
[coverage-image]: https://img.shields.io/codecov/c/gh/slowli/julia-set.svg
[coverage-url]: https://codecov.io/gh/slowli/julia-set/
[license-image]: https://img.shields.io/github/license/slowli/julia-set.svg
[license-url]: https://github.com/slowli/julia-set/blob/master/LICENSE   

> Rendering [Julia sets] for complex functions using WebGL.

This package allows rendering Julia / Fatou sets for complex functions [in modern browsers][webgl-support].
The resulting images often have fractal-like nature.

## API

An image can be rendered using the default export of the package:

```typescript
declare class JuliaSet {
  static render(el: HTMLCanvasElement, options: Options);
  constructor(el: HTMLCanvasElement, options: Options);
}

export default JuliaSet;
```

Here, `Options` are defined as follows:

```typescript
declare interface Options {
  code: string,
  palette?: string | [number, number, number, number?][],
  center?: [number, number],
  height?: number,
  iterations?: number,
  runawayDistance?: number,
  antialias?: boolean,
}
```

- `code` is the function of a complex variable `z`, such as `'z*z + 0.2i0.5'`.
  It can use binary operators, such as `+`, `*` or `^`, and standard
  [unary complex functions](#built-in-complex-functions) such as `sinh` and `atanh`.
- `palette` is [a named palette](#palettes) or an array of 3- or 4-component colors
  (encoded as RGB / RGBA, respectively) with each component being an integer from `0` to `255`.
- `center` is the center of the rendered rectangular area.
- `height` is the height of the rendered area. The width is determined automatically based on `height`
  and the canvas dimensions.
- `iterations` is the maximum number of iterations performed by the algorithm.
  Greater values reveal more details, but the image may become desaturated.
- `runawayDistance` is the stopgap distance for the algorithm. In some cases, increasing
  it may reveal fractal details.
- `antialias` corresponds to the [eponymous flag for `HMTLCanvasElement.getContext`][getContext()].

### Example

```javascript
import JuliaSet from 'julia-set';

JuliaSet.render(document.getElementById('canvas'), {
  code: 'z * z + 0.33i0.5',
  palette: [[255, 255, 255], [0, 192, 0]],
  height: 3,
  center: [0, 0],
  iterations: 75,
  runawayDistance: 4,
});
```

### Built-in complex functions

The following functions can be used in `options.code`:

Binary operations:

- `+`, `-`, `*`, `/`, `^`

Unary functions:

- Trigonometric functions: `sinh`, `cosh`, `tanh` (with `sh`, `ch`, `th` synonyms respectively)
- Inverse trigonometric functions: `asinh`, `acosh`, `atanh`
- Exponentiation: `exp`
- Logarithm: `log` (with the `ln` synonym)
- Real / imaginary parts of a complex value: `re`, `im`
- Argument / modulus of a complex value: `arg`, `mod`

To influence function priority, you can use any of three kinds of brackets: `()`, `[]` or `{}`.

### Palettes

The following string values can be used as `options.palette`:

- `grayscale`
- `red`
- `green`
- `tree` (brown and green tones)
- `snow` (light-blue tones)

## License

`julia-set` is licensed under the [Apache 2.0 license][license].

[Julia sets]: https://en.wikipedia.org/wiki/Julia_set
[webgl-support]: https://caniuse.com/#feat=webgl
[getContext()]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
[license]: https://www.apache.org/licenses/LICENSE-2.0
