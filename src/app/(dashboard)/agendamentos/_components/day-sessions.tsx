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
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white capitalize">
                    {formatDisplayDate(selectedDate)}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs">
                        {sessions.length}
                    </span>
                    {sessions.length === 1 ? "sessão agendada" : "sessões agendadas"}
                </p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {sessions.length > 0 ? (
                    <div className="space-y-6 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gradient-to-b from-purple-200 via-purple-100 to-transparent dark:from-purple-900 dark:via-purple-900/20 dark:to-transparent" />

                        {sessions.map((session, index) => {
                            const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
                            const sessionType = SESSION_TYPES[session.session_type as keyof typeof SESSION_TYPES];

                            return (
                                <div key={session.id} className="relative pl-10 group">
                                    {/* Timeline Dot */}
                                    <div className={cn(
                                        "absolute left-0 top-1.5 w-[40px] h-[40px] rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center transition-all z-10",
                                        status?.color === "green" ? "bg-green-100 text-green-600" :
                                            status?.color === "blue" ? "bg-blue-100 text-blue-600" :
                                                status?.color === "purple" ? "bg-purple-100 text-purple-600" :
                                                    status?.color === "red" ? "bg-red-100 text-red-600" :
                                                        "bg-slate-100 text-slate-600"
                                    )}>
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            status?.color === "green" ? "bg-green-500" :
                                                status?.color === "blue" ? "bg-blue-500" :
                                                    status?.color === "purple" ? "bg-purple-500" :
                                                        status?.color === "red" ? "bg-red-500" :
                                                            "bg-slate-400"
                                        )} />
                                    </div>

                                    {/* Card */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group-hover:border-purple-200 dark:group-hover:border-purple-900/50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <Link
                                                    href={`/sessoes/${session.id}`}
                                                    className="font-bold text-slate-800 dark:text-white hover:text-purple-600 text-lg transition-colors block mb-1"
                                                >
                                                    {session.patients?.full_name || "Paciente"}
                                                </Link>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                        <Clock className="h-3.5 w-3.5 text-purple-500" />
                                                        <span>{session.start_time} - {session.end_time || "?"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(session.id, "confirmed")} className="text-purple-600 font-medium">
                                                        <CheckCircle className="h-4 w-4 mr-2" /> Confirmar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(session.id, "completed")} className="text-green-600 font-medium">
                                                        <CheckCircle className="h-4 w-4 mr-2" /> Realizada
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(session.id, "no_show")} className="text-orange-600">
                                                        Paciente faltou
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(session.id, "cancelled")} className="text-red-600">
                                                        <XCircle className="h-4 w-4 mr-2" /> Cancelar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <Badge variant="outline" className={cn(
                                                "border-0 px-2.5 py-0.5 font-medium rounded-full text-xs",
                                                status?.color === "green" && "bg-green-50 text-green-700",
                                                status?.color === "blue" && "bg-blue-50 text-blue-700",
                                                status?.color === "purple" && "bg-purple-50 text-purple-700",
                                                status?.color === "red" && "bg-red-50 text-red-700",
                                                status?.color === "orange" && "bg-orange-50 text-orange-700"
                                            )}>
                                                {status?.label}
                                            </Badge>

                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-full">
                                                {sessionType?.icon === "Video" ? (
                                                    <Video className="h-3 w-3" />
                                                ) : (
                                                    <MapPin className="h-3 w-3" />
                                                )}
                                                <span>{sessionType?.label}</span>
                                            </div>
                                        </div>

                                        {session.status === "scheduled" && (
                                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs font-medium rounded-lg"
                                                    onClick={() => handleStatusUpdate(session.id, "confirmed")}
                                                >
                                                    Confirmar presença
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Dia livre</h4>
                        <p className="text-sm text-slate-500 max-w-[200px] mt-2">
                            Nenhum agendamento para este dia. Aproveite para descansar ou organizar seus estudos.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-6 border-dashed"
                            onClick={() => {
                                // This could trigger the new appointment dialog if we passed the handler
                                // For now, the "+" button in header is the main way
                            }}
                        >
                            Agendar neste dia
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
