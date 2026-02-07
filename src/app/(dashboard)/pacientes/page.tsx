import { createClient } from "@/lib/supabase/server";
import { PatientDialog } from "./_components/patient-dialog";
import { PatientList } from "./_components/patient-list";
import type { Patient } from "@/lib/types/database";

export default async function PacientesPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("status", "active")
        .order("full_name", { ascending: true });

    const patients = (data as Patient[]) || [];

    if (error) {
        console.error("Error fetching patients:", error);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Pacientes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {patients.length} {patients.length === 1 ? "paciente ativo" : "pacientes ativos"}
                    </p>
                </div>
                <PatientDialog />
            </div>

            {/* Patient List */}
            <PatientList patients={patients} />
        </div>
    );
}
