"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WEEKDAYS, SESSION_STATUS } from "@/lib/utils/constants";
import type { Session } from "@/lib/types/database";
import { getTodayDate } from "@/lib/utils/date";

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week">("month");

    const today = getTodayDate();

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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            {!hideHeader && (
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth(-1)}
                                className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h2 className="text-lg font-bold capitalize px-4 min-w-[180px] text-center text-slate-700 dark:text-slate-200">
                                {formatMonthYear(currentDate)}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth(1)}
                                className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("month")}
                            className={cn(
                                "rounded-lg text-sm font-medium transition-all px-4",
                                view === "month"
                                    ? "bg-white dark:bg-slate-700 text-purple-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            Mês
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("week")}
                            className={cn(
                                "rounded-lg text-sm font-medium transition-all px-4",
                                view === "week"
                                    ? "bg-white dark:bg-slate-700 text-purple-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            Semana
                        </Button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                            className="rounded-lg text-sm font-medium text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm px-4"
                        >
                            Hoje
                        </Button>
                    </div>
                </div>
            )}

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day.value}
                        className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                        {day.short}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="flex-1 overflow-y-auto">
                {view === "month" ? (
                    <div className="grid grid-cols-7 auto-rows-fr h-full min-h-[500px]">
                        {monthDays.map(({ date, isCurrentMonth }, i) => {
                            const dateKey = formatDateKey(date);
                            const daySessions = sessionsByDate[dateKey] || [];
                            const isToday = dateKey === today;
                            const isSelected = dateKey === selectedDate;

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "relative p-2 min-h-[100px] border-b border-r border-slate-50 dark:border-slate-800/50 transition-all duration-200 group flex flex-col",
                                        !isCurrentMonth && "bg-slate-50/30 dark:bg-slate-900/30",
                                        isSelected && "bg-purple-50/80 dark:bg-purple-900/10",
                                        "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                                    )}
                                    onClick={() => onDateSelect(dateKey)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={cn(
                                                "text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-all",
                                                !isCurrentMonth && "text-slate-300 dark:text-slate-700",
                                                isToday ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "text-slate-700 dark:text-slate-300",
                                                isSelected && !isToday && "text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                                            )}
                                        >
                                            {date.getDate()}
                                        </span>
                                        {isCurrentMonth && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 transition-all scale-90 hover:scale-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNewAppointment(dateKey);
                                                }}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        {daySessions.slice(0, 3).map((session) => {
                                            const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                                            return (
                                                <div
                                                    key={session.id}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded-md font-medium truncate transition-all hover:scale-[1.02] cursor-pointer",
                                                        status?.color === "green" && "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                                                        status?.color === "blue" && "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                                        status?.color === "purple" && "bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                                                        status?.color === "red" && "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                                                        status?.color === "orange" && "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                                    )}
                                                >
                                                    {session.start_time} - {session.patients?.full_name?.split(" ")[0]}
                                                </div>
                                            );
                                        })}
                                        {daySessions.length > 3 && (
                                            <div className="text-[10px] font-medium text-slate-400 pl-1 flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-slate-400" />
                                                <span>+{daySessions.length - 3} mais</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Week view */
                    <div className="grid grid-cols-7 h-full">
                        {weekDays.map((date, i) => {
                            const dateKey = formatDateKey(date);
                            const daySessions = sessionsByDate[dateKey] || [];
                            const isToday = dateKey === today;
                            const isSelected = dateKey === selectedDate;

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "min-h-[300px] border-r border-slate-100 dark:border-slate-800 p-3 cursor-pointer transition-all duration-200 group flex flex-col hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                                        isSelected && "bg-purple-50/50 dark:bg-purple-900/10"
                                    )}
                                    onClick={() => onDateSelect(dateKey)}
                                >
                                    <div className="flex flex-col items-center mb-6">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                            {date.toLocaleDateString("pt-BR", { weekday: "short" })}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-all",
                                                isToday ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-700 dark:text-slate-200",
                                                isSelected && !isToday && "text-purple-600"
                                            )}
                                        >
                                            {date.getDate()}
                                        </span>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        {daySessions.map((session) => {
                                            const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                                            return (
                                                <div
                                                    key={session.id}
                                                    className={cn(
                                                        "text-xs p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all hover:shadow-sm hover:scale-[1.02] bg-white dark:bg-slate-800 shadow-sm",
                                                        status?.color === "green" && "border-green-200 bg-green-50/50",
                                                    )}
                                                >
                                                    <div className="font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                                                        {session.start_time}
                                                    </div>
                                                    <div className="truncate text-slate-500 font-medium">
                                                        {session.patients?.full_name?.split(" ")[0]}
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
        </div>
    );
}
