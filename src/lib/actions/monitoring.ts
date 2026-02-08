"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTodayDate } from "@/lib/utils/date";

export interface MonitoringStats {
    activePatients: number;
    totalPatients: number;
    sessionsThisMonth: number;
    scheduledSessions: number;
}

export interface RecentActivity {
    id: string;
    type: "session" | "note";
    title: string;
    description: string;
    date: string;
    status?: string;
    patientId: string;
    patientName: string;
}

export interface PatientStatus {
    id: string;
    name: string;
    lastSessionDate: string | null;
    status: string;
    daysSinceLastSession: number | null;
}

export async function getMonitoringStats(): Promise<MonitoringStats> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Não autorizado");
    }

    // 1. Total Patients & Active Patients
    const { data: patientsData } = await supabase
        .from("patients")
        .select("status")
        .eq("professional_id", user.id);

    const patients = patientsData as { status: string }[] | null;

    const totalPatients = patients?.length || 0;
    const activePatients = patients?.filter(p => p.status === 'active').length || 0;

    // 2. Sessions this month
    const now = new Date();
    // Adjust to BRT for accurate month calculation
    const brtDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const startOfMonth = new Date(brtDate.getFullYear(), brtDate.getMonth(), 1).toISOString();
    // End of month needs to be careful about timezone, but usually fine for approximation or exact date if using same base
    const endOfMonth = new Date(brtDate.getFullYear(), brtDate.getMonth() + 1, 0).toISOString();

    const { count: sessionsThisMonth } = await supabase
        .from("sessions")
        .select("*", { count: 'exact', head: true })
        .eq("professional_id", user.id)
        .gte("session_date", startOfMonth)
        .lte("session_date", endOfMonth)
        .eq("status", "completed");

    // 3. Scheduled Sessions (Upcoming)
    // Use BRT "today" to query upcoming. session_date is YYYY-MM-DD string.
    const today = getTodayDate();

    const { count: scheduledSessions } = await supabase
        .from("sessions")
        .select("*", { count: 'exact', head: true })
        .eq("professional_id", user.id)
        .eq("status", "scheduled")
        .gte("session_date", today);

    return {
        activePatients,
        totalPatients,
        sessionsThisMonth: sessionsThisMonth || 0,
        scheduledSessions: scheduledSessions || 0,
    };
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Não autorizado");

    // Fetch latest sessions
    const { data: sessions } = await supabase
        .from("sessions")
        .select(`
            id,
            session_date,
            status,
            patient:patients(id, full_name),
            notes
        `)
        .eq("professional_id", user.id)
        .order("session_date", { ascending: false })
        .limit(10);

    const sessionsData = sessions as unknown as any[];

    if (!sessionsData) return [];

    return sessionsData.map((session: any) => ({
        id: session.id,
        type: "session",
        title: session.patient?.full_name || "Paciente desconhecido",
        description: session.notes ? "Sessão com anotações" : `Sessão ${translateStatus(session.status)}`,
        date: session.session_date,
        status: session.status,
        patientId: session.patient?.id,
        patientName: session.patient?.full_name,
    }));
}

export async function getPatientRiskStatus(): Promise<PatientStatus[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Não autorizado");

    // Fetch active patients
    const { data: patientsData } = await supabase
        .from("patients")
        .select("id, full_name, status")
        .eq("professional_id", user.id)
        .eq("status", "active");

    const patients = patientsData as { id: string; full_name: string; status: string }[] | null;

    if (!patients) return [];

    // For each patient, check last session
    const statusPromises = patients.map(async (patient) => {
        const { data: lastSessionData } = await supabase
            .from("sessions")
            .select("session_date")
            .eq("patient_id", patient.id)
            .eq("status", "completed")
            .order("session_date", { ascending: false })
            .limit(1)
            .single();

        const lastSession = lastSessionData as { session_date: string } | null;

        let daysSince = null;
        if (lastSession?.session_date) {
            const lastDate = new Date(lastSession.session_date);
            const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
            daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
            id: patient.id,
            name: patient.full_name,
            lastSessionDate: lastSession?.session_date || null,
            status: patient.status,
            daysSinceLastSession: daysSince,
        };
    });

    const results = await Promise.all(statusPromises);

    // Sort by risk (days since last session desc)
    return results.sort((a, b) => {
        if (a.daysSinceLastSession === null) return -1; // New patients to the top? Or bottom? Let's put null (never had session) at top as they need attention
        if (b.daysSinceLastSession === null) return 1;
        return b.daysSinceLastSession - a.daysSinceLastSession;
    });
}

function translateStatus(status: string) {
    const map: Record<string, string> = {
        scheduled: "Agendada",
        confirmed: "Confirmada",
        completed: "Realizada",
        cancelled: "Cancelada",
        no_show: "Falta",
    };
    return map[status] || status;
}
