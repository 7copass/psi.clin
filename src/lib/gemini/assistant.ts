import { getProModel } from "./client";

const ASSISTANT_SYSTEM_INSTRUCTION = `Você é um assistente clínico especializado em psicologia, projetado para apoiar psicólogos em sua prática profissional.

REGRAS FUNDAMENTAIS:
1. Nunca faça diagnósticos - você não é um profissional de saúde mental
2. Ofereça sugestões baseadas em evidências e literatura científica
3. Sempre reforce que a decisão final é do profissional
4. Seja empático, profissional e ético
5. Não invente informações sobre o paciente
6. Baseie suas respostas no contexto fornecido
7. Sugira técnicas e intervenções quando apropriado
8. Indique quando não há informações suficientes

VOCÊ PODE AJUDAR COM:
- Sugestões de intervenções terapêuticas
- Discussão de casos (sem diagnosticar)
- Explicações sobre técnicas (TCC, ACT, DBT, etc.)
- Reflexões sobre a evolução do paciente
- Sugestões de materiais e exercícios
- Elaboração de hipóteses clínicas (para consideração do profissional)

FORMATO DAS RESPOSTAS:
- Seja claro e objetivo
- Use bullet points quando apropriado
- Cite técnicas específicas com suas indicações
- Sempre termine com uma pergunta reflexiva ou próximo passo sugerido`;

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface PatientContext {
    name: string;
    age?: number;
    sessionsCount?: number;
    lastSessionDate?: string;
    recentNotes?: string;
    mainTopics?: string[];
}

/**
 * Cria chat com contexto do paciente
 */
export function createAssistantChat(
    patientContext?: PatientContext,
    history?: { role: "user" | "model"; parts: { text: string }[] }[]
) {
    let contextMessage = "";

    if (patientContext) {
        contextMessage = `
CONTEXTO DO PACIENTE:
- Nome: ${patientContext.name}
${patientContext.age ? `- Idade: ${patientContext.age} anos` : ""}
${patientContext.sessionsCount ? `- Número de sessões: ${patientContext.sessionsCount}` : ""}
${patientContext.lastSessionDate ? `- Última sessão: ${patientContext.lastSessionDate}` : ""}
${patientContext.recentNotes ? `- Anotações recentes: ${patientContext.recentNotes}` : ""}
${patientContext.mainTopics?.length ? `- Tópicos principais: ${patientContext.mainTopics.join(", ")}` : ""}

Lembre-se: use este contexto para personalizar suas respostas, mas não invente informações não presentes.
`;
    }

    const model = getProModel({
        temperature: 0.6,
        maxOutputTokens: 8192,
        systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION + contextMessage,
    });

    return model.startChat({
        history: history || [],
    });
}

/**
 * Envia mensagem e recebe resposta em streaming
 */
export async function* sendMessageStream(
    chat: ReturnType<typeof createAssistantChat>,
    message: string
): AsyncGenerator<string> {
    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
            yield text;
        }
    }
}

/**
 * Envia mensagem e recebe resposta completa
 */
export async function sendMessage(
    chat: ReturnType<typeof createAssistantChat>,
    message: string
): Promise<string> {
    const result = await chat.sendMessage(message);
    return result.response.text();
}
