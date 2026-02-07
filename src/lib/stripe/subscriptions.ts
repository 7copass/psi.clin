import { stripe } from "./client";
import { createClient } from "@/lib/supabase/server";

/**
 * Cria sessão do Billing Portal
 */
export async function createPortalSession(customerId: string) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/conta/assinatura`,
    });

    return session.url;
}

/**
 * Busca o plano atual do usuário
 */
export async function getUserPlan(userId: string): Promise<string> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("professional_id", userId)
        .single();

    const subscription = data as { plan: string; status: string } | null;
    if (!subscription || subscription.status !== "active") return "free";
    return subscription.plan;
}

interface Subscription {
    id: string;
    professional_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan: string;
    status: string;
    current_period_end: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Busca dados completos da assinatura
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("professional_id", userId)
        .single();

    if (error || !data) return null;
    return data as Subscription;
}

/**
 * Verifica se usuário pode usar uma feature
 */
export function canUseFeature(plan: string, feature: string): boolean {
    const permissions: Record<string, string[]> = {
        free: ["patients_5", "transcriptions_3", "smartnotes_3"],
        essential: [
            "patients_50",
            "transcriptions_40",
            "smartnotes_unlimited",
            "summaries_5",
        ],
        professional: [
            "patients_unlimited",
            "transcriptions_120",
            "smartnotes_unlimited",
            "summaries_unlimited",
            "assistant_100",
        ],
        clinic: [
            "patients_unlimited",
            "transcriptions_unlimited",
            "smartnotes_unlimited",
            "summaries_unlimited",
            "assistant_unlimited",
            "multi_professional",
        ],
    };

    return permissions[plan]?.includes(feature) ?? false;
}
