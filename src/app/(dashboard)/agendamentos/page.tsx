"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "./_components/calendar-view";
import { DaySessions } from "./_components/day-sessions";
import { AppointmentDialog } from "./_components/appointment-dialog";
import { getSessionsByDateRange } from "@/lib/actions/sessions";
import { createClient } from "@/lib/supabase/client";
import type { Session, Patient } from "@/lib/types/database";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

export default function AgendamentosPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");

    const [sessions, setSessions] = useState<SessionWithPatient[]>([]);
    const [patients, setPatients] = useState<Pick<Patient, "id" | "full_name" | "session_value">[]>([]);
    const [selectedDate, setSelectedDate] = useState(
        dateParam || new Date().toISOString().split("T")[0]
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogDate, setDialogDate] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    // Calculate date range for current view (2 months)
    const getDateRange = useCallback(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        return {
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
        };
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { startDate, endDate } = getDateRange();

            // Fetch sessions
            const sessionsResult = await getSessionsByDateRange(startDate, endDate);
            if (sessionsResult.data) {
                setSessions(sessionsResult.data);
            }

            // Fetch patients (client side)
            const supabase = createClient();
            const { data: patientsData } = await supabase
                .from("patients")
                .select("id, full_name, session_value")
                .eq("status", "active")
                .order("full_name");

            if (patientsData) {
                setPatients(patientsData as Pick<Patient, "id" | "full_name" | "session_value">[]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getDateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        router.push(`/agendamentos?date=${date}`, { scroll: false });
    };

    const handleNewAppointment = (date?: string) => {
        setDialogDate(date || selectedDate);
        setDialogOpen(true);
    };

    const selectedDateSessions = sessions.filter(
        (s) => s.session_date === selectedDate
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Agendamentos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie sua agenda de sessões
                    </p>
                </div>
                <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleNewAppointment()}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                </Button>
            </div>

            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
                <CalendarView
                    sessions={sessions}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onNewAppointment={handleNewAppointment}
                />
                <DaySessions
                    sessions={selectedDateSessions}
                    selectedDate={selectedDate}
                    onRefresh={fetchData}
                />
            </div>

            {/* Appointment Dialog */}
            <AppointmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                patients={patients}
                initialDate={dialogDate}
                onSuccess={fetchData}
            />
        </div>
    );
}
