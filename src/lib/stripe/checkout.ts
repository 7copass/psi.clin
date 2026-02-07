import { stripe } from "./client";

/**
 * Cria sessão de checkout para nova assinatura
 */
export async function createCheckoutSession(
    userId: string,
    userEmail: string,
    priceId: string
) {
    const session = await stripe.checkout.sessions.create({
        customer_email: userEmail,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/conta/assinatura?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/conta/assinatura?canceled=true`,
        metadata: { userId },
        allow_promotion_codes: true,
        billing_address_collection: "required",
    });

    return session.url;
}

/**
 * Retorna os Price IDs configurados
 */
export function getPriceIds() {
    return {
        essential: process.env.STRIPE_PRICE_ESSENTIAL!,
        professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
        clinic: process.env.STRIPE_PRICE_CLINIC!,
    };
}
