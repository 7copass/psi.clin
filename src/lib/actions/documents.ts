"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadDocument(formData: FormData) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Não autenticado" };
        }

        const file = formData.get("file") as File;
        const patientId = formData.get("patientId") as string;
        const professionalId = user.id;

        if (!file || !patientId) {
            return { error: "Dados incompletos" };
        }

        // Upload to Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${patientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from("patient-documents")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return { error: "Erro ao fazer upload do arquivo" };
        }

        // Insert into Database
        const { error: dbError } = await supabase.from("patient_documents").insert({
            patient_id: patientId,
            professional_id: professionalId,
            name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
        } as any);

        if (dbError) {
            console.error("Database error:", dbError);
            // Cleanup storage if db insert fails
            await supabase.storage.from("patient-documents").remove([filePath]);
            return { error: "Erro ao salvar informações do documento" };
        }

        revalidatePath(`/pacientes/${patientId}`);
        return { success: true };
    } catch (error) {
        console.error("Server action error:", error);
        return { error: "Erro interno ao processar documento" };
    }
}

export async function getDocuments(patientId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("patient_documents")
            .select("*")
            .eq("patient_id", patientId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            return { error: "Erro ao buscar documentos" };
        }

        // Get signed URLs for each document (one for view, one for download)
        const documentsWithUrls = await Promise.all(
            data.map(async (doc) => {
                // URL for visualização (inline)
                const { data: viewUrlData } = await supabase.storage
                    .from("patient-documents")
                    .createSignedUrl((doc as any).file_path, 3600); // 1 hora

                // URL para download (attachment)
                const { data: downloadUrlData } = await supabase.storage
                    .from("patient-documents")
                    .createSignedUrl((doc as any).file_path, 3600, {
                        download: true,
                    });

                return {
                    // @ts-ignore - doc is typed as never
                    ...doc,
                    url: viewUrlData?.signedUrl,
                    downloadUrl: downloadUrlData?.signedUrl,
                } as any;
            })
        );

        return { data: documentsWithUrls };
    } catch (error) {
        console.error("Server action error:", error);
        return { error: "Erro interno ao buscar documentos" };
    }
}

export async function deleteDocument(id: string, path: string, patientId: string) {
    try {
        const supabase = await createClient();

        // Delete from Storage
        const { error: storageError } = await supabase.storage
            .from("patient-documents")
            .remove([path]);

        if (storageError) {
            console.error("Storage delete error:", storageError);
            return { error: "Erro ao excluir arquivo do storage" };
        }

        // Delete from Database
        const { error: dbError } = await supabase
            .from("patient_documents")
            .delete()
            .eq("id", id);

        if (dbError) {
            console.error("Database delete error:", dbError);
            return { error: "Erro ao excluir registro do banco de dados" };
        }

        revalidatePath(`/pacientes/${patientId}`);
        return { success: true };
    } catch (error) {
        console.error("Server action error:", error);
        return { error: "Erro interno ao excluir documento" };
    }
}

export async function renameDocument(id: string, newName: string, patientId: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("patient_documents")
            // @ts-ignore - ts complains about never type
            .update({ name: newName, updated_at: new Date().toISOString() } as any)
            .eq("id", id);

        if (error) {
            console.error("Update error:", error);
            return { error: "Erro ao renomear documento" };
        }

        revalidatePath(`/pacientes/${patientId}`);
        return { success: true };
    } catch (error) {
        console.error("Server action error:", error);
        return { error: "Erro interno ao renomear documento" };
    }
}
