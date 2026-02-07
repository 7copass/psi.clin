import { z } from "zod";
import { getFlashModel, callGeminiWithRetry, parseGeminiResponse } from "./client";
import { buildEvolutionPrompt } from "./prompts";

// Schema de validação
export const evolutionSchema = z.object({
    intervencao_realizada: z.string(),
    avaliacao_demanda: z.string(),
    registro_objetivos: z.string(),
    anotacoes_antes_sessao: z.string(),
    evolucao: z.string(),
    observacao: z.string(),
    dever_de_casa: z.string(),
    encaminhamento: z.string(),
});

export type Evolution = z.infer<typeof evolutionSchema>;

export interface EvolutionContext {
    patientName: string;
    professionalName: string;
    crp: string;
    sessionDate: string;
    sessionType: string;
    notes?: string;
    transcription?: string;
    smartnotes?: string;
}

/**
 * Gera Ficha de Evolução a partir do contexto da sessão
 */
export async function generateEvolution(
    context: EvolutionContext
): Promise<Evolution> {
    const model = getFlashModel({
        temperature: 0.2,
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
    });

    const prompt = buildEvolutionPrompt(context);

    const result = await callGeminiWithRetry(async () => {
        return await model.generateContent(prompt);
    });

    const raw = parseGeminiResponse<unknown>(result.response.text());
    const validated = evolutionSchema.parse(raw);

    return validated;
}
