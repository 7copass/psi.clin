import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEvolution } from "@/lib/gemini/evolution";
import { SESSION_TYPES } from "@/lib/utils/constants";
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
        const { sessionId, currentNotes } = body as { sessionId: string; currentNotes?: string };

        if (!sessionId) {
            return NextResponse.json(
                { error: "ID da sessão não informado" },
                { status: 400 }
            );
        }

        // Buscar sessão com dados do paciente e profissional
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .select("*, patients(full_name)")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: "Sessão não encontrada" },
                { status: 404 }
            );
        }

        // Buscar dados do profissional
        const { data: professional } = await supabase
            .from("professionals")
            .select("full_name, crp")
            .eq("id", user.id)
            .single();

        const sessionData = session as {
            session_date: string;
            session_type: string;
            notes?: string;
            transcription?: string;
            smartnotes?: Record<string, unknown>;
            patients: { full_name: string };
        };

        const sessionType =
            SESSION_TYPES[sessionData.session_type as keyof typeof SESSION_TYPES]?.label ||
            sessionData.session_type;

        const professionalData = professional as { full_name: string; crp: string } | null;

        // Gerar evolução
        const evolution = await generateEvolution({
            patientName: sessionData.patients?.full_name || "Paciente",
            professionalName: professionalData?.full_name || "Profissional",
            crp: professionalData?.crp || "",
            sessionDate: sessionData.session_date,
            sessionType,
            notes: currentNotes ?? sessionData.notes,
            transcription: sessionData.transcription,
            smartnotes: sessionData.smartnotes
                ? JSON.stringify(sessionData.smartnotes)
                : undefined,
        });

        // Formatar evolução como HTML com formatação rica
        const sections = [
            { title: "Intervenção Realizada", content: evolution.intervencao_realizada },
            { title: "Avaliação de Demanda", content: evolution.avaliacao_demanda },
            { title: "Registro de Objetivos", content: evolution.registro_objetivos },
            { title: "Anotações de Antes da Sessão", content: evolution.anotacoes_antes_sessao },
            { title: "Evolução", content: evolution.evolucao },
            { title: "Observação", content: evolution.observacao },
            { title: "Dever de Casa", content: evolution.dever_de_casa },
            { title: "Encaminhamento", content: evolution.encaminhamento },
        ];

        const sectionsHtml = sections
            .filter(s => s.content && s.content.trim())
            .map(s => {
                const paragraphs = s.content
                    .split("\n")
                    .filter(p => p.trim())
                    .map(p => `<p style="margin-bottom: 24px; line-height: 1.8;">${p.trim()}</p>`)
                    .join("");
                return `<h2 style="margin-top: 32px; margin-bottom: 16px;">${s.title}</h2>\n${paragraphs}`;
            })
            .join("\n");

        const evolutionHtml = `<h1>Ficha de Evolução</h1>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
  <tr>
    <td style="padding: 4px 0; font-weight: bold; width: 140px; vertical-align: top;">Paciente:</td>
    <td style="padding: 4px 0;">${sessionData.patients?.full_name || "—"}</td>
  </tr>
  <tr>
    <td style="padding: 4px 0; font-weight: bold; vertical-align: top;">Profissional:</td>
    <td style="padding: 4px 0;">${professionalData?.full_name || "—"} ${professionalData?.crp ? `- CRP: ${professionalData.crp}` : ""}</td>
  </tr>
  <tr>
    <td style="padding: 4px 0; font-weight: bold; vertical-align: top;">Data da Sessão:</td>
    <td style="padding: 4px 0;">${formatDate(sessionData.session_date)}</td>
  </tr>
  <tr>
    <td style="padding: 4px 0; font-weight: bold; vertical-align: top;">Consulta realizada:</td>
    <td style="padding: 4px 0;">${sessionType}</td>
  </tr>
</table>

${sectionsHtml}`.trim();

        // Salvar no banco
        const { error: updateError } = await supabase
            .from("sessions")
            .update({
                evolution: evolutionHtml,
                evolution_generated_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", sessionId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            evolution: evolutionHtml,
        });
    } catch (error) {
        console.error("Evolution error:", error);
        return NextResponse.json(
            { error: "Erro ao gerar ficha de evolução" },
            { status: 500 }
        );
    }
}
