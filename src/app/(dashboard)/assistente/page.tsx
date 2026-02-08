"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bot,
    User,
    Send,
    Loader2,
    Sparkles,
    Users,
    X,
    MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getPatients } from "@/lib/actions/patients";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface Patient {
    id: string;
    full_name: string;
}

export default function AssistentePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<string>("");
    const [patients, setPatients] = useState<Patient[]>([]);
    const [streamingContent, setStreamingContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch patients
    useEffect(() => {
        async function fetchPatients() {
            const result = await getPatients();
            if (result.data) {
                setPatients(
                    result.data.map((p) => ({
                        id: p.id,
                        full_name: p.full_name,
                    }))
                );
            }
        }
        fetchPatients();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setStreamingContent("");

        try {
            // Prepare history for Gemini (map roles)
            const history = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    patientId: (selectedPatient && selectedPatient !== "no_patient") ? selectedPatient : undefined,
                    history,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao enviar mensagem");
            }

            // Stream response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    fullContent += chunk;
                    setStreamingContent(fullContent);
                }
            }

            // Add assistant message
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: fullContent,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent("");
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Erro ao enviar mensagem");
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [input, isLoading, selectedPatient]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setStreamingContent("");
    };

    const selectedPatientName = patients.find(
        (p) => p.id === selectedPatient && selectedPatient !== "no_patient"
    )?.full_name;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        Assistente IA
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Seu apoio para discussão de casos e estratégias terapêuticas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger className="w-52">
                            <Users className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Selecionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="no_patient">Sem contexto de paciente</SelectItem>
                            {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                    {patient.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {messages.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearChat}>
                            <X className="h-4 w-4 mr-1" />
                            Limpar
                        </Button>
                    )}
                </div>
            </div>

            {/* Patient context badge */}
            {selectedPatientName && (
                <div className="mb-4">
                    <Badge className="bg-purple-100 text-purple-700">
                        <Users className="h-3 w-3 mr-1" />
                        Contexto: {selectedPatientName}
                    </Badge>
                </div>
            )}

            {/* Chat area */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border overflow-hidden flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !streamingContent && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                                <MessageSquare className="h-12 w-12 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Como posso ajudar?
                            </h3>
                            <p className="text-slate-500 max-w-md text-sm">
                                Posso ajudar com discussão de casos, sugestões de intervenções,
                                técnicas terapêuticas e reflexões sobre a evolução de pacientes.
                            </p>
                            <div className="mt-6 grid gap-2 grid-cols-2 max-w-lg">
                                {[
                                    "Quais técnicas de TCC posso usar para ansiedade?",
                                    "Como abordar resistência ao tratamento?",
                                    "Sugestões de exercícios para regulação emocional",
                                    "Como estruturar um plano terapêutico?",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setInput(suggestion);
                                            inputRef.current?.focus();
                                        }}
                                        className="p-3 text-left text-sm bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-3",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {message.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                    <Bot className="h-5 w-5 text-purple-600" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-lg px-4 py-2",
                                    message.role === "user"
                                        ? "bg-purple-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-700"
                                )}
                            >
                                {message.role === "user" ? (
                                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                ) : (
                                    <div className="text-sm prose dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                            {message.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Streaming message */}
                    {streamingContent && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="max-w-[85%] rounded-lg px-4 py-2 bg-slate-100 dark:bg-slate-700">
                                <div className="text-sm prose dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && !streamingContent && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-3">
                                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua mensagem..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        O assistente oferece sugestões. A decisão clínica é sempre sua.
                    </p>
                </div>
            </div>
        </div >
    );
}
