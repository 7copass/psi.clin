"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createBilling, getPlanPrices } from "@/lib/abacatepay/checkout";
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

    const prices = getPlanPrices();
    const price = prices[plan];

    if (!price) {
        throw new Error("Plano inválido");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const billing = await createBilling({
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
            {
                externalId: `plan_${plan}`,
                name: `Plano ${plan.toUpperCase()}`,
                description: `Assinatura do plano ${plan}`,
                quantity: 1,
                price: price,
            }
        ],
        returnUrl: `${appUrl}/conta/assinatura?canceled=true`,
        completionUrl: `${appUrl}/conta/assinatura?success=true`,
        customer: {
            name: user.user_metadata?.full_name || "Profissional",
            cellphone: "11999999999",
            email: user.email!,
            taxId: "00000000000",
        },
        metadata: {
            userId: user.id,
            plan: plan
        }
    });

    if (billing?.url) {
        redirect(billing.url);
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
