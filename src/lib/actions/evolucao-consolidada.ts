"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { EvolucaoConsolidada } from "@/lib/types/database";

export async function getEvolucoes(patientId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Nao autenticado" };

    const { data, error } = await supabase
        .from("evolucoes_consolidadas")
        .select("*")
        .eq("patient_id", patientId)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return { error: "Erro ao buscar evolucoes consolidadas" };
    return { data: data as EvolucaoConsolidada[] };
}

export async function findExistingEvolucao(
    patientId: string,
    sessionIds: string[]
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("evolucoes_consolidadas")
        .select("*")
        .eq("patient_id", patientId)
        .eq("professional_id", user.id);

    if (!data) return null;

    // Find exact match (same set of sessions)
    const sorted = [...sessionIds].sort();
    return (
        (data as EvolucaoConsolidada[]).find((d) => {
            const dSorted = [...d.sessoes_incluidas].sort();
            return (
                dSorted.length === sorted.length &&
                dSorted.every((id, i) => id === sorted[i])
            );
        }) || null
    );
}

export async function saveEvolucaoConsolidada(input: {
    patientId: string;
    titulo: string;
    periodoInicio: string;
    periodoFim: string;
    sessoesIncluidas: string[];
    conteudoJson: Record<string, unknown>;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Nao autenticado" };

    const { data, error } = await supabase
        .from("evolucoes_consolidadas")
        .insert({
            patient_id: input.patientId,
            professional_id: user.id,
            titulo: input.titulo,
            periodo_inicio: input.periodoInicio,
            periodo_fim: input.periodoFim,
            sessoes_incluidas: input.sessoesIncluidas,
            conteudo_json: input.conteudoJson,
        } as never)
        .select()
        .single();

    if (error) return { error: "Erro ao salvar evolucao consolidada" };
    revalidatePath(`/pacientes/${input.patientId}`);
    return { data: data as EvolucaoConsolidada };
}

export async function updateEvolucaoConsolidada(
    id: string,
    conteudoJson: Record<string, unknown>
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Nao autenticado" };

    const { error } = await supabase
        .from("evolucoes_consolidadas")
        .update({
            conteudo_json: conteudoJson,
            updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id)
        .eq("professional_id", user.id);

    if (error) return { error: "Erro ao atualizar" };
    return { success: true };
}

export async function deleteEvolucaoConsolidada(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Nao autenticado" };

    const { error } = await supabase
        .from("evolucoes_consolidadas")
        .delete()
        .eq("id", id)
        .eq("professional_id", user.id);

    if (error) return { error: "Erro ao deletar" };
    return { success: true };
}
