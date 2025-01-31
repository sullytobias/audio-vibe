uniform float uTime;
uniform float uAmplitude;
flat out vec3 vNormal;

void main() {
  vNormal = normal;

  float deformation = sin(position.x * 14.0 + uTime * 4.0) * uAmplitude;
  vec3 newPosition = position + normal * deformation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}