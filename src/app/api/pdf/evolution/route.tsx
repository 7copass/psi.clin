import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { EvolutionPDF } from "@/lib/pdf/evolution-template";
import { registerFonts } from "@/lib/pdf/fonts";
import { formatDate } from "@/lib/utils/format";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch session with patient and professional
        const { data: session, error } = await supabase
            .from("sessions")
            .select(`
        *,
        patients!inner(full_name),
        professionals!inner(full_name, crp)
      `)
            .eq("id", sessionId)
            .eq("professional_id", user.id)
            .single();

        if (error || !session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const sessionData = session as {
            evolution: string | null;
            session_date: string;
            session_type: string;
            patients: { full_name: string };
            professionals: { full_name: string; crp: string };
        };

        if (!sessionData.evolution) {
            return NextResponse.json({ error: "No evolution found" }, { status: 400 });
        }

        // Register fonts and generate PDF
        await registerFonts();
        const pdfBuffer = await renderToBuffer(
            <EvolutionPDF
                patientName={sessionData.patients.full_name}
                professionalName={sessionData.professionals.full_name}
                crp={sessionData.professionals.crp || "N/A"}
                sessionDate={formatDate(sessionData.session_date)}
                sessionType={sessionData.session_type === "online" ? "Online" : "Presencial"}
                evolution={sessionData.evolution}
            />
        );

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="evolucao-${sessionId.slice(0, 8)}.pdf"`,
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }
}
