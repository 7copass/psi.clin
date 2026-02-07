"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

interface SummaryButtonProps {
    patientId: string;
    patientName: string;
    sessionsCount: number;
}

export function SummaryButton({
    patientId,
    patientName,
    sessionsCount,
}: SummaryButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<ConsolidatedSummary | null>(null);
    const [open, setOpen] = useState(false);

    const generateSummary = async () => {
        if (sessionsCount < 2) {
            toast.error("São necessárias pelo menos 2 sessões para gerar o resumo");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSummary(data.summary);
            toast.success("Resumo gerado!");
        } catch (error) {
            console.error("Summary error:", error);
            toast.error("Erro ao gerar resumo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    onClick={() => {
                        setOpen(true);
                        if (!summary) generateSummary();
                    }}
                    disabled={sessionsCount < 2}
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Resumo IA
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Resumo Consolidado - {patientName}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-slate-500">Analisando histórico...</span>
                    </div>
                ) : summary ? (
                    <div className="space-y-6 text-sm">
                        {/* Observações Iniciais */}
                        <div>
                            <h4 className="font-semibold text-purple-600 mb-2">
                                Observações Iniciais
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300">
                                {summary.observacoes_iniciais}
                            </p>
                        </div>

                        {/* Evolução */}
                        <div>
                            <h4 className="font-semibold text-purple-600 mb-2">
                                Evolução Emocional e Comportamental
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300">
                                {summary.evolucao_emocional_comportamental}
                            </p>
                        </div>

                        {/* Pontos-chave */}
                        {summary.pontos_chave.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-purple-600 mb-2">
                                    Pontos-chave
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                                    {summary.pontos_chave.map((ponto, i) => (
                                        <li key={i}>{ponto}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Intervenções */}
                        {summary.principais_intervencoes.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-purple-600 mb-2">
                                    Principais Intervenções
                                </h4>
                                <div className="space-y-2">
                                    {summary.principais_intervencoes.map((item, i) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                                        >
                                            <p className="font-medium">{item.intervencao}</p>
                                            <p className="text-slate-500 text-xs mt-1">
                                                Resultado: {item.resultado}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Citações */}
                        {summary.citacoes_relevantes.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-purple-600 mb-2">
                                    Citações Relevantes
                                </h4>
                                <div className="space-y-2">
                                    {summary.citacoes_relevantes.map((citacao, i) => (
                                        <blockquote
                                            key={i}
                                            className="border-l-2 border-purple-300 pl-3 italic text-slate-600 dark:text-slate-300"
                                        >
                                            &ldquo;{citacao}&rdquo;
                                        </blockquote>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t flex justify-between items-center">
                            <p className="text-xs text-slate-400">
                                Baseado em {sessionsCount} sessões
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateSummary}
                                disabled={isLoading}
                            >
                                Regenerar
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
