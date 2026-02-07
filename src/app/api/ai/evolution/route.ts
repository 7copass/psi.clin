import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEvolution } from "@/lib/gemini/evolution";
import { SESSION_TYPES } from "@/lib/utils/constants";

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
        const { sessionId } = body as { sessionId: string };

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
            notes: sessionData.notes,
            transcription: sessionData.transcription,
            smartnotes: sessionData.smartnotes
                ? JSON.stringify(sessionData.smartnotes)
                : undefined,
        });

        // Formatar evolução como HTML
        const evolutionHtml = `
<h2>Ficha de Evolução</h2>

<h3>Intervenção Realizada</h3>
<p>${evolution.intervencao_realizada}</p>

<h3>Avaliação de Demanda</h3>
<p>${evolution.avaliacao_demanda}</p>

<h3>Registro de Objetivos</h3>
<p>${evolution.registro_objetivos}</p>

<h3>Anotações de Antes da Sessão</h3>
<p>${evolution.anotacoes_antes_sessao}</p>

<h3>Evolução</h3>
<p>${evolution.evolucao}</p>

<h3>Observação</h3>
<p>${evolution.observacao}</p>

<h3>Dever de Casa</h3>
<p>${evolution.dever_de_casa}</p>

<h3>Encaminhamento</h3>
<p>${evolution.encaminhamento}</p>
    `.trim();

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
