"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { patientSchema, patientUpdateSchema, type PatientFormData } from "@/lib/validators/patient";
import type { Patient } from "@/lib/types/database";

export async function createPatient(
    data: PatientFormData
): Promise<{ data?: Patient; error?: string }> {
    try {
        const supabase = await createClient();

        // Verificar autenticação
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        // Validar dados
        const validated = patientSchema.parse(data);

        // Inserir paciente
        const insertData = {
            full_name: validated.full_name,
            phone: validated.phone,
            professional_id: user.id,
            email: validated.email || null,
            cpf: validated.cpf || null,
            birth_date: validated.birth_date || null,
            is_minor: validated.is_minor || false,
            gender: validated.gender || null,
            profession: validated.profession || null,
            address: validated.address || null,
            country: validated.country || "Brasil",
            health_insurance: validated.health_insurance || null,
            treatment: validated.treatment || null,
            medications: validated.medications || null,
            emergency_contact_1_name: validated.emergency_contact_1_name || null,
            emergency_contact_1_phone: validated.emergency_contact_1_phone || null,
            emergency_contact_2_name: validated.emergency_contact_2_name || null,
            emergency_contact_2_phone: validated.emergency_contact_2_phone || null,
            billing_model: validated.billing_model || "per_session",
            session_value: validated.session_value || 150,
            payment_method: validated.payment_method || null,
            notes: validated.notes || null,
        };

        const { data: patientData, error } = await supabase
            .from("patients")
            .insert(insertData as never)
            .select()
            .single();

        if (error) {
            console.error("Error creating patient:", error);
            return { error: "Erro ao criar paciente: " + error.message };
        }

        revalidatePath("/pacientes");
        return { data: patientData as Patient };
    } catch (err) {
        console.error("Validation error:", err);
        if (err instanceof Error) {
            return { error: err.message };
        }
        return { error: "Dados inválidos" };
    }
}

export async function updatePatient(
    id: string,
    data: PatientFormData
): Promise<{ data?: Patient; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        const validated = patientUpdateSchema.parse(data);

        const updateData = {
            ...validated,
            email: validated.email || null,
            updated_at: new Date().toISOString(),
        };

        const { data: patientData, error } = await supabase
            .from("patients")
            .update(updateData as never)
            .eq("id", id)
            .eq("professional_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating patient:", error);
            return { error: "Erro ao atualizar paciente: " + error.message };
        }

        revalidatePath("/pacientes");
        revalidatePath(`/pacientes/${id}`);
        return { data: patientData as Patient };
    } catch (err) {
        console.error("Validation error:", err);
        if (err instanceof Error) {
            return { error: err.message };
        }
        return { error: "Dados inválidos" };
    }
}

export async function deletePatient(
    id: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        const { error } = await supabase
            .from("patients")
            .delete()
            .eq("id", id)
            .eq("professional_id", user.id);

        if (error) {
            console.error("Error deleting patient:", error);
            return { error: "Erro ao excluir paciente" };
        }

        revalidatePath("/pacientes");
        return { success: true };
    } catch (err) {
        console.error("Delete error:", err);
        return { error: "Erro ao excluir paciente" };
    }
}

export async function archivePatient(
    id: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        const { error } = await supabase
            .from("patients")
            .update({ status: "archived", updated_at: new Date().toISOString() } as never)
            .eq("id", id)
            .eq("professional_id", user.id);

        if (error) {
            console.error("Error archiving patient:", error);
            return { error: "Erro ao arquivar paciente" };
        }

        revalidatePath("/pacientes");
        return { success: true };
    } catch (err) {
        console.error("Archive error:", err);
        return { error: "Erro ao arquivar paciente" };
    }
}

export async function getPatientById(
    id: string
): Promise<{ data?: Patient; error?: string }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching patient:", error);
            return { error: "Paciente não encontrado" };
        }

        return { data: data as Patient };
    } catch (err) {
        console.error("Fetch error:", err);
        return { error: "Erro ao buscar paciente" };
    }
}

export async function getPatients(options?: {
    status?: string;
    limit?: number;
}): Promise<{ data: Patient[]; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: [], error: "Não autenticado" };
        }

        let query = supabase
            .from("patients")
            .select("*")
            .eq("professional_id", user.id)
            .order("full_name", { ascending: true });

        if (options?.status) {
            query = query.eq("status", options.status);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching patients:", error);
            return { data: [], error: "Erro ao buscar pacientes" };
        }

        return { data: data as Patient[] };
    } catch (err) {
        console.error("Fetch error:", err);
        return { data: [], error: "Erro ao buscar pacientes" };
    }
}
