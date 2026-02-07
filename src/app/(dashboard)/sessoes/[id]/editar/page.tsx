"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Check, Clock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { AudioManager } from "./_components/audio-manager";
import {
    getSessionById,
    updateSessionNotes,
    updateSessionEvolution,
} from "@/lib/actions/sessions";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { use } from "react";
import type { Session } from "@/lib/types/database";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditSessionPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [session, setSession] = useState<
        (Session & { patient: { full_name: string } }) | null
    >(null);
    const [notes, setNotes] = useState("");
    const [evolution, setEvolution] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isGeneratingEvolution, setIsGeneratingEvolution] = useState(false);

    const notesRef = useRef(notes);
    const evolutionRef = useRef(evolution);

    // Fetch session data
    useEffect(() => {
        async function fetchSession() {
            const result = await getSessionById(id);
            if (result.data) {
                setSession(result.data);
                setNotes(result.data.notes || "");
                setEvolution(result.data.evolution || "");
                notesRef.current = result.data.notes || "";
                evolutionRef.current = result.data.evolution || "";
            } else {
                toast.error("Sessão não encontrada");
                router.push("/sessoes");
            }
        }
        fetchSession();
    }, [id, router]);

    // Track changes
    const handleNotesChange = useCallback((value: string) => {
        setNotes(value);
        notesRef.current = value;
        setHasUnsavedChanges(true);
    }, []);

    const handleEvolutionChange = useCallback((value: string) => {
        setEvolution(value);
        evolutionRef.current = value;
        setHasUnsavedChanges(true);
    }, []);

    // Save function
    const save = useCallback(async () => {
        if (!hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            // Save notes
            const notesResult = await updateSessionNotes(id, notesRef.current);
            if (notesResult.error) {
                toast.error(notesResult.error);
                return;
            }

            // Save evolution
            const evolutionResult = await updateSessionEvolution(
                id,
                evolutionRef.current
            );
            if (evolutionResult.error) {
                toast.error(evolutionResult.error);
                return;
            }

            setLastSaved(new Date());
            setHasUnsavedChanges(false);
        } catch {
            toast.error("Erro ao salvar");
        } finally {
            setIsSaving(false);
        }
    }, [id, hasUnsavedChanges]);

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasUnsavedChanges) {
                save();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [hasUnsavedChanges, save]);

    // Manual save
    const handleSave = async () => {
        await save();
        toast.success("Salvo com sucesso");
    };

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/sessoes/${id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Sessão de {session.patient.full_name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {formatDate(session.session_date)}
                            {session.start_time && ` às ${session.start_time}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {lastSaved && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>
                                Salvo às {lastSaved.toLocaleTimeString("pt-BR").slice(0, 5)}
                            </span>
                        </div>
                    )}
                    {hasUnsavedChanges && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Não salvo
                        </Badge>
                    )}
                    <AudioManager
                        sessionId={id}
                        transcription={session.transcription}
                        smartnotes={session.smartnotes as never}
                    />
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </div>

            {/* Editor Tabs */}
            <Tabs defaultValue="notes" className="w-full">
                <TabsList className="w-full max-w-md">
                    <TabsTrigger value="notes" className="flex-1">
                        Anotações
                    </TabsTrigger>
                    <TabsTrigger value="evolution" className="flex-1">
                        Evolução
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="mt-4">
                    <div className="space-y-2">
                        <p className="text-sm text-slate-500">
                            Registre suas observações e notas sobre a sessão.
                        </p>
                        <RichTextEditor
                            content={notes}
                            onChange={handleNotesChange}
                            placeholder="Digite suas anotações sobre a sessão..."
                            minHeight="400px"
                            autoFocus
                        />
                    </div>
                </TabsContent>

                <TabsContent value="evolution" className="mt-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Registre a evolução do prontuário do paciente.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    setIsGeneratingEvolution(true);
                                    try {
                                        const response = await fetch("/api/ai/evolution", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ sessionId: id }),
                                        });
                                        const data = await response.json();
                                        if (!response.ok) throw new Error(data.error);
                                        setEvolution(data.evolution);
                                        evolutionRef.current = data.evolution;
                                        setHasUnsavedChanges(true);
                                        toast.success("Evolução gerada!");
                                    } catch (error) {
                                        toast.error("Erro ao gerar evolução");
                                        console.error(error);
                                    } finally {
                                        setIsGeneratingEvolution(false);
                                    }
                                }}
                                disabled={isGeneratingEvolution}
                            >
                                {isGeneratingEvolution ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando...</>
                                ) : (
                                    <><Sparkles className="h-4 w-4 mr-2" />Gerar com IA</>
                                )}
                            </Button>
                        </div>
                        <RichTextEditor
                            content={evolution}
                            onChange={handleEvolutionChange}
                            placeholder="Digite a evolução do prontuário..."
                            minHeight="400px"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
