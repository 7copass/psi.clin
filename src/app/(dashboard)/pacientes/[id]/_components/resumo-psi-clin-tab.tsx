"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/types/database";
import type { EvolucaoConsolidada } from "@/lib/types/database";
import {
    findExistingEvolucao,
    saveEvolucaoConsolidada,
    getEvolucoes
} from "@/lib/actions/evolucao-consolidada";
import { EvolucaoConsolidadaDocument } from "./evolucao-consolidada-document";

function normalizeDate(dateStr: string): string {
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
}

interface ResumoPsiClinTabProps {
    patientId: string;
    patientName: string;
    sessions: Session[];
}

export function ResumoPsiClinTab({
    patientId,
    patientName,
    sessions,
}: ResumoPsiClinTabProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [summaryDoc, setSummaryDoc] = useState<EvolucaoConsolidada | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filter relevant sessions
    const completedSessions = useMemo(() =>
        sessions.filter(s => s.status === "completed" && (!!s.smartnotes || !!s.evolution || !!s.notes)),
        [sessions]
    );

    // Load latest summary
    useEffect(() => {
        async function load() {
            try {
                // Try to find a summary specifically titled "Resumo PSI.CLIN" first?
                // Or just get the latest one. 
                // For now, let's look for any existing evolution, but ideally we'd tag them.
                // We'll just grab the most recent one.
                const result = await getEvolucoes(patientId);
                if (result.data && result.data.length > 0) {
                    setSummaryDoc(result.data[0]);
                }
            } catch (error) {
                console.error("Error loading summary:", error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [patientId]);

    const handleGenerate = async () => {
        if (completedSessions.length === 0) {
            toast.error("Não há sessões suficientes para gerar um resumo.");
            return;
        }

        setIsGenerating(true);
        try {
            const sessionIdsArr = completedSessions.map(s => s.id);

            // Check for existing exact match (optimization)
            const existing = await findExistingEvolucao(patientId, sessionIdsArr);
            if (existing) {
                setSummaryDoc(existing);
                toast.success("Resumo encontrado!");
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

            // Save
            const result = await saveEvolucaoConsolidada({
                patientId,
                titulo: `Resumo das Sessões de ${patientName}`,
                periodoInicio: normalizeDate(data.periodoInicio),
                periodoFim: normalizeDate(data.periodoFim),
                sessoesIncluidas: sessionIdsArr,
                conteudoJson: data.summary as Record<string, unknown>,
            });

            if (result.error) throw new Error(result.error);

            setSummaryDoc(result.data!);
            toast.success("Resumo PSI.CLIN gerado com sucesso!");
        } catch (error) {
            console.error("Error generating resumo:", error);
            toast.error("Erro ao gerar Resumo PSI.CLIN");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        if (!summaryDoc) return;
        // Reuse handleGenerate logic effectively but force regeneration? 
        // For simplistic implementation, just call handleGenerate which checks for existing.
        // But we want to FORCE new AI generation.

        setIsGenerating(true);
        try {
            const response = await fetch("/api/ai/evolucao-consolidada", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    sessionIds: summaryDoc.sessoes_incluidas
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            const result = await saveEvolucaoConsolidada({
                patientId,
                titulo: summaryDoc.titulo, // Keep original title
                periodoInicio: normalizeDate(data.periodoInicio),
                periodoFim: normalizeDate(data.periodoFim),
                sessoesIncluidas: summaryDoc.sessoes_incluidas,
                conteudoJson: data.summary as Record<string, unknown>,
            });

            if (result.error) throw new Error(result.error);

            setSummaryDoc(result.data!);
            toast.success("Resumo regenerado!");
        } catch (error) {
            toast.error("Erro ao regenerar resumo");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-slate-500">Carregando resumo...</p>
            </div>
        );
    }

    if (!summaryDoc) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-12 text-center space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Resumo PSI.CLIN
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gere um resumo inteligente de todo o histórico do paciente,
                        identificando padrões e progressos com Inteligência Artificial.
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleGenerate}
                    disabled={isGenerating || completedSessions.length === 0}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Gerando Análise...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Gerar Resumo Completo
                        </>
                    )}
                </Button>
                {completedSessions.length === 0 && (
                    <p className="text-xs text-red-500">
                        Necessário ter sessões concluídas com anotações.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <EvolucaoConsolidadaDocument
                title={`Resumo das Sessões de ${patientName}`}
                patientName={patientName}
                periodoInicio={summaryDoc.periodo_inicio}
                periodoFim={summaryDoc.periodo_fim}
                sessionsCount={summaryDoc.sessoes_incluidas.length}
                content={
                    summaryDoc.conteudo_json as unknown as {
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
                evolucaoId={summaryDoc.id}
                onRegenerate={handleRegenerate}
                isRegenerating={isGenerating}
            />
        </div>
    );
}
