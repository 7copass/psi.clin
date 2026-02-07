import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getFlashModel(config?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: "application/json" | "text/plain";
}) {
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: config?.responseMimeType ?? "text/plain",
            temperature: config?.temperature ?? 0.3,
            maxOutputTokens: config?.maxOutputTokens ?? 4096,
        },
    });
}

export function getProModel(config?: {
    temperature?: number;
    maxOutputTokens?: number;
    systemInstruction?: string;
    responseMimeType?: "application/json" | "text/plain";
}) {
    return genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: {
            responseMimeType: config?.responseMimeType ?? "text/plain",
            temperature: config?.temperature ?? 0.5,
            maxOutputTokens: config?.maxOutputTokens ?? 8192,
        },
        systemInstruction: config?.systemInstruction,
    });
}

/**
 * Safe JSON parse with type assertion
 */
export function parseGeminiResponse<T>(text: string): T {
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error("Resposta da IA em formato inválido");
    }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function callGeminiWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, i) * 1000)
            );
        }
    }
    throw new Error("Max retries exceeded");
}
