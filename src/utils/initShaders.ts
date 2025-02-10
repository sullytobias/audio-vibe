import { ShaderMaterial, Color } from "three";

async function loadShader(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Failed to load shader: ${url}`);

    return await response.text();
}

export async function initShaders(
    vertexShaderPath: string,
    fragmentShaderPath: string
): Promise<ShaderMaterial> {
    const vertexShader = await loadShader(vertexShaderPath);
    const fragmentShader = await loadShader(fragmentShaderPath);

    const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: 0 },
            uFrequency: { value: 0 },
            uSpeed: { value: 0 },
            uColor: { value: new Color(0xff7f50) },
        },
    });

    return material;
}
