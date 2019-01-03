attribute vec2 a_position;

varying vec2 v_position;
varying vec2 v_coordinates;

uniform vec4 u_coordOffsetScale;

void main() {
  // Map [-1, 1] -> [0, 1]
  v_position = (a_position + 1.0) * 0.5;
  v_coordinates = u_coordOffsetScale.xy + u_coordOffsetScale.zw * v_position;

  gl_Position = vec4(a_position, 0, 1);
}
