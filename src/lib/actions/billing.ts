"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createCheckoutSession, getPriceIds } from "@/lib/stripe/checkout";
import { createPortalSession, getSubscription } from "@/lib/stripe/subscriptions";

/**
 * Inicia checkout para um plano
 */
export async function startCheckout(plan: "essential" | "professional" | "clinic") {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const priceIds = getPriceIds();
    const priceId = priceIds[plan];

    if (!priceId) {
        throw new Error("Plano inválido");
    }

    const url = await createCheckoutSession(user.id, user.email!, priceId);

    if (url) {
        redirect(url);
    }
}

/**
 * Abre portal de gerenciamento
 */
export async function openBillingPortal() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const subscription = await getSubscription(user.id);

    if (!subscription?.stripe_customer_id) {
        throw new Error("Você não possui uma assinatura ativa");
    }

    const url = await createPortalSession(subscription.stripe_customer_id);

    if (url) {
        redirect(url);
    }
}
