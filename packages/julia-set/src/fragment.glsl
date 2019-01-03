#define MAX_PARAMS 20
#define SMOOTHING

/** Width of the palette texture. */
const float INV_PALETTE_WIDTH = 1.0 / 256.0;

varying vec2 v_coordinates;
varying vec2 v_position;

// 0 to calculate number of iterations, 1 to colorize
uniform int u_phase;
uniform float u_distance;
uniform vec2 u_params[MAX_PARAMS];

// (1 / canvas.width, 1 / canvas.height)
uniform vec2 u_pixelSize;

uniform sampler2D u_texture;
uniform sampler2D u_palette;

vec2 c_re(vec2 a) {
  return vec2(a[0], 0);
}

vec2 c_im(vec2 a) {
  return vec2(a[1], 0);
}

vec2 c_arg(vec2 a) {
  return vec2(atan(a[1], a[0]), 0);
}

vec2 c_mod(vec2 a) {
  return vec2(length(a), 0);
}

vec2 c_plus(vec2 a, vec2 b) {
  return a + b;
}

vec2 c_minus(vec2 a, vec2 b) {
  return a - b;
}

vec2 c_mul(vec2 a, vec2 b) {
  return vec2(a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]);
}

vec2 c_div(vec2 a, vec2 b) {
  float denom = b[0] * b[0] + b[1] * b[1];
  return vec2(a[0] * b[0] + a[1] * b[1], a[1] * b[0] - a[0] * b[1]) / denom;
}

vec2 c_sqrt(vec2 a) {
  float r = length(a);
  float im = sqrt((r - a[0]) * 0.5);
  return vec2(sqrt(0.5 * (r + a[0])),
    (a[1] >= 0.0) ? im : -im);
}

vec2 c_cube(vec2 a) {
  return vec2(a[0] * a[0] * a[0] - 3.0 * a[0] * a[1] * a[1],
    3.0 * a[0] * a[0] * a[1] - a[1] * a[1] * a[1]);
}

vec2 c_exp(vec2 a) {
  return vec2(cos(a[1]), sin(a[1])) * exp(a[0]);
}

vec2 c_log(vec2 a) {
  return vec2(log(length(a)), atan(a[1], a[0]));
}

vec2 c_pow(vec2 a, vec2 b) {
  float _arg = b[0] * atan(a[1], a[0]);
  float _magn = pow(length(a), b[0]);

  return vec2(cos(_arg), sin(_arg)) * _magn;
}

vec2 c_sinh(vec2 a) {
  float _e = exp(a[0]);
  float _invE = 1.0/_e;
  return vec2((_e - _invE) * cos(a[1]) * 0.5,
    (_e + _invE) * sin(a[1]) * 0.5);
}

vec2 c_cosh(vec2 a) {
  float _e = exp(a[0]);
  float _invE = 1.0/_e;
  return vec2((_e + _invE) * cos(a[1]) * 0.5,
    (_e - _invE) * sin(a[1]) * 0.5);
}

vec2 c_tanh(vec2 a) {
  float _e = exp(2.0 * a[0]);
  float _invE = 1.0/_e;
  float denom = (_e + _invE) * 0.5 + cos(2.0 * a[1]);
  return vec2((_e - _invE) * 0.5, sin(2.0 * a[1])) / denom;
}

float _r_acosh(float x) {
  return log(x) + log(1.0 + sqrt(1.0 - 1.0 / (x * x)));
}

vec2 c_asinh(vec2 a) {
  float s, t;
  s = length(vec2(a[0], 1.0 + a[1]));
  t = length(vec2(a[0], 1.0 - a[1]));

  float re = _r_acosh((s + t) * 0.5);
  return vec2( (a[0] >= 0.0) ? re : -re, asin(2.0 * a[1]/(s + t)) );
}

vec2 c_acosh(vec2 a) {
  float p, q;
  p = length(vec2(1.0 + a[0], a[1]));
  q = length(vec2(1.0 - a[0], a[1]));

  float im = acos(2.0 * a[0]/(p + q));
  return vec2(_r_acosh((p + q) * 0.5), (a[1] >= 0.0) ? im : -im);
}

vec2 c_atanh(vec2 a) {
  float p, q;
  p = (1.0 + a[0]) * (1.0 + a[0]) + a[1] * a[1];
  q = (1.0 - a[0]) * (1.0 - a[0]) + a[1] * a[1];

  return vec2( 0.25 * ( log(p) - log(q) ),
    0.5 * atan(2.0 * a[1], 1.0 - a[0] * a[0] - a[1] * a[1]) );
}

vec2 transform(vec2 z) {
  return CODE;
}

#ifdef SMOOTHING
float diffThreshold = 0.1;

float smoothIfOutlier(vec2 pt) {
  float val = texture2D(u_texture, pt).a;
  if (val < 0.999) {
    return val;
  }

  float sum = 0.0, nVal = 0.0;
  int nDiff = 0;
  vec2 neighborPos;

  neighborPos = pt + vec2(-1.0, -1.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(-1.0, 0.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(-1.0, 1.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(0.0, -1.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(0.0, 1.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(1.0, -1.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(1.0, 0.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  neighborPos = pt + vec2(1.0, 1.0) * u_pixelSize;
  nVal = texture2D(u_texture, neighborPos).a;
  sum += nVal;
  if (abs(nVal - val) > diffThreshold) nDiff++;

  return (nDiff > 4) ? (sum * 0.125) : val;
}
#endif

void main() {
  if (u_phase == 0) {
    vec2 z = v_coordinates;
    bool isSet = false;

    for (int i = 1; i <= MAX_ITERATIONS; i++) {
      if (!isSet) z = transform(z);

      if ((length(z) > u_distance) && !isSet) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, float(i) / float(MAX_ITERATIONS));
        isSet = true;
      }
    }

    if (!isSet) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  } else {
#ifdef SMOOTHING
    float k = smoothIfOutlier(v_position);
#else
    float k = texture2D(u_texture, v_position).a;
#endif
    //k = pow(k, 0.5);
    k *= 255.0 * INV_PALETTE_WIDTH;
    gl_FragColor = texture2D(u_palette, vec2(k + 0.5 * INV_PALETTE_WIDTH, 0.5));
  }
}
