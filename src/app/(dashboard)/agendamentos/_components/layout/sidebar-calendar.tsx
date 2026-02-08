"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WEEKDAYS } from "@/lib/utils/constants";

interface SidebarCalendarProps {
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

export function SidebarCalendar({ onDateSelect, selectedDate }: SidebarCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();

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

    const navigateMonth = (direction: number) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    return (
        <div className="p-4 w-full max-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pl-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
                    {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => navigateMonth(-1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => navigateMonth(1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day.value}
                        className="text-center text-[10px] font-medium text-slate-400"
                    >
                        {day.short.charAt(0)}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 row-auto gap-y-2">
                {monthDays.map(({ date, isCurrentMonth }, i) => {
                    const isTodayLocal = isSameDay(date, today);
                    const isSelected = isSameDay(date, selectedDate);

                    return (
                        <div
                            key={i}
                            className="flex items-center justify-center cursor-pointer"
                            onClick={() => onDateSelect(date)}
                        >
                            <div
                                className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-full text-xs transition-all",
                                    !isCurrentMonth && "text-slate-300 dark:text-slate-700",
                                    isCurrentMonth && !isSelected && !isTodayLocal && "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                                    isTodayLocal && !isSelected && "bg-purple-600 text-white shadow-sm",
                                    isSelected && "bg-purple-100 text-purple-700 font-bold dark:bg-purple-900/50 dark:text-purple-300",
                                    isSelected && isTodayLocal && "bg-purple-600 text-white"
                                )}
                            >
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
