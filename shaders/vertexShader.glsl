uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

varying vec3 vNormal;

float random(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    float a = random(i);
    float b = random(i + vec3(1.0, 0.0, 0.0));
    float c = random(i + vec3(0.0, 1.0, 0.0));
    float d = random(i + vec3(1.0, 1.0, 0.0));

    vec2 u = f.xy * f.xy * (3.0 - 2.0 * f.xy);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vNormal = normal;

    float n = noise(position * uFrequency + vec3(uTime * uSpeed));
    float deformation = (n - 0.5) * uAmplitude;

    vec3 newPosition = position + normal * deformation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}