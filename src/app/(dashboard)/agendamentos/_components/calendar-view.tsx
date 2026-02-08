"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WEEKDAYS, SESSION_STATUS } from "@/lib/utils/constants";
import type { Session } from "@/lib/types/database";
import { getTodayDate } from "@/lib/utils/date";
import { TimeGridView } from "./views/time-grid-view";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

interface CalendarViewProps {
    sessions: SessionWithPatient[];
    onDateSelect: (date: string) => void;
    onNewAppointment: (date: string) => void;
    selectedDate: string;
    hideHeader?: boolean;
}

export function CalendarView({
    sessions,
    onDateSelect,
    onNewAppointment,
    selectedDate,
    hideHeader = false,
}: CalendarViewProps) {

    const [currentDate, setCurrentDate] = useState(() => new Date(selectedDate + "T12:00:00"));
    const [view, setView] = useState<"month" | "week" | "day">("month");

    // Sync internal state if selectedDate changes externally
    useMemo(() => {
        if (selectedDate) {
            setCurrentDate(new Date(selectedDate + "T12:00:00"));
        }
    }, [selectedDate]);

    const today = getTodayDate();

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    };

    // Get sessions grouped by date
    const sessionsByDate = useMemo(() => {
        const grouped: Record<string, SessionWithPatient[]> = {};
        sessions.forEach((session) => {
            if (!grouped[session.session_date]) {
                grouped[session.session_date] = [];
            }
            grouped[session.session_date].push(session);
        });
        return grouped;
    }, [sessions]);

    // Get days for current month view
    const monthDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month padding
        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false });
        }

        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    }, [currentDate]);

    // ... (keep navigation logic, update navigateMonth/Week/Day if needed)
    const navigateMonth = (direction: number) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (view === "month") {
                newDate.setMonth(prev.getMonth() + direction);
            } else if (view === "week") {
                newDate.setDate(prev.getDate() + direction * 7);
            } else {
                // Day view
                newDate.setDate(prev.getDate() + direction);
            }
            return newDate;
        });
    };

    // ...

    // Helper to format date string YYYY-MM-DD for current date
    const currentDateStr = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [currentDate]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            {!hideHeader && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentDate(new Date())}
                            className="mr-2"
                        >
                            Hoje
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth(-1)}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth(1)}
                                className="h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 capitalize">
                            {formatMonthYear(currentDate)}
                        </h2>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("month")}
                            className={cn(
                                "rounded-md text-sm font-medium transition-all px-3",
                                view === "month" && "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-200"
                            )}
                        >
                            Mês
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("week")}
                            className={cn(
                                "rounded-md text-sm font-medium transition-all px-3",
                                view === "week" && "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-200"
                            )}
                        >
                            Semana
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("day")}
                            className={cn(
                                "rounded-md text-sm font-medium transition-all px-3",
                                view === "day" && "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-200"
                            )}
                        >
                            Dia
                        </Button>
                    </div>
                </div>
            )}

            {/* Weekday headers for Month View Only */}
            {view === "month" && (
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                    {WEEKDAYS.map((day) => (
                        <div
                            key={day.value}
                            className="py-2 text-center text-[11px] font-medium uppercase text-slate-500"
                        >
                            {day.short}
                        </div>
                    ))}
                </div>
            )}

            {/* Views */}
            <div className="flex-1 overflow-hidden relative bg-white dark:bg-slate-950">
                {view === "month" ? (
                    <div className="grid grid-cols-7 auto-rows-fr h-full overflow-y-auto">
                        {monthDays.map(({ date, isCurrentMonth }, i) => {
                            const dateKey = formatDateKey(date);
                            const daySessions = sessionsByDate[dateKey] || [];
                            const isToday = dateKey === today;
                            const isSelected = dateKey === selectedDate;

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "min-h-[120px] border-b border-r border-slate-200 dark:border-slate-800 p-2 transition-all flex flex-col gap-1 cursor-pointer",
                                        !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-900/50 opacity-60 text-slate-400",
                                        isSelected && isCurrentMonth && "bg-blue-50 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => onDateSelect(dateKey)}
                                >
                                    <div className="flex items-center justify-center mb-1">
                                        <span
                                            className={cn(
                                                "text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                                isToday
                                                    ? "bg-purple-600 text-white"
                                                    : "text-slate-700 dark:text-slate-300"
                                            )}
                                        >
                                            {date.getDate()}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                        {daySessions.map((session) => {
                                            const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                                            return (
                                                <div
                                                    key={session.id}
                                                    className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded truncate font-medium",
                                                        status?.color === "green" ? "bg-green-100 text-green-700" :
                                                            status?.color === "blue" ? "bg-blue-100 text-blue-700" :
                                                                status?.color === "purple" ? "bg-purple-100 text-purple-700" :
                                                                    status?.color === "red" ? "bg-red-100 text-red-700" :
                                                                        "bg-slate-100 text-slate-700"
                                                    )}
                                                >
                                                    {session.start_time} {session.patients?.full_name?.split(" ")[0]}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <TimeGridView
                        date={currentDate}
                        selectedDateStr={currentDateStr}
                        sessions={sessions}
                        view={view}
                        onTimeSlotClick={(date) => {
                            onNewAppointment(formatDateKey(date));
                        }}
                        onSessionClick={(session) => {
                            // Can add session click handler here
                            console.log("Session clicked", session);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
