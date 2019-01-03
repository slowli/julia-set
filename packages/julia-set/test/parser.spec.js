/* eslint-env jest */

import { parse, prepareForShader } from '../src/parser';

const TEST_VECTORS = [
  {
    code: '2 * sinh z ^ 1.5 * z - 0i1.0',
    program: {
      tokens: ['data', 'var', 'sinh', 'data', 'pow', 'mul', 'var', 'mul', 'data', 'minus'],
      numbers: [
        { re: 2, im: 0 },
        { re: 1.5, im: 0 },
        { re: 0, im: 1 },
      ],
    },
    inShader: 'c_minus(c_mul(c_mul(u_params[0], c_pow(c_sinh(z), u_params[1])), z), u_params[2])',
  },
  {
    code: '(2 * sinh z) ^ 1.5 * z - 0i1.0',
    program: {
      tokens: ['data', 'var', 'sinh', 'mul', 'data', 'pow', 'var', 'mul', 'data', 'minus'],
      numbers: [
        { re: 2, im: 0 },
        { re: 1.5, im: 0 },
        { re: 0, im: 1 },
      ],
    },
    inShader: 'c_minus(c_mul(c_pow(c_mul(u_params[0], c_sinh(z)), u_params[1]), z), u_params[2])',
  },
  {
    code: 'sinh[z + 1/cosh(z * 1j-1)] + 0j0.5',
    program: {
      tokens: ['var', 'data', 'var', 'data', 'mul', 'cosh', 'div', 'plus', 'sinh', 'data', 'plus'],
      numbers: [
        { re: 1, im: 0 },
        { re: 1, im: -1 },
        { re: 0, im: 0.5 },
      ],
    },
    inShader: 'c_plus(c_sinh(c_plus(z, c_div(u_params[0], c_cosh(c_mul(z, u_params[1]))))), u_params[2])',
  },
  {
    code: 'exp z * exp z',
    program: {
      tokens: ['var', 'exp', 'var', 'exp', 'mul'],
      numbers: [],
    },
    inShader: 'c_mul(c_exp(z), c_exp(z))',
  },
  {
    code: '-1 - -1*tanh(z^1.25 - 1)',
    program: {
      tokens: ['data', 'data', 'var', 'data', 'pow', 'data', 'minus', 'tanh', 'mul', 'minus'],
      numbers: [
        { re: -1, im: 0 },
        { re: -1, im: 0 },
        { re: 1.25, im: 0 },
        { re: 1, im: 0 },
      ],
    },
    inShader: 'c_minus(u_params[0], c_mul(u_params[1], c_tanh(c_minus(c_pow(z, u_params[2]), u_params[3]))))',
  },
];

describe('parse', () => {
  it('parses a simple program', () => {
    const notation = parse('z * z + 1i-1.2');
    expect(notation).toEqual({
      tokens: ['var', 'var', 'mul', 'data', 'plus'],
      numbers: [
        { re: 1, im: -1.2 },
      ],
    });
  });

  TEST_VECTORS.forEach(({ code, program }) => {
    it(`parses ${code}`, () => {
      expect(parse(code)).toEqual(program);
    });
  });
});

describe('prepareForShader', () => {
  it('creates shader code for simple program', () => {
    const notation = parse('z * z + 1i-1.2');
    const { code } = prepareForShader(notation);
    expect(code).toBe('c_plus(c_mul(z, z), u_params[0])');
  });

  TEST_VECTORS.forEach(({ code, inShader }) => {
    it(`parses ${code}`, () => {
      const notation = parse(code);
      const { code: shaderCode } = prepareForShader(notation);
      expect(shaderCode).toBe(inShader);
    });
  });
});
