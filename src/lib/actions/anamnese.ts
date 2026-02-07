"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Anamnese } from "@/lib/types/database";

export interface AnamneseContent {
    // Queixa principal
    queixa_principal: string;
    inicio_sintomas: string;
    fatores_desencadeantes: string;

    // História pessoal
    historia_pessoal: string;
    historico_familiar: string;
    relacionamentos: string;

    // Saúde mental
    tratamentos_anteriores: string;
    medicamentos_atuais: string;
    internacoes: string;

    // Avaliação
    expectativas_tratamento: string;
    objetivos_terapeuticos: string;
    observacoes_iniciais: string;

    // Campos extras
    campos_extras?: Record<string, string>;
}

/**
 * Buscar anamnese do paciente
 */
export async function getAnamnese(
    patientId: string
): Promise<{ data?: Anamnese; error?: string }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("anamneses")
            .select("*")
            .eq("patient_id", patientId)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error fetching anamnese:", error);
            return { error: "Erro ao buscar anamnese" };
        }

        return { data: data as unknown as Anamnese | undefined };
    } catch (err) {
        console.error("Fetch error:", err);
        return { error: "Erro ao buscar anamnese" };
    }
}

/**
 * Salvar ou atualizar anamnese
 */
export async function saveAnamnese(
    patientId: string,
    content: AnamneseContent
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Não autenticado" };
        }

        // Verificar se já existe
        const { data: existing } = await supabase
            .from("anamneses")
            .select("id")
            .eq("patient_id", patientId)
            .single();

        const existingRecord = existing as unknown as { id: string } | null;
        if (existingRecord) {
            // Atualizar
            const { error } = await supabase
                .from("anamneses")
                .update({
                    content: content as unknown as never,
                    updated_at: new Date().toISOString(),
                } as never)
                .eq("id", existingRecord.id);

            if (error) {
                console.error("Update error:", error);
                return { error: "Erro ao atualizar anamnese" };
            }
        } else {
            // Inserir
            const { error } = await supabase.from("anamneses").insert({
                patient_id: patientId,
                professional_id: user.id,
                content: content as unknown as never,
            } as never);

            if (error) {
                console.error("Insert error:", error);
                return { error: "Erro ao criar anamnese" };
            }
        }

        revalidatePath(`/pacientes/${patientId}`);
        return { success: true };
    } catch (err) {
        console.error("Save error:", err);
        return { error: "Erro ao salvar anamnese" };
    }
}
