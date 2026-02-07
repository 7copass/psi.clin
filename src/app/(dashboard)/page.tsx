import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Users, DollarSign, Clock, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import type { Session, Patient } from "@/lib/types/database";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Get current date info
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Fetch patients count
    const { count: totalPatients } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

    // Fetch today's sessions
    interface SessionWithPatient extends Session {
        patients: Pick<Patient, "id" | "full_name">;
    }

    const { data: todaySessionsData } = await supabase
        .from("sessions")
        .select("*, patients(id, full_name)")
        .eq("session_date", today)
        .order("start_time");

    const todaySessions = (todaySessionsData as SessionWithPatient[]) || [];

    // Fetch upcoming sessions
    const { data: upcomingSessionsData } = await supabase
        .from("sessions")
        .select("*, patients(id, full_name)")
        .gt("session_date", today)
        .neq("status", "cancelled")
        .order("session_date")
        .limit(5);

    const upcomingSessions = (upcomingSessionsData as SessionWithPatient[]) || [];

    // Fetch month revenue
    const { data: monthSessionsData } = await supabase
        .from("sessions")
        .select("value, payment_status")
        .gte("session_date", `${currentMonth}-01`)
        .eq("status", "completed");

    const monthSessions = (monthSessionsData as { value: number | null; payment_status: string }[]) || [];
    const totalRevenue = monthSessions.reduce((acc, s) => acc + (s.value || 0), 0);
    const pendingPayments = monthSessions
        .filter((s) => s.payment_status !== "paid")
        .reduce((acc, s) => acc + (s.value || 0), 0);

    // Recent patients
    const { data: recentPatientsData } = await supabase
        .from("patients")
        .select("id, full_name, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

    const recentPatients = (recentPatientsData as { id: string; full_name: string; created_at: string }[]) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Olá! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Aqui está um resumo do seu dia
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/pacientes">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Paciente
                        </Link>
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href="/sessoes">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Sessão
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Pacientes ativos</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {totalPatients || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Sessões hoje</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {todaySessions.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Recebido no mês</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(totalRevenue - pendingPayments)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Pendente</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(pendingPayments)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Today's Sessions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border">
                    <div className="p-5 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Sessões de Hoje
                        </h2>
                        <Link
                            href="/sessoes"
                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            Ver todas <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="p-5">
                        {todaySessions.length > 0 ? (
                            <div className="space-y-3">
                                {todaySessions.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/sessoes/${session.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <span className="text-sm font-medium text-purple-600">
                                                    {session.patients?.full_name?.charAt(0) || "?"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {session.patients?.full_name || "Paciente"}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {session.start_time || "Horário não definido"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                session.status === "completed" ? "default" : "secondary"
                                            }
                                            className={
                                                session.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : ""
                                            }
                                        >
                                            {session.status === "completed"
                                                ? "Realizada"
                                                : session.status === "scheduled"
                                                    ? "Agendada"
                                                    : session.status}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma sessão agendada para hoje</p>
                                <Button variant="outline" className="mt-4" asChild>
                                    <Link href="/sessoes">Agendar sessão</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border">
                    <div className="p-5 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Próximas Sessões
                        </h2>
                        <Link
                            href="/sessoes"
                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            Ver agenda <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="p-5">
                        {upcomingSessions.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingSessions.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/sessoes/${session.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {session.patients?.full_name || "Paciente"}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formatDate(session.session_date)}
                                                {session.start_time && ` às ${session.start_time}`}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma sessão agendada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border">
                <div className="p-5 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                        Pacientes Recentes
                    </h2>
                    <Link
                        href="/pacientes"
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                        Ver todos <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="p-5">
                    {recentPatients.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-5">
                            {recentPatients.map((patient) => (
                                <Link
                                    key={patient.id}
                                    href={`/pacientes/${patient.id}`}
                                    className="flex flex-col items-center p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-2">
                                        <span className="text-white font-semibold">
                                            {patient.full_name?.charAt(0) || "?"}
                                        </span>
                                    </div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white text-center truncate w-full">
                                        {patient.full_name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum paciente cadastrado</p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/pacientes">Cadastrar paciente</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
