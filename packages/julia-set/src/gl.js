// @flow

import type { Notation } from './parser';
import VERTEX_SHADER from './vertex.glsl';
import { prepareForShader } from './parser';
import FRAGMENT_SHADER_TEMPLATE from './fragment.glsl';
import { PALETTE_SIZE } from './palette';

import type { Color } from './palette';

export type GLParams = {
  context: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  program: WebGLProgram,
  texture: WebGLTexture,
  palette: WebGLTexture,

  // Cached transform code.
  code: string,
  // Cached iterations number.
  maxIterations: number,
  // Cached canvas width.
  canvasWidth: number,
  // Cached canvas height.
  canvasHeight: number,
  // Cached rasterized palette.
  paletteColors: Color[],
};

export type DrawingOptions = {
  func: Notation,
  width: number,
  height: number,
  iterations: number,
  distance: number,
  paletteColors: Color[],
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
};

function getMaxPrecision(gl: WebGLRenderingContext): 'highp' | 'mediump' | 'lowp' {
  let vFormat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
  let fFormat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if ((vFormat && vFormat.precision > 0) && (fFormat && fFormat.precision > 0)) {
    return 'highp';
  }

  vFormat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
  fFormat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  if ((vFormat && vFormat.precision > 0) && (fFormat && fFormat.precision > 0)) {
    return 'mediump';
  }

  return 'lowp';
}

function getShader(
  gl: WebGLRenderingContext,
  type: number,
  code: string,
): WebGLShader {
  const precision = getMaxPrecision(gl);
  const standardCode = `precision ${precision} float;\n`;

  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Cannot create shader');
  }
  gl.shaderSource(shader, standardCode + code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    throw new Error(`Error compiling shader${log ? `: ${log}` : ''}`);
  }

  return shader;
}

function createTexture(gl: WebGLRenderingContext): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Cannot create new texture');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

function createFragmentShader(
  gl: WebGLRenderingContext,
  prepared: { code: string, params: number[] },
  options: DrawingOptions,
): WebGLShader {
  let template = FRAGMENT_SHADER_TEMPLATE;
  template = `#define MAX_ITERATIONS ${options.iterations}\n${template}`;
  const fragmentShaderCode = template.replace('CODE', prepared.code);
  return getShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Cannot create WebGL program');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Cannot link WebGL program');
  }

  return program;
}

/**
 * Checks if two rasterized palettes are identical.
 */
function sameColors(cachedColors: Color[], paletteColors: Color[]): boolean {
  return cachedColors.length === paletteColors.length
    && paletteColors.every(
      (color, i) => color.every((channel, ch) => channel === cachedColors[i][ch]),
    );
}

function preparePalette(glParams: GLParams, options: DrawingOptions): GLParams {
  const gl = glParams.context;
  const outputParams = { ...glParams };

  const paletteNeedsUpdate = !sameColors(outputParams.paletteColors, options.paletteColors);
  if (paletteNeedsUpdate) {
    const paletteData = new Uint8Array(PALETTE_SIZE * 4);
    options.paletteColors.forEach((color, i) => {
      for (let ch = 0; ch < 4; ch += 1) {
        paletteData[4 * i + ch] = color[ch];
      }
    });

    gl.bindTexture(gl.TEXTURE_2D, outputParams.palette);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // level
      gl.RGBA,
      PALETTE_SIZE,
      1, // height
      0, // border
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      paletteData,
    );
  }
  gl.bindTexture(gl.TEXTURE_2D, null);

  outputParams.paletteColors = options.paletteColors;
  return outputParams;
}

function setAttributesArray(
  gl: WebGLRenderingContext,
  position: number,
  array: number[][],
): void {
  const len = array[0].length;
  const flattened = [];
  array.forEach((row) => {
    flattened.push(...row);
  });

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattened), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, len, gl.FLOAT, false, 0, 0);
}

function bindVariables(
  glParams: GLParams,
  options: DrawingOptions,
  data: number[],
): void {
  const { context: gl, program } = glParams;

  let location = gl.getAttribLocation(program, 'a_position');
  const vertices = [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [-1.0, 1.0],
    [1.0, -1.0],
    [1.0, 1.0],
  ];
  setAttributesArray(gl, location, vertices);

  // Bind uniforms
  location = gl.getUniformLocation(program, 'u_coordOffsetScale');
  gl.uniform4f(
    location,
    options.minX,
    options.minY,
    options.maxX - options.minX,
    options.maxY - options.minY,
  );
  location = gl.getUniformLocation(program, 'u_distance');
  gl.uniform1f(location, options.distance);
  location = gl.getUniformLocation(program, 'u_params');
  gl.uniform2fv(location, new Float32Array(data));
  location = gl.getUniformLocation(program, 'u_texture');
  gl.uniform1i(location, 0);
  location = gl.getUniformLocation(program, 'u_palette');
  gl.uniform1i(location, 1);
  location = gl.getUniformLocation(program, 'u_pixelSize');
  gl.uniform2f(location, 1 / options.width, 1 / options.height);
}

export function newGLParams(gl: WebGLRenderingContext, options: DrawingOptions): GLParams {
  const prepared = prepareForShader(options.func);
  const vertexShader = getShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = createFragmentShader(gl, prepared, options);

  const params = {
    context: gl,
    vertexShader,
    fragmentShader,
    program: createProgram(gl, vertexShader, fragmentShader),
    texture: createTexture(gl),
    palette: createTexture(gl),

    code: prepared.code,
    maxIterations: options.iterations,
    canvasWidth: options.width,
    canvasHeight: options.height,
    paletteColors: [], // will be updated by `preparePalette`
  };
  return preparePalette(params, options);
}

function prepareProgram(glParams: GLParams, options: DrawingOptions): GLParams {
  const { context: gl } = glParams;
  const outputParams = { ...glParams };
  gl.viewport(0, 0, options.width, options.height);

  let { program } = outputParams;

  const prepared = prepareForShader(options.func);
  if (
    (prepared.code !== outputParams.code)
    || (outputParams.maxIterations !== options.iterations)
  ) {
    outputParams.code = prepared.code;
    outputParams.maxIterations = options.iterations;
    outputParams.fragmentShader = createFragmentShader(gl, prepared, options);
    program = null;
  }

  // Create the shader program
  if (!program) {
    program = createProgram(gl, outputParams.vertexShader, outputParams.fragmentShader);
  }
  outputParams.program = program;
  gl.useProgram(program);
  bindVariables(outputParams, options, prepared.params);
  return outputParams;
}

function prepareTexture(glParams: GLParams, options: DrawingOptions): GLParams {
  const gl = glParams.context;
  const outputParams = { ...glParams };

  const textureNeedsUpdate = outputParams.canvasWidth !== options.width
    || outputParams.canvasHeight !== options.height;
  if (textureNeedsUpdate) {
    gl.bindTexture(gl.TEXTURE_2D, outputParams.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // level
      gl.RGBA,
      options.width,
      options.height,
      0, // border
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
  }
  gl.bindTexture(gl.TEXTURE_2D, null);

  outputParams.canvasWidth = options.width;
  outputParams.canvasHeight = options.height;
  return outputParams;
}

export default function draw(glParams: GLParams, options: DrawingOptions): GLParams {
  const gl = glParams.context;

  let outputParams = prepareProgram(glParams, options);
  outputParams = prepareTexture(outputParams, options);
  outputParams = preparePalette(outputParams, options);

  // Phase 0: Calculate number of iterations
  let location = gl.getUniformLocation(outputParams.program, 'u_phase');
  gl.uniform1i(location, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindTexture(gl.TEXTURE_2D, outputParams.texture);
  gl.copyTexImage2D(
    gl.TEXTURE_2D,
    0, // level
    gl.RGBA,
    0, // x
    0, // y
    options.width,
    options.height,
    0, // border
  );

  // Phase 1: paint!
  location = gl.getUniformLocation(outputParams.program, 'u_phase');
  gl.uniform1i(location, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, outputParams.texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, outputParams.palette);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return outputParams;
}
