import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, User, Stethoscope, Calendar, MapPin, Video } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { SESSION_TYPES } from "@/lib/utils/constants";

interface EvolutionViewProps {
    evolution: string | null;
    patientName: string;
    professionalName: string;
    professionalCrp: string;
    sessionDate: string;
    sessionType: string;
}

interface EvolutionSection {
    title: string;
    content: string;
}

function parseEvolutionHtml(html: string): EvolutionSection[] {
    const sections: EvolutionSection[] = [];
    const regex = /<h3>(.*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        sections.push({
            title: match[1].trim(),
            content: match[2].trim(),
        });
    }
    return sections;
}

export function EvolutionView({
    evolution,
    patientName,
    professionalName,
    professionalCrp,
    sessionDate,
    sessionType,
}: EvolutionViewProps) {
    if (!evolution) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">Prontuario nao disponivel</p>
                <p className="text-sm mt-1">
                    Gere a ficha de evolucao na pagina da sessao
                </p>
            </div>
        );
    }

    const sections = parseEvolutionHtml(evolution);
    const typeInfo = SESSION_TYPES[sessionType as keyof typeof SESSION_TYPES];

    return (
        <div className="space-y-6 py-2">
            {/* Header formal */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Ficha de Evolucao
                    </h3>
                </div>
                <Separator />
                <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Paciente:</span>
                        <span className="font-medium">{patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Profissional:</span>
                        <span className="font-medium">
                            {professionalName}
                            {professionalCrp && ` — CRP: ${professionalCrp}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Data da Sessao:</span>
                        <span className="font-medium">{formatDate(sessionDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {typeInfo?.icon === "Video" ? (
                            <Video className="h-4 w-4 text-slate-400" />
                        ) : (
                            <MapPin className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-slate-500">Consulta:</span>
                        <Badge variant="secondary">
                            {typeInfo?.label || "Presencial"}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Secoes */}
            {sections.length > 0 ? (
                <div className="space-y-5">
                    {sections.map((section, i) => (
                        <div key={i}>
                            <h4 className="font-semibold text-purple-600 text-sm uppercase tracking-wide mb-2">
                                {section.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {section.content}
                            </p>
                            {i < sections.length - 1 && (
                                <Separator className="mt-4" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div
                        className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: evolution }}
                    />
                </div>
            )}
        </div>
    );
}
