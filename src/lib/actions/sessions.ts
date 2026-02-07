"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sessionSchema, sessionUpdateSchema } from "@/lib/validators/session";
import type { Session } from "@/lib/types/database";

export async function createSession(
    formData: FormData
): Promise<{ data?: Session; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        const rawData = Object.fromEntries(formData);
        const validated = sessionSchema.parse(rawData);

        // Verificar se o paciente pertence ao profissional
        const { data: patient } = await supabase
            .from("patients")
            .select("id, session_value")
            .eq("id", validated.patient_id)
            .eq("professional_id", user.id)
            .single();

        if (!patient) {
            return { error: "Paciente não encontrado" };
        }

        const patientData = patient as { id: string; session_value?: number };

        const insertData = {
            professional_id: user.id,
            patient_id: validated.patient_id,
            session_date: validated.session_date,
            start_time: validated.start_time || null,
            end_time: validated.end_time || null,
            duration_minutes: validated.duration_minutes || 50,
            session_type: validated.session_type || "in_person",
            status: validated.status || "scheduled",
            value: validated.value || patientData.session_value || 150,
            payment_status: validated.payment_status || "pending",
            notes: validated.notes || null,
        };

        const { data, error } = await supabase
            .from("sessions")
            .insert(insertData as never)
            .select()
            .single();

        if (error) {
            console.error("Error creating session:", error);
            return { error: "Erro ao criar sessão" };
        }

        revalidatePath("/sessoes");
        revalidatePath(`/pacientes/${validated.patient_id}`);
        return { data: data as Session };
    } catch (err) {
        console.error("Validation error:", err);
        return { error: "Dados inválidos" };
    }
}

export async function updateSession(
    id: string,
    formData: FormData
): Promise<{ data?: Session; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        const rawData = Object.fromEntries(formData);
        const validated = sessionUpdateSchema.parse(rawData);

        // Verificar se a sessão pertence a um paciente do profissional
        const { data: existingSession } = await supabase
            .from("sessions")
            .select("*, patients!inner(professional_id)")
            .eq("id", id)
            .single();

        if (!existingSession) {
            return { error: "Sessão não encontrada" };
        }

        const updateData = {
            ...validated,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("sessions")
            .update(updateData as never)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating session:", error);
            return { error: "Erro ao atualizar sessão" };
        }

        revalidatePath("/sessoes");
        revalidatePath(`/sessoes/${id}`);
        return { data: data as Session };
    } catch (err) {
        console.error("Validation error:", err);
        return { error: "Dados inválidos" };
    }
}

export async function deleteSession(
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

        const { error } = await supabase.from("sessions").delete().eq("id", id);

        if (error) {
            console.error("Error deleting session:", error);
            return { error: "Erro ao excluir sessão" };
        }

        revalidatePath("/sessoes");
        return { success: true };
    } catch (err) {
        console.error("Delete error:", err);
        return { error: "Erro ao excluir sessão" };
    }
}

export async function completeSession(
    id: string,
    notes?: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        const updateData: Record<string, unknown> = {
            status: "completed",
            updated_at: new Date().toISOString(),
        };

        if (notes) {
            updateData.notes = notes;
        }

        const { error } = await supabase
            .from("sessions")
            .update(updateData as never)
            .eq("id", id);

        if (error) {
            console.error("Error completing session:", error);
            return { error: "Erro ao finalizar sessão" };
        }

        revalidatePath("/sessoes");
        revalidatePath(`/sessoes/${id}`);
        return { success: true };
    } catch (err) {
        console.error("Complete error:", err);
        return { error: "Erro ao finalizar sessão" };
    }
}

export async function getSessionById(
    id: string
): Promise<{ data?: Session & { patient: { full_name: string } }; error?: string }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("sessions")
            .select("*, patients(full_name)")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching session:", error);
            return { error: "Sessão não encontrada" };
        }

        const sessionData = data as Record<string, unknown> & {
            patients?: { full_name: string };
        };

        return {
            data: {
                ...sessionData,
                patient: { full_name: sessionData.patients?.full_name || "" },
            } as Session & { patient: { full_name: string } },
        };
    } catch (err) {
        console.error("Fetch error:", err);
        return { error: "Erro ao buscar sessão" };
    }
}

interface SessionWithPatient extends Session {
    patients: { id: string; full_name: string } | null;
}

export async function getSessionsByDateRange(
    startDate: string,
    endDate: string
): Promise<{ data?: SessionWithPatient[]; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        // Get professional's patients first
        const { data: patients } = await supabase
            .from("patients")
            .select("id")
            .eq("professional_id", user.id);

        if (!patients || patients.length === 0) {
            return { data: [] };
        }

        const patientIds = (patients as { id: string }[]).map((p) => p.id);

        const { data, error } = await supabase
            .from("sessions")
            .select("*, patients(id, full_name)")
            .in("patient_id", patientIds)
            .gte("session_date", startDate)
            .lte("session_date", endDate)
            .order("session_date")
            .order("start_time");

        if (error) {
            console.error("Error fetching sessions:", error);
            return { error: "Erro ao buscar sessões" };
        }

        return { data: (data as SessionWithPatient[]) || [] };
    } catch (err) {
        console.error("Fetch error:", err);
        return { error: "Erro ao buscar sessões" };
    }
}

export async function updateSessionStatus(
    id: string,
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
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
            .from("sessions")
            .update({ status, updated_at: new Date().toISOString() } as never)
            .eq("id", id);

        if (error) {
            console.error("Error updating session status:", error);
            return { error: "Erro ao atualizar status" };
        }

        revalidatePath("/agendamentos");
        revalidatePath("/sessoes");
        revalidatePath(`/sessoes/${id}`);
        return { success: true };
    } catch (err) {
        console.error("Update error:", err);
        return { error: "Erro ao atualizar status" };
    }
}

export async function updatePaymentStatus(
    id: string,
    paymentStatus: "pending" | "paid" | "partial"
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
            .from("sessions")
            .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() } as never)
            .eq("id", id);

        if (error) {
            console.error("Error updating payment status:", error);
            return { error: "Erro ao atualizar pagamento" };
        }

        revalidatePath("/sessoes");
        revalidatePath(`/sessoes/${id}`);
        revalidatePath("/financeiro");
        return { success: true };
    } catch (err) {
        console.error("Update error:", err);
        return { error: "Erro ao atualizar pagamento" };
    }
}

interface RecurringSessionParams {
    patientId: string;
    startDate: string;
    startTime: string;
    endTime?: string;
    sessionType: "in_person" | "online";
    recurrenceType: "weekly" | "biweekly" | "monthly";
    recurrenceEndDate: string;
    value?: number;
    durationMinutes?: number;
}

export async function createRecurringSessions(
    params: RecurringSessionParams
): Promise<{ count?: number; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Não autenticado" };
        }

        // Verify patient belongs to professional
        const { data: patient } = await supabase
            .from("patients")
            .select("id, session_value")
            .eq("id", params.patientId)
            .eq("professional_id", user.id)
            .single();

        if (!patient) {
            return { error: "Paciente não encontrado" };
        }

        const patientData = patient as { id: string; session_value?: number };

        // Generate dates based on recurrence
        const dates: string[] = [];
        let currentDate = new Date(params.startDate + "T12:00:00");
        const endDate = new Date(params.recurrenceEndDate + "T12:00:00");

        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split("T")[0]);

            if (params.recurrenceType === "weekly") {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (params.recurrenceType === "biweekly") {
                currentDate.setDate(currentDate.getDate() + 14);
            } else if (params.recurrenceType === "monthly") {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        // Create sessions
        const sessions = dates.map((date) => ({
            patient_id: params.patientId,
            session_date: date,
            start_time: params.startTime,
            end_time: params.endTime || null,
            duration_minutes: params.durationMinutes || 50,
            session_type: params.sessionType,
            status: "scheduled",
            value: params.value || patientData.session_value || 150,
            payment_status: "pending",
        }));

        const { error } = await supabase
            .from("sessions")
            .insert(sessions as never);

        if (error) {
            console.error("Error creating recurring sessions:", error);
            return { error: "Erro ao criar sessões recorrentes" };
        }

        revalidatePath("/agendamentos");
        revalidatePath("/sessoes");
        return { count: sessions.length };
    } catch (err) {
        console.error("Creation error:", err);
        return { error: "Erro ao criar sessões recorrentes" };
    }
}

export async function updateSessionNotes(
    id: string,
    notes: string
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
            .from("sessions")
            .update({ notes, updated_at: new Date().toISOString() } as never)
            .eq("id", id);

        if (error) {
            console.error("Error updating notes:", error);
            return { error: "Erro ao salvar anotações" };
        }

        revalidatePath(`/sessoes/${id}`);
        return { success: true };
    } catch (err) {
        console.error("Update error:", err);
        return { error: "Erro ao salvar anotações" };
    }
}

export async function updateSessionEvolution(
    id: string,
    evolution: string
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
            .from("sessions")
            .update({ evolution, updated_at: new Date().toISOString() } as never)
            .eq("id", id);

        if (error) {
            console.error("Error updating evolution:", error);
            return { error: "Erro ao salvar evolução" };
        }

        revalidatePath(`/sessoes/${id}`);
        return { success: true };
    } catch (err) {
        console.error("Update error:", err);
        return { error: "Erro ao salvar evolução" };
    }
}
