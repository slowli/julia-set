# julia-set-node

[![Build status][travis-image]][travis-url]
[![Coverage report][coverage-image]][coverage-url]
[![License: Apache-2.0][license-image]][license-url]

[travis-image]: https://img.shields.io/travis/com/slowli/julia-set.svg
[travis-url]: https://travis-ci.com/slowli/julia-set/
[coverage-image]: https://img.shields.io/codecov/c/gh/slowli/julia-set.svg
[coverage-url]: https://codecov.io/gh/slowli/julia-set/
[license-image]: https://img.shields.io/github/license/slowli/julia-set.svg
[license-url]: https://github.com/slowli/julia-set/blob/master/LICENSE   

> Rendering [Julia sets] for complex functions on the server side.

This package allows rendering Julia / Fatou sets for complex functions in Node.
The resulting images often have fractal-like nature.

## API

An image can be rendered using the default export of the package:

```typescript
declare function render(
  options: Options & { screenshot: ScreenshotOptions },
): Promise<void | string | Uint8Array>;

export default render;
```

Here, `Options` is the rendering options from the [`julia-set`] package, and `ScreenshotOptions`
are defined as:

```typescript
declare interface ScreenshotOptions {
  width: number,
  height: number,
  browser?: Browser,
  quality?: number,
  path?: string,
  type?: 'png' | 'jpeg',
  encoding?: 'binary' | 'base64',
}
```

- `width` and `height` are sizes of the generated image
- The remaining options correspond to [`puppeteer` screenshot options][puppeteer-options]. For example, `type`
  determines the image type, `quality` the JPEG quality parameter, etc.
- If specified, `browser` determines the `pupetteer` browser instance used to render the image.
  This may be useful to save resources during batch rendering.

Depending on specified `ScreenshotOptions`, the `Promise` returned by `render` may resolve to nothing
(if `path` to save the image was specified), or to a `Uint8Array` / `string` with image data
(in the binary and base64 encodings, respectively).

## License

`julia-set-node` is licensed under the [Apache 2.0 license][license].

[`julia-set`]: https://npmjs.com/package/julia-set/
[puppeteer-options]: https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagescreenshotoptions
[license]: https://www.apache.org/licenses/LICENSE-2.0
