import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { EvolucaoConsolidadaPDF } from "@/lib/pdf/evolucao-consolidada-template";
import { registerFonts } from "@/lib/pdf/fonts";
import { formatDate } from "@/lib/utils/format";
import type { EvolucaoConsolidada } from "@/lib/types/database";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch evolucao consolidada
        const { data, error } = await supabase
            .from("evolucoes_consolidadas")
            .select("*")
            .eq("id", id)
            .eq("professional_id", user.id)
            .single();

        if (error || !data) {
            console.error("Error fetching consolidated evolution:", error);
            return NextResponse.json(
                { error: "Evolução consolidada não encontrada" },
                { status: 404 }
            );
        }

        const evolucao = data as EvolucaoConsolidada;

        // Safely cast content with fallback values
        const rawContent = evolucao.conteudo_json as Record<string, unknown>;

        const content = {
            observacoes_iniciais: typeof rawContent.observacoes_iniciais === 'string'
                ? rawContent.observacoes_iniciais
                : "N/A",
            evolucao_emocional_comportamental: typeof rawContent.evolucao_emocional_comportamental === 'string'
                ? rawContent.evolucao_emocional_comportamental
                : "N/A",
            pontos_chave: Array.isArray(rawContent.pontos_chave)
                ? rawContent.pontos_chave as string[]
                : [],
            principais_intervencoes: Array.isArray(rawContent.principais_intervencoes)
                ? rawContent.principais_intervencoes as Array<{ intervencao: string; resultado: string; }>
                : [],
            citacoes_relevantes: Array.isArray(rawContent.citacoes_relevantes)
                ? rawContent.citacoes_relevantes as string[]
                : []
        };

        // Fetch patient name
        const { data: patient } = await supabase
            .from("patients")
            .select("full_name")
            .eq("id", evolucao.patient_id)
            .single();

        const patientName = patient?.full_name || "Paciente";

        // Register fonts and generate PDF
        try {
            await registerFonts();
            const pdfBuffer = await renderToBuffer(
                <EvolucaoConsolidadaPDF
                    patientName={patientName}
                    periodoInicio={formatDate(evolucao.periodo_inicio)}
                    periodoFim={formatDate(evolucao.periodo_fim)}
                    sessionsCount={evolucao.sessoes_incluidas?.length || 0}
                    content={content}
                />
            );

            return new NextResponse(new Uint8Array(pdfBuffer), {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="evolucao-consolidada-${id.slice(0, 8)}.pdf"`,
                },
            });
        } catch (pdfError) {
            console.error("React-PDF generation error:", pdfError);
            return NextResponse.json(
                { error: `Erro na geração do PDF: ${(pdfError as Error).message}` },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("General API error:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
