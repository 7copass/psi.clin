"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

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

interface EvolucaoConsolidadaDocumentProps {
    patientName: string;
    periodoInicio: string;
    periodoFim: string;
    sessionsCount: number;
    content: ConsolidatedSummary;
    evolucaoId?: string;
    onRegenerate: () => void;
    isRegenerating: boolean;
    title?: string;
}

export function EvolucaoConsolidadaDocument({
    patientName,
    periodoInicio,
    periodoFim,
    sessionsCount,
    content,
    evolucaoId,
    onRegenerate,
    isRegenerating,
    title,
}: EvolucaoConsolidadaDocumentProps) {
    const handleDownloadPdf = async () => {
        if (!evolucaoId) return;
        window.open(`/api/pdf/evolucao-consolidada?id=${evolucaoId}`, "_blank");
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {title || `Evolucao Consolidada de ${patientName}`}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Periodo: {formatDate(periodoInicio)} —{" "}
                        {formatDate(periodoFim)} | {sessionsCount}{" "}
                        {sessionsCount === 1 ? "sessao" : "sessoes"} analisadas
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    {evolucaoId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadPdf}
                        >
                            <Download className="h-4 w-4 mr-1.5" />
                            PDF
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                    >
                        {isRegenerating ? (
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-1.5" />
                        )}
                        Regenerar
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Observacoes Iniciais */}
            <div>
                <h4 className="font-semibold text-purple-600 text-sm uppercase tracking-wide mb-2">
                    Observacoes Iniciais
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {content.observacoes_iniciais}
                </p>
            </div>

            {/* Evolucao Emocional e Comportamental */}
            <div>
                <h4 className="font-semibold text-purple-600 text-sm uppercase tracking-wide mb-2">
                    Evolucao Emocional e Comportamental
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {content.evolucao_emocional_comportamental}
                </p>
            </div>

            {/* Pontos-chave */}
            {content.pontos_chave.length > 0 && (
                <div>
                    <h4 className="font-semibold text-purple-600 text-sm uppercase tracking-wide mb-2">
                        Pontos-Chave das Sessoes
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {content.pontos_chave.map((ponto, i) => (
                            <li key={i}>{ponto}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Principais Intervencoes */}
            {content.principais_intervencoes.length > 0 && (
                <div>
                    <h4 className="font-semibold text-purple-600 text-sm uppercase tracking-wide mb-2">
                        Principais Intervencoes
                    </h4>
                    <div className="space-y-2">
                        {content.principais_intervencoes.map((item, i) => (
                            <div
                                key={i}
                                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                            >
                                <p className="font-medium text-sm text-slate-900 dark:text-white">
                                    {item.intervencao}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Resultado: {item.resultado}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Citacoes Relevantes */}
            {content.citacoes_relevantes.length > 0 && (
                <div>
                    <h4 className="font-semibold text-purple-600 text-sm uppercase tracking-wide mb-2">
                        Citacoes Relevantes
                    </h4>
                    <div className="space-y-2">
                        {content.citacoes_relevantes.map((citacao, i) => (
                            <blockquote
                                key={i}
                                className="border-l-2 border-purple-300 dark:border-purple-600 pl-3 italic text-sm text-slate-600 dark:text-slate-300"
                            >
                                &ldquo;{citacao}&rdquo;
                            </blockquote>
                        ))}
                    </div>
                </div>
            )}

            <Separator />
            <p className="text-xs text-slate-400 text-center">
                Documento gerado por IA — Sujeito a revisao profissional
            </p>
        </div>
    );
}
