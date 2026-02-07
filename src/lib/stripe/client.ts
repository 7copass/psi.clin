import Stripe from "stripe";

// Lazy initialization para evitar erro em build time
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error("STRIPE_SECRET_KEY not configured");
        }
        _stripe = new Stripe(key, {
            apiVersion: "2026-01-28.clover",
            typescript: true,
        });
    }
    return _stripe;
}

// Alias para backward compat
export const stripe = {
    get checkout() {
        return getStripe().checkout;
    },
    get billingPortal() {
        return getStripe().billingPortal;
    },
    get webhooks() {
        return getStripe().webhooks;
    },
};
