flat in vec3 vNormal;

void main() {
  vec3 color = vec3(0.5 + 0.5 * vNormal.x, 0.5 + 0.5 * vNormal.y, 1.0);
  gl_FragColor = vec4(color, 1.0);
}