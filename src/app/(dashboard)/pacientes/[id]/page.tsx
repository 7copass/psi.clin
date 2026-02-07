import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Phone, Mail, Calendar, MapPin, CreditCard, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPhone, formatDate, formatCurrency, formatCPF } from "@/lib/utils/format";
import { GENDERS, BILLING_MODELS, PAYMENT_METHODS, PATIENT_STATUS } from "@/lib/utils/constants";
import type { Patient, Session } from "@/lib/types/database";
import { SummaryButton } from "./_components/summary-button";
import { AnamneseForm } from "./_components/anamnese-form";
import { getAnamnese, type AnamneseContent } from "@/lib/actions/anamnese";
import { getDocuments } from "@/lib/actions/documents";
import { DocumentUpload } from "./_components/document-upload";
import { DocumentList } from "./_components/document-list";

interface Document {
    id: string;
    name: string;
    file_type: string;
    file_size: number;
    created_at: string;
    url?: string;
    downloadUrl?: string;
    file_path: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Buscar paciente
    const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

    if (patientError || !patientData) {
        notFound();
    }

    const patient = patientData as Patient;

    // Buscar sessões do paciente
    const { data: sessionsData } = await supabase
        .from("sessions")
        .select("*")
        .eq("patient_id", id)
        .order("session_date", { ascending: false })
        .limit(10);

    const sessions = (sessionsData as Session[]) || [];

    // Buscar anamnese
    const { data: anamneseData } = await getAnamnese(id);
    const anamneseContent = anamneseData?.content as AnamneseContent | undefined;

    // Buscar documentos
    const { data: documentsData } = await getDocuments(id);
    const documents = (documentsData as Document[]) || [];

    const gender = GENDERS.find((g) => g.value === patient.gender);
    const billingModel = BILLING_MODELS[patient.billing_model as keyof typeof BILLING_MODELS];
    const paymentMethod = PAYMENT_METHODS.find((pm) => pm.value === patient.payment_method);
    const status = PATIENT_STATUS[patient.status as keyof typeof PATIENT_STATUS];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/pacientes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {patient.full_name}
                        </h1>
                        <Badge
                            variant={status?.color === "green" ? "default" : "secondary"}
                            className={status?.color === "green" ? "bg-green-100 text-green-700" : ""}
                        >
                            {status?.label || patient.status}
                        </Badge>
                    </div>
                    {patient.treatment && (
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {patient.treatment}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <SummaryButton
                        patientId={id}
                        patientName={patient.full_name}
                        sessionsCount={sessions.length}
                    />
                    <Button variant="outline" asChild>
                        <Link href={`/pacientes/${id}/editar`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Link>
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href={`/sessoes/nova?paciente=${id}`}>
                            Nova Sessão
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="info" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="info">Informações</TabsTrigger>
                    <TabsTrigger value="sessions">Sessões ({sessions.length})</TabsTrigger>
                    <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                {/* Tab Informações */}
                <TabsContent value="info" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Dados Pessoais */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-purple-600" />
                                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                            </div>
                            <Separator />
                            <div className="grid gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Nome completo</span>
                                    <span className="font-medium">{patient.full_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Telefone</span>
                                    <span className="font-medium">{formatPhone(patient.phone)}</span>
                                </div>
                                {patient.email && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Email</span>
                                        <span className="font-medium">{patient.email}</span>
                                    </div>
                                )}
                                {patient.cpf && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">CPF</span>
                                        <span className="font-medium">{formatCPF(patient.cpf)}</span>
                                    </div>
                                )}
                                {patient.birth_date && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Data de nascimento</span>
                                        <span className="font-medium">{formatDate(patient.birth_date)}</span>
                                    </div>
                                )}
                                {gender && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Gênero</span>
                                        <span className="font-medium">{gender.label}</span>
                                    </div>
                                )}
                                {patient.profession && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Profissão</span>
                                        <span className="font-medium">{patient.profession}</span>
                                    </div>
                                )}
                                {patient.address && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Endereço</span>
                                        <span className="font-medium text-right max-w-[200px]">{patient.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dados Financeiros */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <h3 className="text-lg font-semibold">Dados Financeiros</h3>
                            </div>
                            <Separator />
                            <div className="grid gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Modelo de cobrança</span>
                                    <span className="font-medium">{billingModel?.label || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Valor</span>
                                    <span className="font-medium text-lg text-purple-600">
                                        {formatCurrency(patient.session_value)}
                                    </span>
                                </div>
                                {paymentMethod && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Forma de pagamento</span>
                                        <span className="font-medium">{paymentMethod.label}</span>
                                    </div>
                                )}
                                {patient.health_insurance && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Plano de saúde</span>
                                        <span className="font-medium">{patient.health_insurance}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contatos de Emergência */}
                        {(patient.emergency_contact_1_name || patient.emergency_contact_2_name) && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold">Contatos de Emergência</h3>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    {patient.emergency_contact_1_name && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{patient.emergency_contact_1_name}</p>
                                                <p className="text-sm text-slate-500">{formatPhone(patient.emergency_contact_1_phone)}</p>
                                            </div>
                                            <Badge variant="secondary">Contato 1</Badge>
                                        </div>
                                    )}
                                    {patient.emergency_contact_2_name && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{patient.emergency_contact_2_name}</p>
                                                <p className="text-sm text-slate-500">{formatPhone(patient.emergency_contact_2_phone)}</p>
                                            </div>
                                            <Badge variant="secondary">Contato 2</Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Observações */}
                        {patient.notes && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold">Observações</h3>
                                </div>
                                <Separator />
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                    {patient.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab Sessões */}
                <TabsContent value="sessions">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                        {sessions.length > 0 ? (
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/sessoes/${session.id}`}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{formatDate(session.session_date)}</p>
                                            <p className="text-sm text-slate-500">
                                                {session.session_type === "online" ? "Online" : "Presencial"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={session.status === "completed" ? "default" : "secondary"}
                                                className={session.status === "completed" ? "bg-green-100 text-green-700" : ""}
                                            >
                                                {session.status === "completed" ? "Realizada" : session.status}
                                            </Badge>
                                            {session.value && (
                                                <p className="text-sm text-slate-500 mt-1">{formatCurrency(session.value)}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Nenhuma sessão registrada</p>
                                <p className="text-sm mt-1">Agende a primeira sessão com este paciente</p>
                                <Button className="mt-4 bg-purple-600 hover:bg-purple-700" asChild>
                                    <Link href={`/sessoes/nova?paciente=${id}`}>Nova Sessão</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab Anamnese */}
                <TabsContent value="anamnese">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                        <AnamneseForm patientId={id} initialData={anamneseContent} />
                    </div>
                </TabsContent>

                {/* Tab Documentos */}
                <TabsContent value="documents">
                    <div className="space-y-6">
                        <DocumentUpload patientId={id} />
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                            <h3 className="text-lg font-semibold mb-4">Documentos do Paciente</h3>
                            <DocumentList documents={documents} patientId={id} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
