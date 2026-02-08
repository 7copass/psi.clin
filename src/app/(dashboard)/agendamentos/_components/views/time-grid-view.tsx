"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { differenceInMinutes, startOfDay, addMinutes, format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Session } from "@/lib/types/database";
import { SESSION_STATUS, SESSION_TYPES } from "@/lib/utils/constants";
import { Link } from "lucide-react";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

interface TimeGridViewProps {
    date: Date; // Keep as Date for internal logic like "Current Time Indicator"
    selectedDateStr: string; // Add string for filtering
    sessions: SessionWithPatient[];
    view: "day" | "week";
    onTimeSlotClick: (date: Date) => void;
    onSessionClick: (session: SessionWithPatient) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // Pixels per hour

// ... (imports remain)
import { ChevronLeft, ChevronRight } from "lucide-react";

// ... (props interface remains)

export function TimeGridView({ date, selectedDateStr, sessions, view, onTimeSlotClick, onSessionClick }: TimeGridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTimePosition, setCurrentTimePosition] = useState(0);

    // Calculate dates to display
    const days = view === 'day'
        ? [new Date(selectedDateStr + "T12:00:00")]
        : Array.from({ length: 7 }, (_, i) => {
            // week view: start from Sunday of the selected date's week
            const current = new Date(selectedDateStr + "T12:00:00");
            const start = startOfWeek(current, { weekStartsOn: 0 }); // 0 = Sunday
            start.setHours(12, 0, 0, 0); // Force to noon to avoid timezone shifting at midnight
            return addDays(start, i);
        });

    // Filter sessions
    const displayedSessions = sessions.filter(session => {
        const sDate = session.session_date;
        return days.some(d => {
            // Compare YYYY-MM-DD
            const dStr = format(d, 'yyyy-MM-dd');
            return sDate === dStr;
        });
    });

    // Calculate current time indicator position
    useEffect(() => {
        const updatePosition = () => {
            const now = new Date();
            const start = startOfDay(now);
            const minutes = differenceInMinutes(now, start);
            setCurrentTimePosition((minutes / 60) * HOUR_HEIGHT);
        };

        updatePosition();
        const interval = setInterval(updatePosition, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Scroll to 8 AM on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 8 * HOUR_HEIGHT - 20;
        }
    }, []);

    const getSessionStyle = (session: SessionWithPatient, dayIndex: number) => {
        if (!session.start_time) return {};
        const [hours, minutes] = session.start_time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const top = (startMinutes / 60) * HOUR_HEIGHT;

        // Calculate height based on end_time or default to 1 hour
        let duration = 50; // Default to 50 min
        if (session.end_time) {
            const [endH, endM] = session.end_time.split(':').map(Number);
            const endMinutes = endH * 60 + endM;
            duration = endMinutes - startMinutes;
        }

        const height = (duration / 60) * HOUR_HEIGHT;

        // Calculate width/left based on columns
        const colWidthPercent = 100 / days.length;
        const leftPercent = dayIndex * colWidthPercent;

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: `${leftPercent}%`,
            width: `${colWidthPercent}%`,
            position: 'absolute' as const,
            padding: '2px'
        };
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
            {/* Header for Columns */}
            <div className="flex-none border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ml-16">
                <div className="flex">
                    {days.map((day, i) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                            <div key={i} className="flex-1 py-3 text-center border-l border-slate-100 dark:border-slate-800 first:border-l-0">
                                <div className={cn("text-xs font-medium uppercase mb-1", isToday ? "text-purple-600" : "text-slate-500")}>
                                    {format(day, 'EEE', { locale: ptBR })}
                                </div>
                                <div className={cn(
                                    "text-xl font-semibold h-8 w-8 flex items-center justify-center rounded-full mx-auto",
                                    isToday ? "bg-purple-600 text-white" : "text-slate-900 dark:text-white"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Time Grid */}
            <div ref={containerRef} className="flex-auto overflow-y-auto relative custom-scrollbar">
                <div className="flex min-h-full" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                    {/* Time Labels Column */}
                    <div className="w-16 flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky left-0 z-10 -mt-2.5">
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="relative text-right pr-2"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span className={cn(
                                    "text-xs text-slate-400 font-medium bg-white dark:bg-slate-900 px-1 relative top-[-8px]",
                                    hour === 0 && "hidden"
                                )}>
                                    {hour === 0 ? "" : `${hour}:00`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Columns */}
                    <div className="flex-1 relative min-w-0">
                        {/* Background Grid */}
                        <div className="absolute inset-0 flex">
                            {days.map((_, i) => (
                                <div key={i} className="flex-1 border-l border-slate-100 dark:border-slate-800 first:border-l-0 h-full relative">
                                    {/* Horizontal Lines inside column */}
                                    {HOURS.map((hour) => (
                                        <div
                                            key={hour}
                                            className="border-t border-slate-100 dark:border-slate-800/60 w-full absolute"
                                            style={{ top: `${hour * HOUR_HEIGHT}px` }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Current Time Indicator */}
                        {days.some(d => d.toDateString() === new Date().toDateString()) && (
                            <div
                                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                style={{ top: `${currentTimePosition}px` }}
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                                <div className="h-[2px] w-full bg-red-500" />
                            </div>
                        )}

                        {/* Events */}
                        {displayedSessions.map((session) => {
                            const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];

                            // Find which column (day) this session belongs to
                            const sessionDateStr = session.session_date;
                            const dayIndex = days.findIndex(d => format(d, 'yyyy-MM-dd') === sessionDateStr);

                            if (dayIndex === -1) return null;

                            return (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "rounded-md border-l-4 p-1 text-xs z-10 hover:z-20 transition-all cursor-pointer shadow-sm overflow-hidden m-0.5",
                                        status?.color === "green" ? "bg-green-100/90 border-green-500 text-green-900 dark:bg-green-900/50 dark:text-green-100" :
                                            status?.color === "blue" ? "bg-blue-100/90 border-blue-500 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100" :
                                                status?.color === "purple" ? "bg-purple-100/90 border-purple-500 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100" :
                                                    status?.color === "red" ? "bg-red-100/90 border-red-500 text-red-900 dark:bg-red-900/50 dark:text-red-100" :
                                                        "bg-slate-100/90 border-slate-500 text-slate-900 dark:bg-slate-800/50 dark:text-slate-100"
                                    )}
                                    style={getSessionStyle(session, dayIndex)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSessionClick(session);
                                    }}
                                >
                                    <div className="font-semibold truncate">
                                        {session.patients?.full_name}
                                    </div>
                                    <div className="truncate opacity-80 text-[10px]">
                                        {session.start_time}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Click listeners for empty slots */}
                        {/* We need listeners for EACH column */}
                        <div className="absolute inset-0 flex z-0">
                            {days.map((day, dIndex) => (
                                <div key={dIndex} className="flex-1 h-full relative">
                                    {Array.from({ length: 48 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full hover:bg-slate-50/10 dark:hover:bg-white/5 cursor-pointer"
                                            style={{
                                                top: `${i * (HOUR_HEIGHT / 2)}px`,
                                                height: `${HOUR_HEIGHT / 2}px`
                                            }}
                                            onClick={() => {
                                                const hour = Math.floor(i / 2);
                                                const min = (i % 2) * 30;
                                                const clickedDate = new Date(day);
                                                clickedDate.setHours(hour, min, 0, 0);
                                                onTimeSlotClick(clickedDate);
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
