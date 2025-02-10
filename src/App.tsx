import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";

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
                <FluidSphere visible={!loading} />
            </Canvas>
        </div>
    );
}
