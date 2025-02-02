uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

varying vec3 vNormal;

void main() {
    vNormal = normal;

    float deformation = sin(position.x * uFrequency + uTime * uSpeed) * uAmplitude;
    vec3 newPosition = position + normal * deformation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}