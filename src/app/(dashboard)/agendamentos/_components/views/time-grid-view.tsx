"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { differenceInMinutes, startOfDay, addMinutes, format } from "date-fns";
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

export function TimeGridView({ date, selectedDateStr, sessions, view, onTimeSlotClick, onSessionClick }: TimeGridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTimePosition, setCurrentTimePosition] = useState(0);

    // Debug: Inspect dates
    useEffect(() => {
        if (sessions.length > 0) {
            console.log("DEBUG SESSIONS DATES:", sessions.map(s => ({
                id: s.id,
                dateRaw: s.session_date,
                start: s.start_time,
                match: s.session_date === selectedDateStr,
                target: selectedDateStr
            })));
        }
    }, [sessions, selectedDateStr]);

    // Filter sessions for the displayed day(s)
    const displayedSessions = sessions.filter(session => {
        // Simple filter for 'day' view for now. 'week' logic would go here.
        if (view === 'day') {
            // Robust comparison: check if string matches or starts with (in case of timestamp)
            return session.session_date === selectedDateStr || session.session_date?.startsWith(selectedDateStr);
        }
        return false; // TODO: Week logic
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

    const getSessionStyle = (session: SessionWithPatient) => {
        if (!session.start_time) return {};
        const [hours, minutes] = session.start_time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const top = (startMinutes / 60) * HOUR_HEIGHT;

        // Calculate height based on end_time or default to 1 hour
        let duration = 60;
        if (session.end_time) {
            const [endH, endM] = session.end_time.split(':').map(Number);
            const endMinutes = endH * 60 + endM;
            duration = endMinutes - startMinutes;
        }

        const height = (duration / 60) * HOUR_HEIGHT;

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: '4px',
            right: '12px'
        };
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
            {/* Header (All day section - simplified) */}
            <div className="flex-none border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex h-12 items-center px-4">
                    {/* Could put all-day events here */}
                </div>
            </div>

            {/* Scrollable Time Grid */}
            <div ref={containerRef} className="flex-auto overflow-y-auto relative custom-scrollbar">
                <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                    {/* Time Labels Column */}
                    <div className="w-16 flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky left-0 z-10">
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="relative text-right pr-2"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span className={cn(
                                    "text-xs text-slate-400 font-medium relative -top-2.5 bg-white dark:bg-slate-900 px-1",
                                    hour === 0 && "hidden" // Hide 00:00 label at very top if wanted
                                )}>
                                    {hour === 0 ? "" : `${hour}:00`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Lines & Events Column */}
                    <div className="flex-auto relative min-w-0">
                        {/* Horizontal Grid Lines */}
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="border-t border-slate-100 dark:border-slate-800/60 w-full absolute left-0"
                                style={{ top: `${hour * HOUR_HEIGHT}px` }}
                            />
                        ))}

                        {/* Current Time Indicator */}
                        {date.toDateString() === new Date().toDateString() && (
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
                            return (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "absolute rounded-lg border-l-4 p-2 text-xs hover:z-20 transition-all cursor-pointer shadow-sm overflow-hidden",
                                        status?.color === "green" ? "bg-green-100/90 border-green-500 text-green-900 dark:bg-green-900/50 dark:text-green-100" :
                                            status?.color === "blue" ? "bg-blue-100/90 border-blue-500 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100" :
                                                status?.color === "purple" ? "bg-purple-100/90 border-purple-500 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100" :
                                                    status?.color === "red" ? "bg-red-100/90 border-red-500 text-red-900 dark:bg-red-900/50 dark:text-red-100" :
                                                        "bg-slate-100/90 border-slate-500 text-slate-900 dark:bg-slate-800/50 dark:text-slate-100"
                                    )}
                                    style={getSessionStyle(session)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSessionClick(session);
                                    }}
                                >
                                    <div className="font-semibold truncate">
                                        {session.patients?.full_name}
                                    </div>
                                    <div className="truncate opacity-80">
                                        {session.start_time} - {session.end_time || "..."}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Click listeners for empty slots (every 30 mins) */}
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full z-0 hover:bg-slate-50/5 dark:hover:bg-white/5 cursor-pointer"
                                style={{
                                    top: `${i * (HOUR_HEIGHT / 2)}px`,
                                    height: `${HOUR_HEIGHT / 2}px`
                                }}
                                onClick={() => {
                                    const hour = Math.floor(i / 2);
                                    const min = (i % 2) * 30;
                                    const clickedDate = new Date(date);
                                    clickedDate.setHours(hour, min, 0, 0);
                                    onTimeSlotClick(clickedDate);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
