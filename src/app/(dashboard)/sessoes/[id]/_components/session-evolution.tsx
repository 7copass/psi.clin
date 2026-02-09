"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, Save, X, Edit2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { updateSessionEvolution } from "@/lib/actions/sessions";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

interface SessionEvolutionProps {
    sessionId: string;
    initialEvolution: string | null;
    initialNotes: string | null; // Needed for AI generation
}

export function SessionEvolution({ sessionId, initialEvolution, initialNotes }: SessionEvolutionProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [evolution, setEvolution] = useState(initialEvolution || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateSessionEvolution(sessionId, evolution);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Evolução salva!");
                setIsEditing(false);
                router.refresh();
            }
        } catch {
            toast.error("Erro ao salvar evolução");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEvolution(initialEvolution || "");
        setIsEditing(false);
    };

    const handleGenerate = async () => {
        if (!initialNotes) {
            toast.error("É necessário ter anotações para gerar a evolução.");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/ai/evolution", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    currentNotes: initialNotes
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setEvolution(data.evolution);
            // If not editing, switch to edit mode to review
            if (!isEditing) setIsEditing(true);

            toast.success("Evolução gerada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar evolução");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Prontuário / Evolução
                </h3>
                <div className="flex gap-2">
                    {!isEditing && !evolution && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleGenerate}
                            disabled={isGenerating || !initialNotes}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Wand2 className="h-4 w-4 mr-2" />
                            )}
                            Gerar com IA
                        </Button>
                    )}

                    {isEditing ? (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                            className="text-slate-500 hover:text-purple-600"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <Separator />

            <div className={isEditing ? "" : evolution ? "prose prose-sm max-w-none dark:prose-invert" : ""}>
                {isEditing ? (
                    <div className="space-y-4">
                        {/* Show Generate button inside edit mode too if empty or user wants to regenerate */}
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleGenerate}
                                disabled={isGenerating || !initialNotes}
                                className="text-xs"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                ) : (
                                    <Wand2 className="h-3 w-3 mr-2" />
                                )}
                                Regenerar com IA
                            </Button>
                        </div>
                        <RichTextEditor
                            content={evolution}
                            onChange={setEvolution}
                            placeholder="Digite a evolução do prontuário..."
                            minHeight="300px"
                            autoFocus
                        />
                    </div>
                ) : evolution ? (
                    <div className="relative group">
                        <RichTextEditor
                            content={evolution}
                            editable={false}
                            className="border-0 bg-transparent"
                            minHeight="auto"
                        />
                        {/* Overlay to encourage clicking to edit */}
                        <div
                            className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/10 dark:bg-slate-800/10 flex items-center justify-center pointer-events-none"
                        >
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma evolução registrada</p>
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                            >
                                Escrever manualmente
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
