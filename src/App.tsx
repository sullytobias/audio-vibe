import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";

import MorphingBubble from "./components/loader";
import FluidSphere from "./components/fluidSphere";

import { useThemeStore } from "./utils/useThemeStore";

import "./App.scss";

export default function App() {
    const [loading, setLoading] = useState(true);

    const { darkMode, toggleTheme } = useThemeStore();

    useEffect(() => {
        setTimeout(() => setLoading(false), 5000);
    }, []);

    const { amplitude, frequency, speed, color, multiplier } = useControls({
        amplitude: { value: 2, min: 0, max: 20, step: 0.1 },
        frequency: { value: 10, min: 1, max: 50, step: 0.1 },
        speed: { value: 2, min: 0, max: 10, step: 0.1 },
        multiplier: { value: 1, min: 1, max: 10, step: 0.1 },
        color: { value: "#ff7f50" },
    });

    return (
        <div className={(darkMode ? "dark" : "light") + " app"}>
            <Leva />

            <button className="theme-toggle" onClick={toggleTheme}>
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={darkMode ? 0.2 : 0.5} />
                <pointLight
                    position={[10, 10, 10]}
                    intensity={darkMode ? 0.3 : 0.7}
                />
                {loading && <MorphingBubble />}
                <FluidSphere
                    amplitude={amplitude}
                    frequency={frequency}
                    speed={speed}
                    color={color}
                    multiplier={multiplier}
                    visible={!loading}
                />
            </Canvas>
        </div>
    );
}
