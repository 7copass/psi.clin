"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    CalendarRange,
    Hash,
    Loader2,
    Sparkles,
    X,
    FileText,
    Filter,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";
import type { Session } from "@/lib/types/database";
import type { EvolucaoConsolidada } from "@/lib/types/database";
import {
    getEvolucoes,
    findExistingEvolucao,
    saveEvolucaoConsolidada,
} from "@/lib/actions/evolucao-consolidada";
import { EvolucaoConsolidadaDocument } from "./evolucao-consolidada-document";

interface ConsolidatedSummary {
    observacoes_iniciais: string;
    evolucao_emocional_comportamental: string;
    pontos_chave: string[];
    principais_intervencoes: Array<{
        intervencao: string;
        resultado: string;
    }>;
    citacoes_relevantes: string[];
}

interface MonthGroup {
    key: string;
    label: string;
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
            groups.set(key, { key, label, sessions: [] });
        }
        groups.get(key)!.sessions.push(session);
    }

    return Array.from(groups.values()).sort((a, b) =>
        b.key.localeCompare(a.key)
    );
}

function isSessionSelectable(session: Session): boolean {
    return (
        session.status === "completed" &&
        (!!session.smartnotes || !!session.evolution || !!session.notes)
    );
}

interface EvolucaoConsolidadaTabProps {
    patientId: string;
    patientName: string;
    sessions: Session[];
}

export function EvolucaoConsolidadaTab({
    patientId,
    patientName,
    sessions,
}: EvolucaoConsolidadaTabProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDoc, setGeneratedDoc] =
        useState<EvolucaoConsolidada | null>(null);
    const [existingDocs, setExistingDocs] = useState<EvolucaoConsolidada[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    // Compute years from available sessions
    const completedSessions = useMemo(() => sessions.filter(isSessionSelectable), [sessions]);

    const availableYears = useMemo(() => {
        const years = new Set(completedSessions.map(s => normalizeDate(s.session_date).split("-")[0]));
        return Array.from(years).sort().reverse();
    }, [completedSessions]);

    const [selectedYear, setSelectedYear] = useState<string>(
        availableYears.length > 0 ? availableYears[0] : new Date().getFullYear().toString()
    );

    // Update selectedYear if availableYears changes and current selection is invalid
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const filteredSessions = useMemo(() => {
        return completedSessions.filter(s => normalizeDate(s.session_date).startsWith(selectedYear));
    }, [completedSessions, selectedYear]);

    const monthGroups = useMemo(() => groupSessionsByMonth(filteredSessions), [filteredSessions]);

    // Load existing consolidations
    useEffect(() => {
        async function load() {
            const result = await getEvolucoes(patientId);
            if (result.data) {
                setExistingDocs(result.data);
                if (result.data.length > 0) {
                    setGeneratedDoc(result.data[0]);
                }
            }
            setIsLoadingDocs(false);
        }
        load();
    }, [patientId]);

    const selectableInMonth = useCallback(
        (group: MonthGroup) =>
            group.sessions.filter(isSessionSelectable).map((s) => s.id),
        []
    );

    const toggleSession = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleMonth = (group: MonthGroup) => {
        const ids = selectableInMonth(group);
        const allSelected = ids.every((id) => selectedIds.has(id));

        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                ids.forEach((id) => next.delete(id));
            } else {
                ids.forEach((id) => next.add(id));
            }
            return next;
        });
    };

    const toggleAll = () => {
        const allIds = completedSessions.map((s) => s.id);
        const allSelected = allIds.every((id) => selectedIds.has(id));

        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allIds));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleGenerate = async () => {
        if (selectedIds.size === 0) return;

        setIsGenerating(true);
        try {
            const sessionIdsArr = Array.from(selectedIds);

            // Check for existing
            const existing = await findExistingEvolucao(
                patientId,
                sessionIdsArr
            );
            if (existing) {
                setGeneratedDoc(existing);
                toast.success("Evolucao consolidada encontrada!");
                setIsGenerating(false);
                return;
            }

            // Generate new
            const response = await fetch("/api/ai/evolucao-consolidada", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId, sessionIds: sessionIdsArr }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Normalize period dates
            const periodoInicio = normalizeDate(data.periodoInicio);
            const periodoFim = normalizeDate(data.periodoFim);

            // Save to database
            const result = await saveEvolucaoConsolidada({
                patientId,
                titulo: `Evolucao Consolidada — ${patientName}`,
                periodoInicio,
                periodoFim,
                sessoesIncluidas: sessionIdsArr,
                conteudoJson: data.summary as Record<string, unknown>,
            });

            if (result.error) throw new Error(result.error);

            setGeneratedDoc(result.data!);
            setExistingDocs((prev) => [result.data!, ...prev]);
            toast.success("Evolucao consolidada gerada!");
        } catch (error) {
            console.error("Evolucao consolidada error:", error);
            toast.error("Erro ao gerar evolucao consolidada");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        if (!generatedDoc) return;

        setIsGenerating(true);
        try {
            const response = await fetch("/api/ai/evolucao-consolidada", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    sessionIds: generatedDoc.sessoes_incluidas,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Update existing record
            const result = await saveEvolucaoConsolidada({
                patientId,
                titulo: generatedDoc.titulo,
                periodoInicio: normalizeDate(data.periodoInicio),
                periodoFim: normalizeDate(data.periodoFim),
                sessoesIncluidas: generatedDoc.sessoes_incluidas,
                conteudoJson: data.summary as Record<string, unknown>,
            });

            if (result.error) throw new Error(result.error);

            setGeneratedDoc(result.data!);
            toast.success("Evolucao consolidada regenerada!");
        } catch (error) {
            console.error("Regenerate error:", error);
            toast.error("Erro ao regenerar");
        } finally {
            setIsGenerating(false);
        }
    };

    const allSelectableIds = completedSessions.map((s) => s.id);
    const allSelected =
        allSelectableIds.length > 0 &&
        allSelectableIds.every((id) => selectedIds.has(id));

    // Metrics from existing docs
    const lastDoc = existingDocs[0];

    if (completedSessions.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <div className="text-center py-12 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">
                        Nenhuma sessao concluida disponivel
                    </p>
                    <p className="text-sm mt-1">
                        Complete sessoes com anotacoes ou evolucoes para gerar
                        consolidacoes
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">
                                    Ultima consolidacao
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {lastDoc
                                        ? formatDate(lastDoc.created_at)
                                        : "Nenhuma"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                                <CalendarRange className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">
                                    Periodo das sessoes
                                </p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    {formatDate(
                                        completedSessions[
                                            completedSessions.length - 1
                                        ].session_date
                                    )}{" "}
                                    —{" "}
                                    {formatDate(
                                        completedSessions[0].session_date
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                                <Hash className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">
                                    Sessoes disponiveis
                                </p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {completedSessions.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={allSelected}
                            onCheckedChange={toggleAll}
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Selecionar tudo
                        </label>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Year Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                        >
                            <SelectTrigger className="w-[100px] h-8">
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <span className="text-sm text-slate-500 ml-2">
                        {selectedIds.size} selecionado(s)
                    </span>
                    {selectedIds.size > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Desmarcar
                        </Button>
                    )}
                </div>

                {selectedIds.size > 0 && (
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Gerar Consolidacao
                    </Button>
                )}
            </div>

            {/* Monthly Accordion with Checkboxes */}
            <Accordion
                type="multiple"
                defaultValue={monthGroups.map((g) => g.key)}
                className="space-y-2"
            >
                {monthGroups.map((group) => {
                    const selectableIds = selectableInMonth(group);
                    const selectedInMonth = selectableIds.filter((id) =>
                        selectedIds.has(id)
                    ).length;
                    const allMonthSelected =
                        selectableIds.length > 0 &&
                        selectableIds.every((id) => selectedIds.has(id));

                    return (
                        <AccordionItem
                            key={group.key}
                            value={group.key}
                            className="border rounded-xl px-4 bg-white dark:bg-slate-800"
                        >
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3 w-full">
                                    <Checkbox
                                        checked={allMonthSelected}
                                        onCheckedChange={(e) => {
                                            e; // prevent propagation handled by stopPropagation
                                            toggleMonth(group);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="font-semibold capitalize flex-1 text-left">
                                        {group.label}
                                    </span>
                                    <span className="text-sm text-slate-500 mr-2">
                                        {selectedInMonth}/{selectableIds.length}{" "}
                                        selecionado(s)
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pb-2">
                                    {group.sessions.map((session) => {
                                        const selectable =
                                            isSessionSelectable(session);
                                        return (
                                            <div
                                                key={session.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border ${selectable
                                                    ? "bg-slate-50 dark:bg-slate-700/30"
                                                    : "bg-slate-50/50 dark:bg-slate-700/10 opacity-50"
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={selectedIds.has(
                                                        session.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSession(
                                                            session.id
                                                        )
                                                    }
                                                    disabled={!selectable}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        Evolucao
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Sessao em{" "}
                                                        {formatDate(
                                                            session.session_date
                                                        )}
                                                        {session.start_time &&
                                                            ` ${session.start_time}`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Generated Document */}
            {isLoadingDocs && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-slate-500">
                        Carregando consolidacoes...
                    </span>
                </div>
            )}

            {generatedDoc && !isLoadingDocs && (
                <>
                    <Separator />
                    <EvolucaoConsolidadaDocument
                        patientName={patientName}
                        periodoInicio={generatedDoc.periodo_inicio}
                        periodoFim={generatedDoc.periodo_fim}
                        sessionsCount={
                            generatedDoc.sessoes_incluidas.length
                        }
                        content={
                            generatedDoc.conteudo_json as unknown as {
                                observacoes_iniciais: string;
                                evolucao_emocional_comportamental: string;
                                pontos_chave: string[];
                                principais_intervencoes: Array<{
                                    intervencao: string;
                                    resultado: string;
                                }>;
                                citacoes_relevantes: string[];
                            }
                        }
                        evolucaoId={generatedDoc.id}
                        onRegenerate={handleRegenerate}
                        isRegenerating={isGenerating}
                    />
                </>
            )}
        </div>
    );
}
