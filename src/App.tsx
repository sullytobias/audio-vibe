import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";

const vertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  flat out vec3 vNormal;

  void main() {
    vNormal = normal;

    float deformation = sin(position.x * 14.0 + uTime * 4.0) * uAmplitude;
    vec3 newPosition = position + normal * deformation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  flat in vec3 vNormal;

  void main() {
    vec3 color = vec3(0.5 + 0.5 * vNormal.x, 0.5 + 0.5 * vNormal.y, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function FluidSphere() {
    const mesh = useRef<THREE.Mesh>(null);
    const analyserRef = useRef<Tone.Analyser | null>(null);
    const [audioStarted, setAudioStarted] = useState(false);
    const uniforms = useRef({
        uTime: { value: 0 },
        uAmplitude: { value: 0 },
    });

    useEffect(() => {
        const initAudio = async () => {
            try {
                const mic = new Tone.UserMedia();
                const analyser = new Tone.Analyser("waveform", 256);

                await mic.open();

                mic.connect(analyser);
                analyserRef.current = analyser;

                document.addEventListener("click", async () => {
                    if (Tone.context.state !== "running") {
                        await Tone.context.resume();
                        setAudioStarted(true);
                    }
                });
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        };

        initAudio();
    }, []);

    useFrame(({ clock }) => {
        if (!mesh.current || !analyserRef.current || !audioStarted) return;

        const rawData = analyserRef.current.getValue() as Float32Array;
        const averageAmplitude =
            rawData.reduce((sum, value) => sum + Math.abs(value), 0) /
            rawData.length;

        uniforms.current.uTime.value = clock.getElapsedTime();
        uniforms.current.uAmplitude.value = averageAmplitude * 6;
    });

    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[2, 64, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms.current}
            />
        </mesh>
    );
}

export default function App() {
    return (
        <Canvas camera={{ position: [0, 0, 10] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            <FluidSphere />
        </Canvas>
    );
}