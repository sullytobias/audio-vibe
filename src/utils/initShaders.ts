import { ShaderMaterial } from "three";

async function loadShader(url: any) {
    const response = await fetch(url);
    return await response.text();
}

export async function initShaders(
    vertexShaderPath: string,
    fragmentShaderPath: string
) {
    const vertexShader = await loadShader(vertexShaderPath);
    const fragmentShader = await loadShader(fragmentShaderPath);

    // Now you can use the shaders in your Three.js material
    const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: 0 },
        },
    });

    return material;
}
