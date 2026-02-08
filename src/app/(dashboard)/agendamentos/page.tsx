"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "./_components/calendar-view";
import { SidebarCalendar } from "./_components/layout/sidebar-calendar";
import { TimeGridView } from "./_components/views/time-grid-view";
// import { DaySessions } from "./_components/day-sessions";
import { AppointmentDialog } from "./_components/appointment-dialog";
import { getSessionsByDateRange } from "@/lib/actions/sessions";
import { createClient } from "@/lib/supabase/client";
import type { Session, Patient } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

export default function AgendamentosPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");

    // Helper for local date string
    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = getTodayString();

    const [sessions, setSessions] = useState<SessionWithPatient[]>([]);
    const [patients, setPatients] = useState<Pick<Patient, "id" | "full_name" | "session_value">[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(dateParam || today);
    const [view, setView] = useState<"day" | "week" | "month">("day"); // State for view switching
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogDate, setDialogDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);

    // Calculate date range for current view (2 months)
    const getDateRange = useCallback(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

        const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            startDate: formatDate(start),
            endDate: formatDate(end),
        };
    }, []);

    const [defaultDuration, setDefaultDuration] = useState(50);

    // ... (existing state)

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const supabase = createClient();

            // Fetch sessions
            const sessionsResult = await getSessionsByDateRange(startDate, endDate);
            if (sessionsResult.data) {
                setSessions(sessionsResult.data);
            }

            // Fetch patients and professional settings
            const { data: patientsData } = await supabase
                .from("patients")
                .select("id, full_name, session_value")
                .eq("status", "active")
                .order("full_name");

            if (patientsData) {
                setPatients(patientsData as Pick<Patient, "id" | "full_name" | "session_value">[]);
            }

            const { data: professionalData } = await supabase
                .from("professionals")
                .select("default_session_duration")
                .single();

            const professional = professionalData as { default_session_duration: number } | null;

            if (professional) {
                setDefaultDuration(professional.default_session_duration || 50);
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
        if (date) {
            // Append T12:00:00 to avoid timezone shifts when creating Date from YYYY-MM-DD
            setDialogDate(new Date(date + "T12:00:00"));
        } else {
            setDialogDate(new Date());
        }
        setDialogOpen(true);
    };

    const selectedDateSessions = sessions.filter(
        (s) => s.session_date === selectedDate
    );

    return (
        <div className="h-[calc(100vh-2rem)] flex bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Left Sidebar */}
            <aside className="w-[280px] flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col pt-4">
                <div className="px-4 mb-4">
                    <Button
                        className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 h-12 rounded-full shadow-sm hover:shadow-md transition-all justify-start px-4 gap-3 font-semibold text-base"
                        onClick={() => handleNewAppointment()}
                    >
                        <svg width="36" height="36" viewBox="0 0 36 36"><path fill="#34A853" d="M16 16v14h4V20z"></path><path fill="#4285F4" d="M30 16H20l-4 4h14z"></path><path fill="#FBBC05" d="M6 16v4h10l4-4z"></path><path fill="#EA4335" d="M20 16V6h-4v14z"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
                        <span className="bg-gradient-to-r from-google-blue to-google-red bg-clip-text text-transparent">Novo evento</span>
                        {/* Using standard styling for now as SVG path above might be quirky without proper icon. Reverting to simple icon. */}
                    </Button>
                    <Button
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-2xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                        onClick={() => handleNewAppointment()}
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-semibold text-lg">Criar</span>
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-2">
                    <SidebarCalendar
                        selectedDate={new Date(selectedDate + "T12:00:00")}
                        onDateSelect={(date) => {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${year}-${month}-${day}`;
                            setSelectedDate(dateStr);
                        }}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
                {/* View Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 flex-none">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedDate(getTodayString())} className="mr-2">
                                Hoje
                            </Button>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                                    // Quick nav logic based on view
                                    const d = new Date(selectedDate + "T12:00:00"); // Safe parsing
                                    d.setDate(d.getDate() - 1);
                                    const year = d.getFullYear();
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const day = String(d.getDate()).padStart(2, '0');
                                    setSelectedDate(`${year}-${month}-${day}`);
                                }}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                                    const d = new Date(selectedDate + "T12:00:00");
                                    d.setDate(d.getDate() + 1);
                                    const year = d.getFullYear();
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const day = String(d.getDate()).padStart(2, '0');
                                    setSelectedDate(`${year}-${month}-${day}`);
                                }}>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 capitalize">
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric", day: "numeric" })}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("month")}
                            className={cn("rounded-md text-sm", view === "month" && "bg-white dark:bg-slate-700 shadow-sm")}
                        >
                            Mês
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("week")}
                            className={cn("rounded-md text-sm", view === "week" && "bg-white dark:bg-slate-700 shadow-sm")}
                        >
                            Semana
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("day")}
                            className={cn("rounded-md text-sm", view === "day" && "bg-white dark:bg-slate-700 shadow-sm")}
                        >
                            Dia
                        </Button>
                    </div>
                </header>

                {/* Content View */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Render TimeGrid or Month View based on state */}
                    {view === "month" ? (
                        /* Reusing CalendarView for Month, but stripping its header logic internally or wrapping it */
                        <div className="h-full overflow-y-auto">
                            <CalendarView
                                sessions={sessions}
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                                onNewAppointment={(date) => {
                                    setDialogDate(new Date(date + "T12:00:00"));
                                    setDialogOpen(true);
                                }}
                                hideHeader={true}
                            />
                        </div>
                    ) : (
                        <TimeGridView
                            date={new Date(selectedDate + "T12:00:00")}
                            selectedDateStr={selectedDate}
                            sessions={sessions}
                            view={view as "day" | "week"}
                            onTimeSlotClick={(date) => {
                                const localDate = new Date(date); // Adjust for offsets if needed
                                setDialogDate(localDate);
                                setDialogOpen(true);
                            }}
                            onSessionClick={(session) => {
                                // Open edit dialog or details (for now just log or reusing existing logic if any)
                                console.log("Session clicked", session);
                            }}
                        />
                    )}
                </div>
            </main>

            {/* Appointment Dialog */}
            <AppointmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                patients={patients}
                initialDate={dialogDate}
                onSuccess={fetchData}
                defaultDuration={defaultDuration}
                existingSessions={sessions} // Pass all filtered sessions for conflict checking
            />
        </div>
    );
}
