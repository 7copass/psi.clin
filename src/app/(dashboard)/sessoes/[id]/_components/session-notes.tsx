"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { updateSessionNotes } from "@/lib/actions/sessions";

interface SessionNotesProps {
    sessionId: string;
    initialNotes: string | null;
}

export function SessionNotes({ sessionId, initialNotes }: SessionNotesProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(initialNotes || "");
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
        setNotes(initialNotes || "");
        setIsEditing(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Anotações da Sessão
                </h3>
                {isEditing && (
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
                )}
            </div>
            <Separator />
            {isEditing ? (
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite suas anotações sobre a sessão..."
                    className="min-h-[200px] resize-none"
                    autoFocus
                />
            ) : notes ? (
                <div
                    className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-3 rounded-lg transition-colors"
                    onClick={() => setIsEditing(true)}
                >
                    {notes}
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
    );
}
