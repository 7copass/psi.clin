"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, Video, MapPin } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { SESSION_STATUS, SESSION_TYPES } from "@/lib/utils/constants";
import type { Session } from "@/lib/types/database";

interface MonthGroup {
    key: string;
    label: string;
    count: number;
    sessions: Session[];
}

interface SessionMonthAccordionProps {
    monthGroups: MonthGroup[];
    onViewAnotacao: (session: Session) => void;
    onViewProntuario: (session: Session) => void;
}

function getStatusBadge(status: string) {
    const statusInfo = SESSION_STATUS[status as keyof typeof SESSION_STATUS];
    if (!statusInfo) return <Badge variant="secondary">{status}</Badge>;

    const colorClasses: Record<string, string> = {
        green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };

    return (
        <Badge
            variant="secondary"
            className={colorClasses[statusInfo.color] || ""}
        >
            {statusInfo.label}
        </Badge>
    );
}

export function SessionMonthAccordion({
    monthGroups,
    onViewAnotacao,
    onViewProntuario,
}: SessionMonthAccordionProps) {
    if (monthGroups.length === 0) return null;

    return (
        <Accordion
            type="multiple"
            defaultValue={[monthGroups[0].key]}
            className="space-y-2"
        >
            {monthGroups.map((group) => (
                <AccordionItem
                    key={group.key}
                    value={group.key}
                    className="border rounded-xl px-4 bg-white dark:bg-slate-800"
                >
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">
                        <span className="capitalize">
                            {group.label} ({group.count}{" "}
                            {group.count === 1 ? "sessao" : "sessoes"})
                        </span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pb-2">
                            {group.sessions.map((session) => {
                                const typeInfo =
                                    SESSION_TYPES[
                                        session.session_type as keyof typeof SESSION_TYPES
                                    ];
                                const hasSmartNotes = !!session.smartnotes;
                                const hasEvolution = !!session.evolution;

                                return (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-700/30 gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {formatDate(session.session_date)}
                                                </p>
                                                {session.start_time && (
                                                    <span className="text-sm text-slate-500">
                                                        as {session.start_time}
                                                        {session.end_time &&
                                                            ` - ${session.end_time}`}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                {getStatusBadge(session.status)}
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    {typeInfo?.icon === "Video" ? (
                                                        <Video className="h-3 w-3" />
                                                    ) : (
                                                        <MapPin className="h-3 w-3" />
                                                    )}
                                                    {typeInfo?.label || "Presencial"}
                                                </span>
                                                {session.value != null && session.value > 0 && (
                                                    <span className="text-xs text-slate-500">
                                                        {formatCurrency(session.value)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewAnotacao(session)}
                                                disabled={!hasSmartNotes}
                                                title={
                                                    hasSmartNotes
                                                        ? "Ver anotacao"
                                                        : "SmartNotes nao gerada"
                                                }
                                            >
                                                <FileText className="h-4 w-4 mr-1.5" />
                                                <span className="hidden sm:inline">Anotacao</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewProntuario(session)}
                                                disabled={!hasEvolution}
                                                title={
                                                    hasEvolution
                                                        ? "Ver prontuario"
                                                        : "Evolucao nao gerada"
                                                }
                                            >
                                                <ClipboardList className="h-4 w-4 mr-1.5" />
                                                <span className="hidden sm:inline">Prontuario</span>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
