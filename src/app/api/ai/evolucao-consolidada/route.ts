import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateConsolidatedSummary } from "@/lib/gemini/summary";
import { formatDate } from "@/lib/utils/format";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Nao autenticado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { patientId, sessionIds } = body as {
            patientId: string;
            sessionIds: string[];
        };

        if (!patientId || !sessionIds?.length) {
            return NextResponse.json(
                { error: "Dados insuficientes" },
                { status: 400 }
            );
        }

        // Buscar paciente
        const { data: patient, error: patientError } = await supabase
            .from("patients")
            .select("full_name")
            .eq("id", patientId)
            .single();

        if (patientError || !patient) {
            return NextResponse.json(
                { error: "Paciente nao encontrado" },
                { status: 404 }
            );
        }

        const patientData = patient as { full_name: string };

        // Buscar sessoes selecionadas
        const { data: sessions, error: sessionsError } = await supabase
            .from("sessions")
            .select("id, session_date, notes, evolution, smartnotes")
            .in("id", sessionIds)
            .order("session_date", { ascending: true });

        if (sessionsError || !sessions?.length) {
            return NextResponse.json(
                { error: "Sessoes nao encontradas" },
                { status: 404 }
            );
        }

        const sessionsList = sessions as Array<{
            id: string;
            session_date: string;
            notes?: string;
            evolution?: string;
            smartnotes?: {
                mapa_topicos?: string[];
                topicos?: Array<{ titulo: string; resumo: string }>;
            };
        }>;

        // Construir historico de sessoes
        const sessionsHistory = sessionsList
            .map((s, i) => {
                let summary = `--- Sessao ${i + 1} (${formatDate(s.session_date)}) ---\n`;

                if (s.smartnotes?.topicos) {
                    s.smartnotes.topicos.forEach((t) => {
                        summary += `- ${t.titulo}: ${t.resumo}\n`;
                    });
                } else if (s.notes) {
                    summary += s.notes.slice(0, 500) + "\n";
                } else if (s.evolution) {
                    summary += s.evolution.slice(0, 500) + "\n";
                } else {
                    summary += "Sem anotacoes disponiveis\n";
                }

                return summary;
            })
            .join("\n");

        // Gerar consolidacao
        const summary = await generateConsolidatedSummary({
            patientName: patientData.full_name,
            totalSessions: sessionsList.length,
            firstSessionDate: formatDate(sessionsList[0].session_date),
            lastSessionDate: formatDate(
                sessionsList[sessionsList.length - 1].session_date
            ),
            sessionsHistory,
        });

        return NextResponse.json({
            success: true,
            summary,
            sessionsCount: sessionsList.length,
            periodoInicio: sessionsList[0].session_date,
            periodoFim: sessionsList[sessionsList.length - 1].session_date,
        });
    } catch (error) {
        console.error("Evolucao consolidada error:", error);
        return NextResponse.json(
            { error: "Erro ao gerar evolucao consolidada" },
            { status: 500 }
        );
    }
}
