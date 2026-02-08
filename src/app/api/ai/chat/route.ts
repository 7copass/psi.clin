import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAssistantChat, type PatientContext } from "@/lib/gemini/assistant";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const body = await request.json();
    const { message, patientId, history } = body as {
        message: string;
        patientId?: string;
        history?: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
    };

    if (!message) {
        return new Response(JSON.stringify({ error: "Mensagem não informada" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Buscar contexto do paciente se informado
    let patientContext: PatientContext | undefined;

    if (patientId) {
        const { data: patient } = await supabase
            .from("patients")
            .select("full_name, birth_date, notes")
            .eq("id", patientId)
            .single();

        if (patient) {
            const patientData = patient as {
                full_name: string;
                birth_date?: string;
                notes?: string;
            };

            // Calcular idade
            let age: number | undefined;
            if (patientData.birth_date) {
                const birthDate = new Date(patientData.birth_date);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
            }

            // Buscar sessões recentes
            const { data: sessions } = await supabase
                .from("sessions")
                .select("session_date, notes, smartnotes")
                .eq("patient_id", patientId)
                .order("session_date", { ascending: false })
                .limit(3);

            const sessionsList = sessions as Array<{
                session_date: string;
                notes?: string;
                smartnotes?: { mapa_topicos?: string[] };
            }> || [];

            // Extrair tópicos principais
            const mainTopics: string[] = [];
            sessionsList.forEach((s) => {
                if (s.smartnotes?.mapa_topicos) {
                    mainTopics.push(...s.smartnotes.mapa_topicos);
                }
            });

            patientContext = {
                name: patientData.full_name,
                age,
                sessionsCount: sessionsList.length,
                lastSessionDate: sessionsList[0]?.session_date,
                recentNotes: sessionsList
                    .map(s => `[${new Date(s.session_date).toLocaleDateString('pt-BR')}] ${s.notes || "Sem anotações"}`)
                    .join("\n\n"),
                mainTopics: [...new Set(mainTopics)].slice(0, 10), // Aumentei para 10 tópicos já que temos mais contexto
            };
        }
    }

    try {
        // Criar chat com contexto e histórico
        const chat = createAssistantChat(patientContext, history);

        // Streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const result = await chat.sendMessageStream(message);

                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (error: any) {
                    console.error("Chat stream error:", error);

                    // Tratamento amigável de erro de cota
                    if (error.message?.includes("429") || error.status === 429) {
                        const msg = "\n\n⚠️ **Limite de uso atingido.**\nO sistema de IA está sobrecarregado no momento (Muitas requisições). Por favor, aguarde alguns instantes e tente novamente.";
                        controller.enqueue(encoder.encode(msg));
                    } else {
                        const msg = "\n\n❌ **Erro ao processar resposta.**\nTente novamente mais tarde.";
                        controller.enqueue(encoder.encode(msg));
                    }

                    // Não fechar com erro para o cliente poder ler a mensagem acima
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Chat error:", error);
        return new Response(JSON.stringify({ error: "Erro ao processar mensagem" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
