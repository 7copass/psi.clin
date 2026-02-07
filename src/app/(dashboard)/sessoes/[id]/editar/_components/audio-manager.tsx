"use client";

import { useState } from "react";
import { Mic, FileAudio, Sparkles, Copy, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "./audio-recorder";
import { toast } from "sonner";
import type { SmartNotes } from "@/lib/gemini/smartnotes";

interface AudioManagerProps {
    sessionId: string;
    transcription?: string | null;
    smartnotes?: SmartNotes | null;
    onTranscriptionComplete?: (transcription: string) => void;
    onSmartNotesComplete?: (smartnotes: SmartNotes) => void;
}

type SmartNotesSize = "curto" | "medio" | "longo";

export function AudioManager({
    sessionId,
    transcription: initialTranscription,
    smartnotes: initialSmartNotes,
    onTranscriptionComplete,
    onSmartNotesComplete,
}: AudioManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
    const [transcription, setTranscription] = useState(initialTranscription || "");
    const [smartnotes, setSmartNotes] = useState<SmartNotes | null>(initialSmartNotes || null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [notesSize, setNotesSize] = useState<SmartNotesSize>("medio");

    const handleRecordingComplete = (blob: Blob) => {
        setAudioBlob(blob);
        toast.success("Áudio gravado!");
    };

    const handleTranscribe = async () => {
        if (!audioBlob) {
            toast.error("Grave um áudio primeiro");
            return;
        }

        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            formData.append("sessionId", sessionId);

            const response = await fetch("/api/ai/transcribe", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao transcrever");
            }

            setTranscription(data.transcription);
            onTranscriptionComplete?.(data.transcription);
            toast.success("Transcrição concluída!");
        } catch (error) {
            console.error("Transcription error:", error);
            toast.error("Erro ao transcrever áudio");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleGenerateSmartNotes = async () => {
        if (!transcription) {
            toast.error("Transcreva um áudio primeiro");
            return;
        }

        setIsGeneratingNotes(true);
        try {
            const response = await fetch("/api/ai/smartnotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, size: notesSize }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao gerar SmartNotes");
            }

            setSmartNotes(data.smartnotes);
            onSmartNotesComplete?.(data.smartnotes);
            toast.success("SmartNotes gerado!");
        } catch (error) {
            console.error("SmartNotes error:", error);
            toast.error("Erro ao gerar SmartNotes");
        } finally {
            setIsGeneratingNotes(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Mic className="h-4 w-4" />
                    Gestão de Áudio
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileAudio className="h-5 w-5 text-purple-600" />
                        Gestão do Áudio da Sessão
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="record" className="mt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="record" className="flex-1">
                            Gravar
                        </TabsTrigger>
                        <TabsTrigger value="transcription" className="flex-1">
                            Transcrição
                        </TabsTrigger>
                        <TabsTrigger value="smartnotes" className="flex-1">
                            SmartNotes
                        </TabsTrigger>
                    </TabsList>

                    {/* Record Tab */}
                    <TabsContent value="record" className="space-y-4 py-4">
                        <div className="flex flex-col items-center gap-6 py-8">
                            <AudioRecorder
                                onRecordingComplete={handleRecordingComplete}
                                disabled={isTranscribing}
                            />
                            <p className="text-sm text-slate-500 text-center">
                                {audioBlob
                                    ? "Áudio gravado! Clique em transcrever."
                                    : "Clique para iniciar a gravação"}
                            </p>
                            {audioBlob && (
                                <Button
                                    onClick={handleTranscribe}
                                    disabled={isTranscribing}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {isTranscribing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Transcrevendo...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Transcrever com IA
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </TabsContent>

                    {/* Transcription Tab */}
                    <TabsContent value="transcription" className="space-y-4 py-4">
                        {transcription ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-green-100 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Transcrição disponível
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(transcription)}
                                    >
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copiar
                                    </Button>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg max-h-60 overflow-y-auto">
                                    <p className="text-sm whitespace-pre-wrap">{transcription}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma transcrição disponível</p>
                                <p className="text-xs mt-1">Grave um áudio primeiro</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* SmartNotes Tab */}
                    <TabsContent value="smartnotes" className="space-y-4 py-4">
                        {!smartnotes && transcription && (
                            <div className="flex items-center gap-4 mb-4">
                                <Select
                                    value={notesSize}
                                    onValueChange={(v) => setNotesSize(v as SmartNotesSize)}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="curto">Curto (2-3 tópicos)</SelectItem>
                                        <SelectItem value="medio">Médio (5-7 tópicos)</SelectItem>
                                        <SelectItem value="longo">Longo (8+ tópicos)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleGenerateSmartNotes}
                                    disabled={isGeneratingNotes}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {isGeneratingNotes ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Gerar SmartNotes
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {smartnotes ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-purple-100 text-purple-700">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        SmartNotes gerado
                                    </Badge>
                                </div>

                                {/* Topic Map */}
                                <div className="flex flex-wrap gap-2">
                                    {smartnotes.mapa_topicos.map((topico, i) => (
                                        <Badge key={i} variant="outline">
                                            {topico}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Topics */}
                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                    {smartnotes.topicos.map((topico, i) => (
                                        <div
                                            key={i}
                                            className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                                        >
                                            <h4 className="font-semibold mb-2">{topico.titulo}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                {topico.resumo}
                                            </p>
                                            {topico.citacoes.length > 0 && (
                                                <div className="space-y-2">
                                                    {topico.citacoes.map((citacao, j) => (
                                                        <blockquote
                                                            key={j}
                                                            className="border-l-2 border-purple-300 pl-3 text-sm italic"
                                                        >
                                                            &quot;{citacao.texto}&quot;
                                                            <span className="text-xs text-slate-500 ml-2">
                                                                — {citacao.falante}
                                                            </span>
                                                        </blockquote>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum SmartNotes gerado</p>
                                <p className="text-xs mt-1">
                                    {transcription
                                        ? "Clique em gerar SmartNotes"
                                        : "Transcreva um áudio primeiro"}
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
