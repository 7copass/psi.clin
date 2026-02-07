"use client";

import Link from "next/link";
import { Clock, MapPin, Video, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { SESSION_STATUS, SESSION_TYPES } from "@/lib/utils/constants";
import { updateSessionStatus } from "@/lib/actions/sessions";
import { toast } from "sonner";
import type { Session } from "@/lib/types/database";

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

interface DaySessionsProps {
    sessions: SessionWithPatient[];
    selectedDate: string;
    onRefresh: () => void;
}

export function DaySessions({ sessions, selectedDate, onRefresh }: DaySessionsProps) {
    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr + "T12:00:00");
        return date.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    const handleStatusUpdate = async (
        sessionId: string,
        status: "confirmed" | "cancelled" | "no_show" | "completed"
    ) => {
        const result = await updateSessionStatus(sessionId, status);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Status atualizado");
            onRefresh();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border h-full">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                    {formatDisplayDate(selectedDate)}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    {sessions.length} {sessions.length === 1 ? "sessão" : "sessões"} agendadas
                </p>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {sessions.length > 0 ? (
                    sessions.map((session) => {
                        const status =
                            SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                        const sessionType =
                            SESSION_TYPES[session.session_type as keyof typeof SESSION_TYPES];

                        return (
                            <div
                                key={session.id}
                                className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 hover:border-purple-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <Link
                                            href={`/sessoes/${session.id}`}
                                            className="font-medium text-slate-900 dark:text-white hover:text-purple-600"
                                        >
                                            {session.patients?.full_name || "Paciente"}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                            <Clock className="h-4 w-4" />
                                            <span>{session.start_time || "Horário não definido"}</span>
                                            {session.end_time && (
                                                <>
                                                    <span>-</span>
                                                    <span>{session.end_time}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        className={cn(
                                            status?.color === "green" && "bg-green-100 text-green-700",
                                            status?.color === "blue" && "bg-blue-100 text-blue-700",
                                            status?.color === "purple" && "bg-purple-100 text-purple-700",
                                            status?.color === "red" && "bg-red-100 text-red-700",
                                            status?.color === "orange" && "bg-orange-100 text-orange-700"
                                        )}
                                    >
                                        {status?.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    <div className="flex items-center gap-1">
                                        {sessionType?.icon === "Video" ? (
                                            <Video className="h-4 w-4" />
                                        ) : (
                                            <MapPin className="h-4 w-4" />
                                        )}
                                        <span>{sessionType?.label}</span>
                                    </div>
                                    {session.value && (
                                        <span className="font-medium">
                                            {formatCurrency(session.value)}
                                        </span>
                                    )}
                                </div>

                                {session.status !== "completed" && session.status !== "cancelled" && (
                                    <div className="flex items-center gap-2">
                                        {session.status === "scheduled" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-purple-600 border-purple-200"
                                                onClick={() => handleStatusUpdate(session.id, "confirmed")}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Confirmar
                                            </Button>
                                        )}
                                        {(session.status === "scheduled" ||
                                            session.status === "confirmed") && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 border-green-200"
                                                        onClick={() => handleStatusUpdate(session.id, "completed")}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Realizada
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="ghost">
                                                                <AlertCircle className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(session.id, "no_show")}
                                                                className="text-orange-600"
                                                            >
                                                                Paciente faltou
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusUpdate(session.id, "cancelled")
                                                                }
                                                                className="text-red-600"
                                                            >
                                                                Cancelar sessão
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </>
                                            )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma sessão neste dia</p>
                    </div>
                )}
            </div>
        </div>
    );
}
