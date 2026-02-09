
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFlashModel, callGeminiWithRetry } from "@/lib/gemini/client";
import { OCR_PROMPT } from "@/lib/gemini/prompts";

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
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Nenhum arquivo enviado" },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");
        const mimeType = file.type;

        // Use standard model; assuming getFlashModel returns a model capable of vision (gemini-1.5-flash usually is)
        const model = getFlashModel();

        const responseText = await callGeminiWithRetry(async () => {
            const result = await model.generateContent([
                OCR_PROMPT,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
            ]);
            return result.response.text();
        });

        return NextResponse.json({
            success: true,
            transcription: responseText,
        });
    } catch (error) {
        console.error("OCR error:", error);
        return NextResponse.json(
            { error: "Erro ao transcrever imagem" },
            { status: 500 }
        );
    }
}
