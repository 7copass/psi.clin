import { getFlashModel, callGeminiWithRetry } from "./client";
import { TRANSCRIPTION_PROMPT } from "./prompts";

/**
 * Transcreve áudio usando Gemini Flash
 *
 * @param audioBuffer - Buffer do arquivo de áudio
 * @param mimeType - Tipo MIME do áudio (audio/webm, audio/mp3, audio/wav, etc)
 * @returns Transcrição em texto
 */
export async function transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string
): Promise<string> {
    const model = getFlashModel({ temperature: 0.1 });

    const result = await callGeminiWithRetry(async () => {
        return await model.generateContent([
            {
                inlineData: {
                    mimeType,
                    data: audioBuffer.toString("base64"),
                },
            },
            TRANSCRIPTION_PROMPT,
        ]);
    });

    return result.response.text();
}
