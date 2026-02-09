"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, Save, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { updateSessionNotes } from "@/lib/actions/sessions";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

interface SessionNotesProps {
    sessionId: string;
    initialNotes: string | null;
}

export function SessionNotes({ sessionId, initialNotes }: SessionNotesProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    // Helper to process markdown-style bolding
    const formatContent = (content: string | null) => {
        if (!content) return "";
        // Replace **text** with <strong>text</strong>
        return content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    const [notes, setNotes] = useState(formatContent(initialNotes));
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateSessionNotes(sessionId, notes);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Anotações salvas!");
                setIsEditing(false);
                router.refresh();
            }
        } catch {
            toast.error("Erro ao salvar anotações");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setNotes(formatContent(initialNotes));
        setIsEditing(false);
    };

    // Ensure content passed to editor is formatted
    const formattedNotes = useMemo(() => formatContent(notes), [notes]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Anotações da Sessão
                </h3>
                {isEditing ? (
                    <div className="flex gap-2">
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
                    </div>
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
            <Separator />

            <div className={isEditing ? "" : notes ? "prose prose-sm max-w-none dark:prose-invert" : ""}>
                {isEditing ? (
                    <RichTextEditor
                        content={notes}
                        onChange={setNotes}
                        placeholder="Digite suas anotações sobre a sessão..."
                        minHeight="300px"
                        autoFocus
                    />
                ) : notes ? (
                    <div className="relative group">
                        {/* Render read-only editor for consistent HTML display */}
                        <RichTextEditor
                            content={notes}
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
                        <p>Nenhuma anotação registrada</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setIsEditing(true)}
                        >
                            Adicionar anotações
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
