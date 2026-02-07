"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/app/(dashboard)/pacientes/_components/patient-form";
import { getPatientById, updatePatient } from "@/lib/actions/patients";
import { toast } from "sonner";
import type { Patient } from "@/lib/types/database";
import type { PatientFormData } from "@/lib/validators/patient";
import { use } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditPatientPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadPatient() {
            const result = await getPatientById(id);
            if (result.error) {
                toast.error(result.error);
                router.push("/pacientes");
                return;
            }
            setPatient(result.data || null);
            setIsLoading(false);
        }
        loadPatient();
    }, [id, router]);

    async function handleSubmit(data: PatientFormData) {
        setIsSaving(true);

        try {
            const result = await updatePatient(id, data);

            if (result.error) {
                toast.error(result.error);
                setIsSaving(false);
                return;
            }

            toast.success("Paciente atualizado com sucesso!");
            router.push(`/pacientes/${id}`);
        } catch (error) {
            console.error("Error updating patient:", error);
            toast.error("Erro ao atualizar paciente");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="bg-white rounded-xl border p-6">
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/pacientes/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Editar Paciente
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {patient.full_name}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <PatientForm
                    patient={patient}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                />
            </div>
        </div>
    );
}
