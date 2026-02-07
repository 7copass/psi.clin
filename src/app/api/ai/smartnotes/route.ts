import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSmartNotes, type SmartNotesSize } from "@/lib/gemini/smartnotes";

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
        const { sessionId, size = "medio" } = body as {
            sessionId: string;
            size?: SmartNotesSize;
        };

        if (!sessionId) {
            return NextResponse.json(
                { error: "ID da sessão não informado" },
                { status: 400 }
            );
        }

        // Buscar sessão e transcrição
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .select("id, transcription")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: "Sessão não encontrada" },
                { status: 404 }
            );
        }

        const sessionData = session as { id: string; transcription: string | null };

        if (!sessionData.transcription) {
            return NextResponse.json(
                { error: "Sessão não possui transcrição" },
                { status: 400 }
            );
        }

        // Gerar SmartNotes
        const smartnotes = await generateSmartNotes(
            sessionData.transcription,
            size
        );

        // Salvar no banco
        const { error: updateError } = await supabase
            .from("sessions")
            .update({
                smartnotes,
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", sessionId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            smartnotes,
        });
    } catch (error) {
        console.error("SmartNotes error:", error);
        return NextResponse.json(
            { error: "Erro ao gerar SmartNotes" },
            { status: 500 }
        );
    }
}
