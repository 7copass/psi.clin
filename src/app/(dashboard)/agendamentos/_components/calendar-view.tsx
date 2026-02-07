"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WEEKDAYS, SESSION_STATUS } from "@/lib/utils/constants";
import type { Session } from "@/lib/types/database";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

interface CalendarViewProps {
    sessions: SessionWithPatient[];
    onDateSelect: (date: string) => void;
    onNewAppointment: (date: string) => void;
    selectedDate: string;
}

export function CalendarView({
    sessions,
    onDateSelect,
    onNewAppointment,
    selectedDate,
}: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week">("month");

    const today = new Date().toISOString().split("T")[0];

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

    // Get days for week view
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [currentDate]);

    const navigateMonth = (direction: number) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (view === "month") {
                newDate.setMonth(prev.getMonth() + direction);
            } else {
                newDate.setDate(prev.getDate() + direction * 7);
            }
            return newDate;
        });
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    };

    const formatDateKey = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold capitalize min-w-[200px] text-center">
                        {formatMonthYear(currentDate)}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={view === "month" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("month")}
                        className={view === "month" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                        Mês
                    </Button>
                    <Button
                        variant={view === "week" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("week")}
                        className={view === "week" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                        Semana
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        Hoje
                    </Button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day.value}
                        className="py-2 text-center text-sm font-medium text-slate-500"
                    >
                        {day.short}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            {view === "month" ? (
                <div className="grid grid-cols-7">
                    {monthDays.map(({ date, isCurrentMonth }, i) => {
                        const dateKey = formatDateKey(date);
                        const daySessions = sessionsByDate[dateKey] || [];
                        const isToday = dateKey === today;
                        const isSelected = dateKey === selectedDate;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "min-h-[100px] border-b border-r p-2 cursor-pointer transition-colors",
                                    !isCurrentMonth && "bg-slate-50 dark:bg-slate-900/50",
                                    isSelected && "bg-purple-50 dark:bg-purple-900/20",
                                    "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                )}
                                onClick={() => onDateSelect(dateKey)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            !isCurrentMonth && "text-slate-400",
                                            isToday &&
                                            "bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                        )}
                                    >
                                        {date.getDate()}
                                    </span>
                                    {isCurrentMonth && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNewAppointment(dateKey);
                                            }}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {daySessions.slice(0, 3).map((session) => {
                                        const status =
                                            SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                                        return (
                                            <div
                                                key={session.id}
                                                className={cn(
                                                    "text-xs truncate px-1 py-0.5 rounded",
                                                    status?.color === "green" && "bg-green-100 text-green-700",
                                                    status?.color === "blue" && "bg-blue-100 text-blue-700",
                                                    status?.color === "purple" && "bg-purple-100 text-purple-700",
                                                    status?.color === "red" && "bg-red-100 text-red-700",
                                                    status?.color === "orange" && "bg-orange-100 text-orange-700"
                                                )}
                                            >
                                                {session.start_time && `${session.start_time} `}
                                                {session.patients?.full_name?.split(" ")[0] || "Paciente"}
                                            </div>
                                        );
                                    })}
                                    {daySessions.length > 3 && (
                                        <div className="text-xs text-slate-500">
                                            +{daySessions.length - 3} mais
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Week view */
                <div className="grid grid-cols-7">
                    {weekDays.map((date, i) => {
                        const dateKey = formatDateKey(date);
                        const daySessions = sessionsByDate[dateKey] || [];
                        const isToday = dateKey === today;
                        const isSelected = dateKey === selectedDate;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "min-h-[300px] border-r p-2 cursor-pointer transition-colors",
                                    isSelected && "bg-purple-50 dark:bg-purple-900/20",
                                    "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                )}
                                onClick={() => onDateSelect(dateKey)}
                            >
                                <div className="flex flex-col items-center mb-3">
                                    <span className="text-xs text-slate-500">
                                        {date.toLocaleDateString("pt-BR", { weekday: "short" })}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-lg font-semibold",
                                            isToday &&
                                            "bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                        )}
                                    >
                                        {date.getDate()}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {daySessions.map((session) => {
                                        const status =
                                            SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                                        return (
                                            <div
                                                key={session.id}
                                                className={cn(
                                                    "text-xs p-2 rounded border-l-2",
                                                    status?.color === "green" &&
                                                    "bg-green-50 border-green-500",
                                                    status?.color === "blue" && "bg-blue-50 border-blue-500",
                                                    status?.color === "purple" &&
                                                    "bg-purple-50 border-purple-500",
                                                    status?.color === "red" && "bg-red-50 border-red-500",
                                                    status?.color === "orange" &&
                                                    "bg-orange-50 border-orange-500"
                                                )}
                                            >
                                                <div className="font-medium">
                                                    {session.start_time || "--:--"}
                                                </div>
                                                <div className="truncate text-slate-600">
                                                    {session.patients?.full_name || "Paciente"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
