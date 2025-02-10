import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

import { animated, useSpring } from "@react-spring/three";

import { Mesh, ShaderMaterial, Color } from "three";

import { useWindowSize } from "../utils/useWindowSize";
import { Analyser, getContext, UserMedia } from "tone";
import { initShaders } from "../utils/initShaders";

function FluidSphere({
    visible,
    amplitude,
    speed,
    multiplier,
    color,
    frequency,
}: {
    visible: boolean;
    amplitude: number;
    speed: number;
    multiplier: number;
    color: string;
    frequency: number;
}) {
    const mesh = useRef<Mesh>(null);
    const analyserRef = useRef<Analyser | null>(null);
    const [audioStarted, setAudioStarted] = useState(false);
    const [shadersMat, setShadersMat] = useState<ShaderMaterial | null>(null);

    const { width } = useWindowSize();
    const sphereSize = width < 768 ? 1.5 : 2.5;

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
                    const audioContext = getContext();

                    if (audioContext.state !== "running") {
                        await audioContext.resume();
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
            <sphereGeometry args={[sphereSize, 64, 64]} />
            <primitive object={shadersMat} attach="material" />
        </animated.mesh>
    );
}

export default FluidSphere;
