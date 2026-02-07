import { z } from "zod";
import { getFlashModel, callGeminiWithRetry, parseGeminiResponse } from "./client";
import { buildSmartNotesPrompt } from "./prompts";

// Schema de validação
export const smartNotesSchema = z.object({
    mapa_topicos: z.array(z.string()),
    topicos: z.array(
        z.object({
            titulo: z.string(),
            resumo: z.string(),
            citacoes: z.array(
                z.object({
                    texto: z.string(),
                    falante: z.string(),
                })
            ),
        })
    ),
});

export type SmartNotes = z.infer<typeof smartNotesSchema>;

export type SmartNotesSize = "curto" | "medio" | "longo";

/**
 * Gera SmartNotes a partir de uma transcrição
 *
 * @param transcription - Transcrição da sessão
 * @param size - Tamanho do resumo (curto, medio, longo)
 * @returns Objeto SmartNotes estruturado
 */
export async function generateSmartNotes(
    transcription: string,
    size: SmartNotesSize
): Promise<SmartNotes> {
    const model = getFlashModel({
        temperature: 0.3,
        responseMimeType: "application/json",
    });

    const prompt = buildSmartNotesPrompt(transcription, size);

    const result = await callGeminiWithRetry(async () => {
        return await model.generateContent(prompt);
    });

    const raw = parseGeminiResponse<unknown>(result.response.text());
    const validated = smartNotesSchema.parse(raw);

    return validated;
}
