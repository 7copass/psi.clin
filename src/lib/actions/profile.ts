"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProfileData {
    full_name: string;
    crp: string | null;
    phone: string | null;
    clinic_name: string | null;
    clinic_cnpj: string | null;
    clinic_address: string | null;
    default_session_duration: number;
    default_session_value: number;
}

/**
 * Atualizar perfil do profissional
 */
export async function updateProfile(
    data: ProfileData
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
            .from("professionals")
            .update({
                full_name: data.full_name,
                crp: data.crp,
                phone: data.phone,
                clinic_name: data.clinic_name,
                clinic_cnpj: data.clinic_cnpj,
                clinic_address: data.clinic_address,
                default_session_duration: data.default_session_duration,
                default_session_value: data.default_session_value,
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", user.id);

        if (error) {
            console.error("Update error:", error);
            return { error: "Erro ao atualizar perfil" };
        }

        revalidatePath("/conta/perfil");
        revalidatePath("/");
        return { success: true };
    } catch (err) {
        console.error("Profile error:", err);
        return { error: "Erro ao atualizar perfil" };
    }
}

/**
 * Atualizar avatar
 */
export async function updateAvatar(
    avatarUrl: string
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
            .from("professionals")
            .update({
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", user.id);

        if (error) {
            console.error("Avatar update error:", error);
            return { error: "Erro ao atualizar avatar" };
        }

        revalidatePath("/conta/perfil");
        revalidatePath("/");
        return { success: true };
    } catch (err) {
        console.error("Avatar error:", err);
        return { error: "Erro ao atualizar avatar" };
    }
}
