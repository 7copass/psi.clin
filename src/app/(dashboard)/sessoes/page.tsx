import { createClient } from "@/lib/supabase/server";
import { SessionList } from "./_components/session-list";
import { SessionDialog } from "./_components/session-dialog";
import type { Session, Patient } from "@/lib/types/database";

export default async function SessoesPage() {
    const supabase = await createClient();

    // Buscar sessões com dados do paciente
    const { data: sessionsData, error } = await supabase
        .from("sessions")
        .select("*, patients(id, full_name)")
        .order("session_date", { ascending: false })
        .limit(50);

    interface SessionWithPatient extends Session {
        patients: { id: string; full_name: string } | null;
    }

    const sessions = (sessionsData as SessionWithPatient[]) || [];

    // Buscar pacientes para o dialog de nova sessão
    const { data: patientsData } = await supabase
        .from("patients")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");

    const patients = (patientsData as Pick<Patient, "id" | "full_name">[]) || [];

    if (error) {
        console.error("Error fetching sessions:", error);
    }

    // Agrupar sessões por status para estatísticas
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter((s) => s.session_date === today);
    const upcomingSessions = sessions.filter(
        (s) => s.session_date > today && s.status !== "cancelled"
    );
    const completedThisMonth = sessions.filter((s) => {
        const sessionMonth = s.session_date.substring(0, 7);
        const currentMonth = new Date().toISOString().substring(0, 7);
        return sessionMonth === currentMonth && s.status === "completed";
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Sessões
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie as sessões com seus pacientes
                    </p>
                </div>
                <SessionDialog patients={patients} />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                    <p className="text-sm text-slate-500">Sessões Hoje</p>
                    <p className="text-2xl font-bold text-purple-600">{todaySessions.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                    <p className="text-sm text-slate-500">Próximas Agendadas</p>
                    <p className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                    <p className="text-sm text-slate-500">Realizadas no Mês</p>
                    <p className="text-2xl font-bold text-green-600">{completedThisMonth.length}</p>
                </div>
            </div>

            {/* Session List */}
            <SessionList sessions={sessions} />
        </div>
    );
}
