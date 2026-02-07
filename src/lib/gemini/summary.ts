import { z } from "zod";
import { getProModel, callGeminiWithRetry, parseGeminiResponse } from "./client";
import { buildConsolidatedSummaryPrompt } from "./prompts";

// Schema de validação (ajustado ao formato do prompt existente)
export const summarySchema = z.object({
    observacoes_iniciais: z.string(),
    evolucao_emocional_comportamental: z.string(),
    pontos_chave: z.array(z.string()),
    principais_intervencoes: z.array(
        z.object({
            intervencao: z.string(),
            resultado: z.string(),
        })
    ),
    citacoes_relevantes: z.array(z.string()),
});

export type ConsolidatedSummary = z.infer<typeof summarySchema>;

export interface SummaryContext {
    patientName: string;
    totalSessions: number;
    firstSessionDate: string;
    lastSessionDate: string;
    sessionsHistory: string;
}

/**
 * Gera Resumo Consolidado do histórico do paciente
 * Usa Gemini Pro para análise aprofundada
 */
export async function generateConsolidatedSummary(
    context: SummaryContext
): Promise<ConsolidatedSummary> {
    const model = getProModel({
        temperature: 0.3,
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
    });

    const prompt = buildConsolidatedSummaryPrompt(context);

    const result = await callGeminiWithRetry(async () => {
        return await model.generateContent(prompt);
    });

    const raw = parseGeminiResponse<unknown>(result.response.text());
    const validated = summarySchema.parse(raw);

    return validated;
}
