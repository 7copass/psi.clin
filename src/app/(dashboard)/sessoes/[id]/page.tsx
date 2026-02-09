import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, MapPin, DollarSign, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { SESSION_STATUS, SESSION_TYPES, PAYMENT_STATUS } from "@/lib/utils/constants";
import type { Session, Patient } from "@/lib/types/database";
import { SessionActions } from "./_components/session-actions";
import { SessionHeaderActions } from "./_components/session-header-actions";
import { SessionNotes } from "./_components/session-notes";
import { SessionEvolution } from "./_components/session-evolution";
import { AudioManager } from "./editar/_components/audio-manager";
import type { SmartNotes } from "@/lib/gemini/smartnotes";
import { getTodayDate } from "@/lib/utils/date";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Buscar sessão com dados do paciente
    const { data: sessionData, error } = await supabase
        .from("sessions")
        .select("*, patients(*)")
        .eq("id", id)
        .single();

    if (error || !sessionData) {
        notFound();
    }

    interface SessionWithPatient extends Session {
        patients: Patient;
    }

    const session = sessionData as SessionWithPatient;
    const patient = session.patients;
    const smartNotes = session.smartnotes as unknown as SmartNotes | null;

    const status = SESSION_STATUS[session.status as keyof typeof SESSION_STATUS];
    const sessionType = SESSION_TYPES[session.session_type as keyof typeof SESSION_TYPES];
    const paymentStatus = PAYMENT_STATUS[session.payment_status as keyof typeof PAYMENT_STATUS];

    const today = getTodayDate();
    // Extract date part from session_date (handles timestamp format)
    const sessionDatePart = session.session_date.includes("T")
        ? session.session_date.split("T")[0]
        : session.session_date;
    const isPast = sessionDatePart < today;
    const isToday = sessionDatePart === today;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/sessoes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Sessão com {patient.full_name}
                        </h1>
                        {status && (
                            <Badge
                                variant={status.color === "green" ? "default" : "secondary"}
                                className={
                                    status.color === "green"
                                        ? "bg-green-100 text-green-700"
                                        : status.color === "red"
                                            ? "bg-red-100 text-red-700"
                                            : ""
                                }
                            >
                                {status.label}
                            </Badge>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(session.session_date)}
                        {isToday && " • Hoje"}
                    </p>
                </div>
                <SessionHeaderActions
                    sessionId={session.id}
                    currentStatus={session.status}
                    isPast={isPast}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Session Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            Informações da Sessão
                        </h3>
                        <Separator />
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">Data</p>
                                <p className="font-medium">{formatDate(session.session_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Horário</p>
                                <p className="font-medium">
                                    {session.start_time || "-"}
                                    {session.end_time && ` - ${session.end_time}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tipo</p>
                                <p className="font-medium flex items-center gap-2">
                                    {sessionType?.icon === "Video" ? (
                                        <Video className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <MapPin className="h-4 w-4 text-green-500" />
                                    )}
                                    {sessionType?.label || "Presencial"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Duração</p>
                                <p className="font-medium">{session.duration_minutes || 50} minutos</p>
                            </div>
                        </div>
                    </div>

                    {/* Smart Notes Topics - Display if available */}
                    {smartNotes && smartNotes.mapa_topicos && (
                        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 space-y-3">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-purple-900 dark:text-purple-100">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                Mapa de Tópicos (IA)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {smartNotes.mapa_topicos.map((topic, i) => (
                                    <Badge key={i} variant="outline" className="bg-white dark:bg-slate-800 border-purple-200 text-purple-700 dark:text-purple-300">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tabs for Notes and Evolution */}
                    <Tabs defaultValue="notes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="notes">Anotações</TabsTrigger>
                            <TabsTrigger value="evolution">Prontuário</TabsTrigger>
                        </TabsList>

                        <TabsContent value="notes" className="mt-0">
                            <SessionNotes sessionId={session.id} initialNotes={session.notes} />
                        </TabsContent>

                        <TabsContent value="evolution" className="mt-0">
                            <SessionEvolution
                                sessionId={session.id}
                                initialEvolution={session.evolution}
                                initialNotes={session.notes}
                            />
                        </TabsContent>
                    </Tabs>

                    {/* Audio Recordings */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Mic className="h-5 w-5 text-purple-600" />
                            Gravações de Áudio
                        </h3>
                        <Separator />
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                            {session.transcription ? (
                                <div className="space-y-4 w-full">
                                    <p className="text-sm text-center mb-4">
                                        Áudio transcrito e processado.
                                    </p>
                                    <div className="flex justify-center">
                                        <AudioManager
                                            sessionId={session.id}
                                            transcription={session.transcription}
                                            smartnotes={session.smartnotes as unknown as SmartNotes}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="mb-4">Nenhuma gravação nesta sessão</p>
                                    <AudioManager
                                        sessionId={session.id}
                                        transcription={session.transcription}
                                        smartnotes={session.smartnotes as unknown as SmartNotes}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Patient Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Paciente</h3>
                        <Separator />
                        <div>
                            <Link
                                href={`/pacientes/${patient.id}`}
                                className="font-medium text-purple-600 hover:text-purple-700"
                            >
                                {patient.full_name}
                            </Link>
                            <p className="text-sm text-slate-500 mt-1">{patient.phone}</p>
                            {patient.email && (
                                <p className="text-sm text-slate-500">{patient.email}</p>
                            )}
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/pacientes/${patient.id}`}>Ver prontuário</Link>
                        </Button>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                            Pagamento
                        </h3>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Valor</span>
                                <span className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(session.value || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Status</span>
                                {paymentStatus && (
                                    <Badge
                                        variant={paymentStatus.color === "green" ? "default" : "secondary"}
                                        className={
                                            paymentStatus.color === "green"
                                                ? "bg-green-100 text-green-700"
                                                : paymentStatus.color === "yellow"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : ""
                                        }
                                    >
                                        {paymentStatus.label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <SessionActions
                            sessionId={session.id}
                            currentStatus={session.status}
                            currentPaymentStatus={session.payment_status}
                        />
                    </div>

                </div>
            </div>
        </div >
    );
}
