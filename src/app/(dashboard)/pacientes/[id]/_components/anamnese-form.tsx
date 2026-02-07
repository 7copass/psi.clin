"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { saveAnamnese, type AnamneseContent } from "@/lib/actions/anamnese";

interface AnamneseFormProps {
    patientId: string;
    initialData?: AnamneseContent | null;
}

const defaultContent: AnamneseContent = {
    queixa_principal: "",
    inicio_sintomas: "",
    fatores_desencadeantes: "",
    historia_pessoal: "",
    historico_familiar: "",
    relacionamentos: "",
    tratamentos_anteriores: "",
    medicamentos_atuais: "",
    internacoes: "",
    expectativas_tratamento: "",
    objetivos_terapeuticos: "",
    observacoes_iniciais: "",
};

const fields: Array<{
    section: string;
    fields: Array<{ key: keyof AnamneseContent; label: string; placeholder: string }>;
}> = [
        {
            section: "Queixa Principal",
            fields: [
                {
                    key: "queixa_principal",
                    label: "Queixa Principal",
                    placeholder: "Descreva o motivo da busca por tratamento...",
                },
                {
                    key: "inicio_sintomas",
                    label: "Início dos Sintomas",
                    placeholder: "Quando os sintomas começaram? Como evoluíram?",
                },
                {
                    key: "fatores_desencadeantes",
                    label: "Fatores Desencadeantes",
                    placeholder: "Eventos ou situações que desencadearam ou agravaram...",
                },
            ],
        },
        {
            section: "História Pessoal",
            fields: [
                {
                    key: "historia_pessoal",
                    label: "História de Vida",
                    placeholder: "Infância, adolescência, eventos marcantes...",
                },
                {
                    key: "historico_familiar",
                    label: "Histórico Familiar",
                    placeholder: "Composição familiar, relacionamentos, histórico de saúde mental...",
                },
                {
                    key: "relacionamentos",
                    label: "Relacionamentos",
                    placeholder: "Vida afetiva, social, profissional...",
                },
            ],
        },
        {
            section: "Saúde Mental",
            fields: [
                {
                    key: "tratamentos_anteriores",
                    label: "Tratamentos Anteriores",
                    placeholder: "Psicoterapias ou tratamentos psiquiátricos anteriores...",
                },
                {
                    key: "medicamentos_atuais",
                    label: "Medicamentos Atuais",
                    placeholder: "Medicações em uso (nome, dosagem, tempo de uso)...",
                },
                {
                    key: "internacoes",
                    label: "Internações",
                    placeholder: "Histórico de internações psiquiátricas, se houver...",
                },
            ],
        },
        {
            section: "Avaliação e Objetivos",
            fields: [
                {
                    key: "expectativas_tratamento",
                    label: "Expectativas do Tratamento",
                    placeholder: "O que o paciente espera alcançar com a terapia...",
                },
                {
                    key: "objetivos_terapeuticos",
                    label: "Objetivos Terapêuticos",
                    placeholder: "Objetivos definidos em conjunto...",
                },
                {
                    key: "observacoes_iniciais",
                    label: "Observações Iniciais",
                    placeholder: "Primeiras impressões, aspectos comportamentais observados...",
                },
            ],
        },
    ];

export function AnamneseForm({ patientId, initialData }: AnamneseFormProps) {
    const [content, setContent] = useState<AnamneseContent>(
        initialData || defaultContent
    );
    const [isPending, startTransition] = useTransition();

    const handleChange = (key: keyof AnamneseContent, value: string) => {
        setContent((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveAnamnese(patientId, content);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Anamnese salva com sucesso!");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold">Anamnese</h2>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Anamnese
                        </>
                    )}
                </Button>
            </div>

            {fields.map((section, i) => (
                <div key={section.section} className="space-y-4">
                    {i > 0 && <Separator />}
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">
                        {section.section}
                    </h3>
                    <div className="grid gap-4">
                        {section.fields.map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label htmlFor={field.key}>{field.label}</Label>
                                <Textarea
                                    id={field.key}
                                    value={content[field.key] as string}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
