import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import { Mesh, ShaderMaterial, Color } from "three";
import { Leva, useControls } from "leva";
import { Analyser, context, UserMedia } from "tone";
import { initShaders } from "./utils/initShaders";
import MorphingBubble from "./components/loader";

function FluidSphere({ visible }: { visible: boolean }) {
    const mesh = useRef<Mesh>(null);
    const analyserRef = useRef<Analyser | null>(null);
    const [audioStarted, setAudioStarted] = useState(false);
    const [shadersMat, setShadersMat] = useState<ShaderMaterial | null>(null);

    const { amplitude, frequency, speed, color, multiplier } = useControls({
        amplitude: { value: 0, min: 0, max: 20, step: 0.1 },
        frequency: { value: 0, min: 1, max: 50, step: 0.1 },
        speed: { value: 0, min: 0, max: 10, step: 0.1 },
        multiplier: { value: 1, min: 1, max: 10, step: 0.1 },
        color: { value: "#ff7f50" },
    });

    const { scale } = useSpring({
        scale: visible ? 1 : 0,
        config: { mass: 1, tension: 120, friction: 14 },
    });

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
        shadersMat.uniforms.uAmplitude.value =
            averageAmplitude * amplitude * multiplier;
        shadersMat.uniforms.uFrequency.value = frequency;
        shadersMat.uniforms.uSpeed.value = speed;
        shadersMat.uniforms.uColor.value = new Color(color);
    });

    if (!shadersMat) return null;

    return (
        <animated.mesh ref={mesh} scale={scale}>
            <sphereGeometry args={[2, 64, 64]} />
            <primitive object={shadersMat} attach="material" />
        </animated.mesh>
    );
}

export default function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 5000);
    }, []);

    return (
        <>
            <Leva />
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                {loading && <MorphingBubble />}
                <FluidSphere visible={!loading} />
            </Canvas>
        </>
    );
}
