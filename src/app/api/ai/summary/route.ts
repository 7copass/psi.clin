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
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { patientId } = body as { patientId: string };

        if (!patientId) {
            return NextResponse.json(
                { error: "ID do paciente não informado" },
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
                { error: "Paciente não encontrado" },
                { status: 404 }
            );
        }

        const patientData = patient as { full_name: string };

        // Buscar todas as sessões do paciente
        const { data: sessions, error: sessionsError } = await supabase
            .from("sessions")
            .select("session_date, notes, evolution, smartnotes")
            .eq("patient_id", patientId)
            .order("session_date", { ascending: true });

        if (sessionsError) {
            return NextResponse.json(
                { error: "Erro ao buscar sessões" },
                { status: 500 }
            );
        }

        const sessionsList = sessions as Array<{
            session_date: string;
            notes?: string;
            evolution?: string;
            smartnotes?: { mapa_topicos?: string[]; topicos?: Array<{ titulo: string; resumo: string }> };
        }>;

        if (sessionsList.length < 2) {
            return NextResponse.json(
                { error: "São necessárias pelo menos 2 sessões para gerar o resumo" },
                { status: 400 }
            );
        }

        // Construir histórico de sessões
        const sessionsHistory = sessionsList
            .map((s, i) => {
                let summary = `--- Sessão ${i + 1} (${formatDate(s.session_date)}) ---\n`;

                if (s.smartnotes?.topicos) {
                    s.smartnotes.topicos.forEach((t) => {
                        summary += `- ${t.titulo}: ${t.resumo}\n`;
                    });
                } else if (s.notes) {
                    summary += s.notes.slice(0, 500) + "\n";
                } else if (s.evolution) {
                    summary += s.evolution.slice(0, 500) + "\n";
                } else {
                    summary += "Sem anotações disponíveis\n";
                }

                return summary;
            })
            .join("\n");

        // Gerar resumo consolidado
        const summary = await generateConsolidatedSummary({
            patientName: patientData.full_name,
            totalSessions: sessionsList.length,
            firstSessionDate: formatDate(sessionsList[0].session_date),
            lastSessionDate: formatDate(sessionsList[sessionsList.length - 1].session_date),
            sessionsHistory,
        });

        return NextResponse.json({
            success: true,
            summary,
            sessionsCount: sessionsList.length,
        });
    } catch (error) {
        console.error("Summary error:", error);
        return NextResponse.json(
            { error: "Erro ao gerar resumo consolidado" },
            { status: 500 }
        );
    }
}
