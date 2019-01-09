# Julia Sets

[![Build status][travis-image]][travis-url]
[![Coverage report][coverage-image]][coverage-url]
[![License: Apache-2.0][license-image]][license-url]

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![maintained with lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

[travis-image]: https://img.shields.io/travis/com/slowli/julia-set.svg
[travis-url]: https://travis-ci.com/slowli/julia-set/
[coverage-image]: https://img.shields.io/codecov/c/gh/slowli/julia-set.svg
[coverage-url]: https://codecov.io/gh/slowli/julia-set/
[license-image]: https://img.shields.io/github/license/slowli/julia-set.svg
[license-url]: https://github.com/slowli/julia-set/blob/master/LICENSE   

Set of packages for WebGL-assisted rendering of fractals based on [Julia sets].

<p>
  <img
    src="https://github.com/slowli/julia-set/raw/master/examples/tiles.jpg"
    alt="Fractal example"
    width="320" height="180"
  >
</p>

## Packages

- [`julia-set`](packages/julia-set) is the base package usable in modern browsers
- [`julia-set-node`](packages/julia-set-node) is the server-side version, which uses
  [Puppeteer] to perform rendering anywhere

## License

All packages are licensed under the [Apache 2.0 license](LICENSE).

[Julia sets]: https://en.wikipedia.org/wiki/Julia_set
[Puppeteer]: https://npmjs.com/package/puppeteer
