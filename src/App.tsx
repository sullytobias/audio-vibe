import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial } from "three";
import { Analyser, context, UserMedia } from "tone";
import { initShaders } from "./utils/initShaders";

function FluidSphere() {
    const mesh = useRef<Mesh>(null);
    const analyserRef = useRef<Analyser | null>(null);
    const [audioStarted, setAudioStarted] = useState(false);
    const [shadersMat, setShadersMat] = useState<ShaderMaterial | null>(null);

    useEffect(() => {
        const loadShaders = async () => {
            try {
                const material = await initShaders(
                    "shaders/vertexShader.glsl",
                    "shaders/fragmentShader.glsl"
                );
                setShadersMat(material);
            } catch (error) {
                console.error("Failed to load shaders:", error);
            }
        };

        loadShaders();
    }, []);

    useEffect(() => {
        const initAudio = async () => {
            try {
                const mic = new UserMedia();
                const analyser = new Analyser("waveform", 256);
                await mic.open();
                mic.connect(analyser);
                analyserRef.current = analyser;

                document.addEventListener("click", async () => {
                    if (context.state !== "running") {
                        await context.resume();
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
        if (
            !mesh.current ||
            !analyserRef.current ||
            !audioStarted ||
            !shadersMat
        )
            return;

        const rawData = analyserRef.current.getValue() as Float32Array;
        const averageAmplitude =
            rawData.reduce((sum, value) => sum + Math.abs(value), 0) /
            rawData.length;

        shadersMat.uniforms.uTime.value = clock.getElapsedTime();
        shadersMat.uniforms.uAmplitude.value = averageAmplitude * 5;
    });

    if (!shadersMat) return null;

    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[2, 64, 64]} />
            <primitive object={shadersMat} attach="material" />
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
