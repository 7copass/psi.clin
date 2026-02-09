"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Session, Patient } from "@/lib/types/database";
import { SessionMetricsCards } from "./session-metrics-cards";
import { SessionMonthAccordion } from "./session-month-accordion";
import { SessionDetailDialog } from "./session-detail-dialog";

interface MonthGroup {
    key: string;
    label: string;
    count: number;
    sessions: Session[];
}

function normalizeDate(dateStr: string): string {
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
}

function groupSessionsByMonth(sessions: Session[]): MonthGroup[] {
    const groups = new Map<string, MonthGroup>();

    for (const session of sessions) {
        const dateStr = normalizeDate(session.session_date);
        const date = parseISO(dateStr);
        const key = format(date, "yyyy-MM");
        const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });

        if (!groups.has(key)) {
            groups.set(key, { key, label, count: 0, sessions: [] });
        }
        const group = groups.get(key)!;
        group.sessions.push(session);
        group.count++;
    }

    return Array.from(groups.values()).sort((a, b) =>
        b.key.localeCompare(a.key)
    );
}

interface SessionsTabProps {
    sessions: Session[];
    patient: Patient;
    professionalName: string;
    professionalCrp: string;
}

export function SessionsTab({
    sessions,
    patient,
    professionalName,
    professionalCrp,
}: SessionsTabProps) {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [activeTab, setActiveTab] = useState<"anotacao" | "prontuario">(
        "anotacao"
    );
    const [dialogOpen, setDialogOpen] = useState(false);

    const monthGroups = groupSessionsByMonth(sessions);

    const openSessionDetail = (
        session: Session,
        tab: "anotacao" | "prontuario"
    ) => {
        setSelectedSession(session);
        setActiveTab(tab);
        setDialogOpen(true);
    };

    if (sessions.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <div className="text-center py-12 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Nenhuma sessao registrada</p>
                    <p className="text-sm mt-1">
                        Agende a primeira sessao com este paciente
                    </p>
                    <Button
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                        asChild
                    >
                        <Link href={`/sessoes/nova?paciente=${patient.id}`}>
                            Nova Sessao
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Compute metrics
    const sorted = [...sessions].sort((a, b) =>
        normalizeDate(a.session_date).localeCompare(
            normalizeDate(b.session_date)
        )
    );
    const firstDate = sorted[0].session_date;
    const lastDate = sorted[sorted.length - 1].session_date;

    return (
        <div className="space-y-6">
            <SessionMetricsCards
                lastSession={lastDate}
                periodFrom={firstDate}
                periodTo={lastDate}
                totalSessions={sessions.length}
            />

            <SessionMonthAccordion
                monthGroups={monthGroups}
                onViewAnotacao={(session) =>
                    openSessionDetail(session, "anotacao")
                }
                onViewProntuario={(session) =>
                    openSessionDetail(session, "prontuario")
                }
            />

            <SessionDetailDialog
                session={selectedSession}
                patient={patient}
                professionalName={professionalName}
                professionalCrp={professionalCrp}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
