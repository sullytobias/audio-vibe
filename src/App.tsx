import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";

function ParticleBall() {
    const mesh = useRef<THREE.Points>(null);
    const analyserRef = useRef<Tone.Analyser | null>(null);
    const [audioStarted, setAudioStarted] = useState(false);
    const particlesCount = 1000; // Number of particles
    const originalPositions = useRef<Float32Array>(
        new Float32Array(particlesCount * 3)
    );
    const deformedPositions = useRef<Float32Array>(
        new Float32Array(particlesCount * 3)
    );

    useEffect(() => {
        const radius = 2;
        for (let i = 0; i < particlesCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            originalPositions.current[i * 3] = x;
            originalPositions.current[i * 3 + 1] = y;
            originalPositions.current[i * 3 + 2] = z;

            deformedPositions.current[i * 3] = x;
            deformedPositions.current[i * 3 + 1] = y;
            deformedPositions.current[i * 3 + 2] = z;
        }
    }, []);

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

    useFrame(() => {
        if (!mesh.current || !analyserRef.current || !audioStarted) return;

        const rawData = analyserRef.current.getValue() as Float32Array;
        const averageAmplitude =
            rawData.reduce((sum, value) => sum + Math.abs(value), 0) /
            rawData.length;

        const deformationStrength = averageAmplitude * 10;
        for (let i = 0; i < particlesCount; i++) {
            const x = originalPositions.current[i * 3];
            const y = originalPositions.current[i * 3 + 1];
            const z = originalPositions.current[i * 3 + 2];

            if (deformationStrength > 0) {
                const direction = new THREE.Vector3(x, y, z).normalize();
                deformedPositions.current[i * 3] =
                    x + direction.x * deformationStrength;
                deformedPositions.current[i * 3 + 1] =
                    y + direction.y * deformationStrength;
                deformedPositions.current[i * 3 + 2] =
                    z + direction.z * deformationStrength;
            } else {
                deformedPositions.current[i * 3] +=
                    (originalPositions.current[i * 3] -
                        deformedPositions.current[i * 3]) *
                    0.1;
                deformedPositions.current[i * 3 + 1] +=
                    (originalPositions.current[i * 3 + 1] -
                        deformedPositions.current[i * 3 + 1]) *
                    0.1;
                deformedPositions.current[i * 3 + 2] +=
                    (originalPositions.current[i * 3 + 2] -
                        deformedPositions.current[i * 3 + 2]) *
                    0.1;
            }
        }

        const positions = mesh.current.geometry.attributes.position;
        positions.array = deformedPositions.current;
        positions.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={originalPositions.current}
                    count={particlesCount}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial attach="material" size={0.1} color="white" />
        </points>
    );
}

export default function App() {
    return (
        <Canvas camera={{ position: [0, 0, 10] }}>
            <ambientLight intensity={0.5} />
            <ParticleBall />
        </Canvas>
    );
}
