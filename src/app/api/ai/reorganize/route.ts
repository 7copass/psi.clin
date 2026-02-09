
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFlashModel, callGeminiWithRetry } from "@/lib/gemini/client";
import { buildReorganizePrompt } from "@/lib/gemini/prompts";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const { notes } = await request.json();

        if (!notes) {
            return NextResponse.json(
                { error: "Nenhuma anotação fornecida" },
                { status: 400 }
            );
        }

        const model = getFlashModel();
        const prompt = buildReorganizePrompt(notes);

        const responseText = await callGeminiWithRetry(async () => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });

        return NextResponse.json({
            success: true,
            formattedNotes: responseText,
        });
    } catch (error) {
        console.error("Reorganize error:", error);
        return NextResponse.json(
            { error: "Erro ao reorganizar notas" },
            { status: 500 }
        );
    }
}
