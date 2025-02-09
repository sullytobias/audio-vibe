import { ShaderMaterial } from "three";

import { useFrame } from "@react-three/fiber";

const MorphingBubbleShaderMaterial = new ShaderMaterial({
    vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            vec3 pos = position;
            
            float noise = sin(pos.x * 4.0 + uTime * 2.0) * cos(pos.y * 4.0 + uTime * 2.0) * 0.1;
            pos += normal * noise;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
            float glow = 0.5 + 0.5 * sin(uTime * 3.0);
            vec3 color = mix(vec3(0.1, 0.5, 1.0), vec3(0.3, 1.0, 0.8), glow);
            
            float alpha = smoothstep(0.2, 1.0, glow);
            gl_FragColor = vec4(color, alpha);
        }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
});

const MorphingBubble = () => {
    useFrame(({ clock }) => {
        MorphingBubbleShaderMaterial.uniforms.uTime.value =
            clock.getElapsedTime();
    });

    return (
        <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <primitive
                object={MorphingBubbleShaderMaterial}
                attach="material"
            />
        </mesh>
    );
};

export default MorphingBubble;
