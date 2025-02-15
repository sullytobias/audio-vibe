varying vec3 vNormal;

uniform vec3 uColor;

void main() {
    vec3 color = uColor * (0.5 + 0.5 * vNormal.x); // Use uColor for shading
    gl_FragColor = vec4(color, 1.0);
}