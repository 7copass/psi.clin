"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Tipos
interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    pendingPayments: number;
    sessionsThisMonth: number;
    avgSessionValue: number;
}

interface Transaction {
    id: string;
    type: "income" | "expense";
    category: string;
    description: string;
    amount: number;
    date: string;
    patient_id?: string;
    session_id?: string;
    payment_method?: string;
    payment_status?: string;
    created_at: string;
}

interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
}

/**
 * Busca resumo financeiro do período
 */
export async function getFinancialSummary(period?: {
    startDate?: string;
    endDate?: string;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autenticado", data: null };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

    const startDate = period?.startDate || startOfMonth;
    const endDate = period?.endDate || endOfMonth;

    // Buscar sessões do período com pagamento
    const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, value, payment_status, session_date")
        .eq("professional_id", user.id)
        .gte("session_date", startDate)
        .lte("session_date", endDate);

    if (sessionsError) {
        return { error: sessionsError.message, data: null };
    }

    const sessionsList = sessions as {
        id: string;
        value: number | null;
        payment_status: string;
    }[];

    // Calcular totais
    const paidSessions = sessionsList.filter((s) => s.payment_status === "paid");
    const pendingSessions = sessionsList.filter(
        (s) => s.payment_status === "pending"
    );

    const totalIncome = paidSessions.reduce((sum, s) => sum + (s.value || 0), 0);
    const pendingPayments = pendingSessions.reduce(
        (sum, s) => sum + (s.value || 0),
        0
    );
    const avgSessionValue =
        paidSessions.length > 0 ? totalIncome / paidSessions.length : 0;

    const summary: FinancialSummary = {
        totalIncome,
        totalExpenses: 0, // Implementar quando tiver tabela de despesas
        netBalance: totalIncome,
        pendingPayments,
        sessionsThisMonth: sessionsList.length,
        avgSessionValue,
    };

    return { data: summary, error: null };
}

/**
 * Busca transações (baseado em sessões pagas/pendentes)
 */
export async function getTransactions(options?: {
    startDate?: string;
    endDate?: string;
    type?: "income" | "expense" | "all";
    limit?: number;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autenticado", data: [] };
    }

    const limit = options?.limit || 50;

    // Buscar sessões como transações de receita
    let query = supabase
        .from("sessions")
        .select("id, value, payment_status, session_date, patient_id, patients(full_name)")
        .eq("professional_id", user.id)
        .order("session_date", { ascending: false })
        .limit(limit);

    if (options?.startDate) {
        query = query.gte("session_date", options.startDate);
    }
    if (options?.endDate) {
        query = query.lte("session_date", options.endDate);
    }

    const { data: sessions, error } = await query;

    if (error) {
        return { error: error.message, data: [] };
    }

    interface SessionWithPatient {
        id: string;
        value: number | null;
        payment_status: string;
        session_date: string;
        patient_id: string;
        patients: { full_name: string } | null;
    }

    // Converter sessões em transações
    const transactions: Transaction[] = (sessions as SessionWithPatient[]).map((s) => ({
        id: s.id,
        type: "income" as const,
        category: "session_payment",
        description: `Sessão - ${s.patients?.full_name || "Paciente"}`,
        amount: s.value || 0,
        date: s.session_date,
        patient_id: s.patient_id,
        session_id: s.id,
        payment_method: undefined,
        payment_status: s.payment_status,
        created_at: s.session_date,
    }));

    // Filtrar por tipo se especificado
    if (options?.type && options.type !== "all") {
        return {
            data: transactions.filter((t) => t.type === options.type),
            error: null,
        };
    }

    return { data: transactions, error: null };
}

/**
 * Atualiza status de pagamento de uma sessão
 */
export async function updatePaymentStatus(
    sessionId: string,
    status: "pending" | "paid" | "partial" | "cancelled",
    paymentMethod?: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autenticado", success: false };
    }

    const updateData: Record<string, unknown> = {
        payment_status: status,
        updated_at: new Date().toISOString(),
    };

    if (paymentMethod) {
        updateData.payment_method = paymentMethod;
    }

    const { error } = await supabase
        .from("sessions")
        .update(updateData as never)
        .eq("id", sessionId)
        .eq("professional_id", user.id);

    if (error) {
        return { error: error.message, success: false };
    }

    revalidatePath("/financeiro");
    revalidatePath("/sessoes");

    return { success: true, error: null };
}

/**
 * Busca dados para gráfico mensal
 */
export async function getMonthlyChartData(months = 6) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autenticado", data: [] };
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
        .toISOString()
        .split("T")[0];

    const { data: sessions, error } = await supabase
        .from("sessions")
        .select("value, payment_status, session_date")
        .eq("professional_id", user.id)
        .eq("payment_status", "paid")
        .gte("session_date", startDate);

    if (error) {
        return { error: error.message, data: [] };
    }

    // Agrupar por mês
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    (sessions as { value: number | null; session_date: string }[]).forEach((s) => {
        const date = new Date(s.session_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { income: 0, expenses: 0 });
        }

        const current = monthlyMap.get(monthKey)!;
        current.income += s.value || 0;
    });

    // Converter para array ordenado
    const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
            month,
            income: data.income,
            expenses: data.expenses,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return { data: monthlyData, error: null };
}
