import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquareQuote, FileText } from "lucide-react";

interface SmartNotesData {
    mapa_topicos: string[];
    topicos: Array<{
        titulo: string;
        resumo: string;
        citacoes: Array<{
            texto: string;
            falante: string;
        }>;
    }>;
}

interface SmartNotesViewProps {
    smartnotes: Record<string, unknown> | null;
}

export function SmartNotesView({ smartnotes }: SmartNotesViewProps) {
    if (!smartnotes) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">SmartNotes nao disponivel</p>
                <p className="text-sm mt-1">
                    Grave e transcreva o audio da sessao para gerar SmartNotes
                </p>
            </div>
        );
    }

    const data = smartnotes as unknown as SmartNotesData;

    return (
        <div className="space-y-6 py-2">
            {/* Mapa de Topicos */}
            {data.mapa_topicos && data.mapa_topicos.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                        Mapa de Topicos
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.mapa_topicos.map((topico, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                                {topico}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* Topicos */}
            {data.topicos &&
                data.topicos.map((topico, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-6 bg-purple-500 rounded-full mt-0.5 shrink-0" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                {topico.titulo}
                            </h4>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-3">
                            {topico.resumo}
                        </p>

                        {topico.citacoes && topico.citacoes.length > 0 && (
                            <div className="pl-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                    <MessageSquareQuote className="h-3 w-3" />
                                    Citacoes-chave
                                </p>
                                {topico.citacoes.map((citacao, j) => (
                                    <blockquote
                                        key={j}
                                        className="border-l-2 border-purple-300 dark:border-purple-600 pl-3 py-1"
                                    >
                                        <p className="text-sm italic text-slate-600 dark:text-slate-300">
                                            &ldquo;{citacao.texto}&rdquo;
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            — {citacao.falante}
                                        </p>
                                    </blockquote>
                                ))}
                            </div>
                        )}

                        {i < data.topicos.length - 1 && <Separator className="my-4" />}
                    </div>
                ))}
        </div>
    );
}
