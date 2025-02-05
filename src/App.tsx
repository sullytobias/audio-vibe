import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial, Color } from "three";
import { Leva, useControls } from "leva";
import { Analyser, context, UserMedia } from "tone";
import { initShaders } from "./utils/initShaders";
import "./App.scss";

// Custom Shader Material for the glowing energy ring
const LoaderShaderMaterial = new ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
            float dist = length(vUv - 0.5) * 2.0;
            float ring = smoothstep(0.45, 0.5, dist) - smoothstep(0.5, 0.55, dist);
            
            float glow = sin(uTime * 3.0) * 0.3 + 0.7;
            vec3 color = mix(vec3(0.1, 0.2, 1.0), vec3(0.0, 1.0, 1.0), glow);
            
            gl_FragColor = vec4(color * ring, ring);
        }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
});

function EnergyRing() {
    const mesh = useRef<Mesh>(null);

    useFrame(({ clock }) => {
        if (mesh.current) {
            mesh.current.rotation.x = Math.PI / 2;
            mesh.current.rotation.z = clock.getElapsedTime() * 1.5;
            (LoaderShaderMaterial.uniforms.uTime as { value: number }).value =
                clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={mesh}>
            <torusGeometry args={[1, 0.15, 64, 128]} />
            <primitive object={LoaderShaderMaterial} attach="material" />
        </mesh>
    );
}

function FluidSphere() {
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
        <mesh ref={mesh}>
            <sphereGeometry args={[2, 64, 64]} />
            <primitive object={shadersMat} attach="material" />
        </mesh>
    );
}

export default function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000);
    }, []);

    return (
        <>
            <Leva />
            {loading && <div className="loading-screen">Loading...</div>}
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                {loading && <EnergyRing />}
                {!loading && <FluidSphere />}
            </Canvas>
        </>
    );
}
