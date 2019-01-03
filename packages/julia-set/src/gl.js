// @flow

import type { Notation } from './parser';
import vertexShader from './vertex.glsl';
import { prepareForShader } from './parser';
import fragmentShaderTemplate from './fragment.glsl';
import { PALETTE_SIZE } from './palette';

import type { Color } from './palette';

export type GLParams = {
  context: WebGLRenderingContext,
  vertexShader: ?WebGLShader,
  fragmentShader: ?WebGLShader,
  program: ?WebGLProgram,
  texture: ?WebGLTexture,
  palette: ?WebGLTexture,

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

export function newGLParams(context: WebGLRenderingContext): GLParams {
  return {
    context,
    vertexShader: null,
    fragmentShader: null,
    program: null,
    texture: null,
    palette: null,

    code: '',
    maxIterations: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    paletteColors: [],
  };
}

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
  gl.shaderSource(shader, standardCode + code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    throw new Error(`Error compiling shader${log ? `: ${log}` : ''}`);
  }

  return shader;
}

function setAttributesArray(
  gl: WebGLRenderingContext,
  position: number,
  array: number[][],
): void {
  const len = array[0].length;
  const flattened = [];
  array.forEach((row) => {
    Array.prototype.push.apply(flattened, row);
  });

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattened), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, len, gl.FLOAT, false, 0, 0);
}

function bindVariables(glParams: GLParams, options: DrawingOptions, data: number[]): void {
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
  gl.uniform4f(location, options.minX, options.minY,
    options.maxX - options.minX, options.maxY - options.minY);
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

function prepareProgram(glParams: GLParams, options: DrawingOptions): GLParams {
  const { context: gl } = glParams;
  const outputParams = Object.assign({}, glParams);
  gl.viewport(0, 0, options.width, options.height);

  if (!outputParams.vertexShader) {
    outputParams.vertexShader = getShader(gl, gl.VERTEX_SHADER, vertexShader);
    outputParams.program = null;
  }
  if (!outputParams.vertexShader) {
    throw new Error('Cannot compile vertex shader');
  }

  const prepared = prepareForShader(options.func);

  if (prepared.code !== outputParams.code || outputParams.maxIterations !== options.iterations) {
    outputParams.code = prepared.code;
    outputParams.maxIterations = options.iterations;

    // Recompile the fragment shader
    let template = fragmentShaderTemplate;
    template = `#define MAX_ITERATIONS ${options.iterations}\n${template}`;
    const fragmentShaderCode = template.replace('CODE', prepared.code);
    outputParams.fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);
    outputParams.program = null;
  }

  // Create the shader program
  if (!outputParams.program) {
    outputParams.program = gl.createProgram();
    gl.attachShader(outputParams.program, outputParams.vertexShader);
    gl.attachShader(outputParams.program, outputParams.fragmentShader);
    gl.linkProgram(outputParams.program);
  }
  const { program } = outputParams;

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Cannot link WebGL program');
  }
  gl.useProgram(program);
  bindVariables(outputParams, options, prepared.params);

  return outputParams;
}

function prepareTexture(glParams: GLParams, options: DrawingOptions): GLParams {
  const gl = glParams.context;
  const outputParams = Object.assign({}, glParams);

  const textureNeedsUpdate = !outputParams.texture
    || outputParams.canvasWidth !== options.width
    || outputParams.canvasHeight !== options.height;
  if (!outputParams.texture) {
    outputParams.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, outputParams.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  if (textureNeedsUpdate) {
    gl.bindTexture(gl.TEXTURE_2D, outputParams.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      options.width, options.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);

  outputParams.canvasWidth = options.width;
  outputParams.canvasHeight = options.height;
  return outputParams;
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
  const outputParams = Object.assign({}, glParams);

  const paletteNeedsUpdate = !outputParams.palette
    || !sameColors(outputParams.paletteColors, options.paletteColors);
  if (!outputParams.palette) {
    outputParams.palette = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, outputParams.palette);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  if (paletteNeedsUpdate) {
    const paletteData = new Uint8Array(PALETTE_SIZE * 4);
    options.paletteColors.forEach((color, i) => {
      for (let ch = 0; ch < 4; ch += 1) {
        paletteData[4 * i + ch] = color[ch];
      }
    });

    gl.bindTexture(gl.TEXTURE_2D, outputParams.palette);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PALETTE_SIZE, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, paletteData);
    outputParams.paletteNeedsUpdate = false;
  }
  gl.bindTexture(gl.TEXTURE_2D, null);

  outputParams.paletteColors = options.paletteColors;
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
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
    0, 0, options.width, options.height, 0);

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
