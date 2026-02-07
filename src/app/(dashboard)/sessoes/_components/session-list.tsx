"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, User, Video, MapPin, MoreVertical, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { SESSION_STATUS, SESSION_TYPES, PAYMENT_STATUS } from "@/lib/utils/constants";
import type { Session } from "@/lib/types/database";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

interface SessionListProps {
    sessions: SessionWithPatient[];
}

export function SessionList({ sessions }: SessionListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const today = new Date().toISOString().split("T")[0];

    // Helper to extract date part from session_date (handles both timestamp and date string)
    const getDatePart = (dateValue: string): string => {
        return dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
    };

    const filteredSessions = sessions.filter((session) => {
        const sessionDatePart = getDatePart(session.session_date);

        const matchesSearch =
            session.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sessionDatePart.includes(searchTerm);

        const matchesTab =
            activeTab === "all" ||
            (activeTab === "today" && sessionDatePart === today) ||
            (activeTab === "upcoming" && sessionDatePart > today && session.status !== "cancelled") ||
            (activeTab === "completed" && session.status === "completed") ||
            (activeTab === "cancelled" && session.status === "cancelled");

        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Input
                    type="search"
                    placeholder="Buscar por paciente ou data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm bg-white dark:bg-slate-800"
                />
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="today">Hoje</TabsTrigger>
                        <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                        <TabsTrigger value="completed">Realizadas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {filteredSessions.length > 0 ? (
                <div className="space-y-3">
                    {filteredSessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Calendar}
                    title="Nenhuma sessão encontrada"
                    description={
                        searchTerm
                            ? `Nenhum resultado para "${searchTerm}"`
                            : "Agende sua primeira sessão para começar"
                    }
                />
            )}
        </div>
    );
}

function SessionCard({ session }: { session: SessionWithPatient }) {
    const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
    const sessionType = SESSION_TYPES[session.session_type as keyof typeof SESSION_TYPES];
    const paymentStatus = PAYMENT_STATUS[session.payment_status as keyof typeof PAYMENT_STATUS];

    // Helper to safely parse session_date (could be timestamp or date string)
    const getSessionDate = (dateValue: string): Date => {
        // If it's a full timestamp, extract just the date part
        const dateString = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
        return new Date(dateString + "T12:00:00");
    };

    const sessionDate = getSessionDate(session.session_date);
    const today = new Date().toISOString().split("T")[0];
    const sessionDateString = session.session_date.includes("T")
        ? session.session_date.split("T")[0]
        : session.session_date;
    const isPast = sessionDateString < today;
    const isToday = sessionDateString === today;

    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-xl border p-4 hover:shadow-md transition-shadow ${isToday ? "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10" : ""
                }`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Date Badge */}
                    <div
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${isToday
                            ? "bg-purple-600 text-white"
                            : isPast
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-500"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            }`}
                    >
                        <span className="text-xs font-medium uppercase">
                            {sessionDate.toLocaleDateString("pt-BR", {
                                month: "short",
                            })}
                        </span>
                        <span className="text-xl font-bold">
                            {sessionDate.getDate()}
                        </span>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/sessoes/${session.id}`}
                            className="font-semibold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate block"
                        >
                            {session.patients?.full_name || "Paciente"}
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            {session.start_time && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.start_time}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                {sessionType?.icon === "Video" ? (
                                    <Video className="h-3 w-3" />
                                ) : (
                                    <MapPin className="h-3 w-3" />
                                )}
                                {sessionType?.label || "Presencial"}
                            </span>
                            {session.duration_minutes && (
                                <span>{session.duration_minutes} min</span>
                            )}
                        </div>
                    </div>

                    {/* Status & Value */}
                    <div className="hidden md:flex items-center gap-3">
                        {status && (
                            <Badge
                                variant={status.color === "green" ? "default" : "secondary"}
                                className={
                                    status.color === "green"
                                        ? "bg-green-100 text-green-700"
                                        : status.color === "red"
                                            ? "bg-red-100 text-red-700"
                                            : ""
                                }
                            >
                                {status.label}
                            </Badge>
                        )}
                        {session.value && (
                            <div className="flex items-center gap-1 text-sm">
                                <DollarSign className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{formatCurrency(session.value)}</span>
                                {paymentStatus && (
                                    <Badge
                                        variant="outline"
                                        className={
                                            paymentStatus.color === "green"
                                                ? "border-green-300 text-green-600 text-xs"
                                                : paymentStatus.color === "yellow"
                                                    ? "border-yellow-300 text-yellow-600 text-xs"
                                                    : "text-xs"
                                        }
                                    >
                                        {paymentStatus.label}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/sessoes/${session.id}`}>Ver detalhes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/sessoes/${session.id}/editar`}>Editar</Link>
                        </DropdownMenuItem>
                        {session.status !== "completed" && (
                            <DropdownMenuItem>Marcar como realizada</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Cancelar sessão</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
