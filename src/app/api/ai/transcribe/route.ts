import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/gemini/transcribe";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;
        const sessionId = formData.get("sessionId") as string | null;

        if (!audioFile) {
            return NextResponse.json({ error: "Arquivo de áudio não enviado" }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: "ID da sessão não informado" }, { status: 400 });
        }

        // Verificar se a sessão pertence ao profissional
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .select("id, patient_id")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) {
            return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
        }

        // Atualizar status para processing
        await supabase
            .from("sessions")
            .update({ ai_status: "processing" } as never)
            .eq("id", sessionId);

        // Converter File para Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Transcrever áudio
        const transcription = await transcribeAudio(buffer, audioFile.type);

        // Salvar transcrição no banco
        const { error: updateError } = await supabase
            .from("sessions")
            .update({
                transcription,
                ai_status: "completed",
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", sessionId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            transcription,
        });
    } catch (error) {
        console.error("Transcription error:", error);

        // Se possível, atualizar status para erro
        try {
            const formData = await request.formData();
            const sessionId = formData.get("sessionId") as string | null;
            if (sessionId) {
                const supabase = await createClient();
                await supabase
                    .from("sessions")
                    .update({ ai_status: "error" } as never)
                    .eq("id", sessionId);
            }
        } catch { }

        return NextResponse.json(
            { error: "Erro ao transcrever áudio" },
            { status: 500 }
        );
    }
}
