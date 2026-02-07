import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Admin client para webhooks (sem auth do usuário)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Determina o plano baseado no price_id
 */
function determinePlan(priceId: string): string {
    const priceMap: Record<string, string> = {
        [process.env.STRIPE_PRICE_ESSENTIAL!]: "essential",
        [process.env.STRIPE_PRICE_PROFESSIONAL!]: "professional",
        [process.env.STRIPE_PRICE_CLINIC!]: "clinic",
    };

    return priceMap[priceId] || "free";
}

/**
 * Processa eventos do webhook Stripe
 */
export async function handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;

            if (!userId) {
                console.error("No userId in checkout session metadata");
                return;
            }

            // Buscar subscription para pegar o price_id
            let plan = "essential";
            if (session.subscription) {
                const subscription = await fetch(
                    `https://api.stripe.com/v1/subscriptions/${session.subscription}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                        },
                    }
                ).then((r) => r.json());

                if (subscription.items?.data?.[0]?.price?.id) {
                    plan = determinePlan(subscription.items.data[0].price.id);
                }
            }

            await supabaseAdmin.from("subscriptions").upsert({
                professional_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                status: "active",
                plan,
                updated_at: new Date().toISOString(),
            });

            // Atualizar professional
            await supabaseAdmin
                .from("professionals")
                .update({ subscription_status: "active", plan })
                .eq("id", userId);

            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            await supabaseAdmin
                .from("subscriptions")
                .update({
                    status: "active",
                    current_period_end: invoice.lines.data[0]?.period?.end
                        ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
                        : null,
                    updated_at: new Date().toISOString(),
                })
                .eq("stripe_customer_id", invoice.customer as string);
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            await supabaseAdmin
                .from("subscriptions")
                .update({ status: "past_due", updated_at: new Date().toISOString() })
                .eq("stripe_customer_id", invoice.customer as string);

            await supabaseAdmin
                .from("professionals")
                .update({ subscription_status: "past_due" })
                .eq(
                    "id",
                    (
                        await supabaseAdmin
                            .from("subscriptions")
                            .select("professional_id")
                            .eq("stripe_customer_id", invoice.customer as string)
                            .single()
                    ).data?.professional_id
                );
            break;
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const priceId = subscription.items.data[0]?.price?.id;
            const plan = priceId ? determinePlan(priceId) : undefined;

            const updateData: Record<string, unknown> = {
                status: subscription.status === "active" ? "active" : subscription.status,
                updated_at: new Date().toISOString(),
            };

            if (plan) {
                updateData.plan = plan;
            }

            const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
            if (periodEnd) {
                updateData.current_period_end = new Date(periodEnd * 1000).toISOString();
            }

            await supabaseAdmin
                .from("subscriptions")
                .update(updateData)
                .eq("stripe_subscription_id", subscription.id);
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            await supabaseAdmin
                .from("subscriptions")
                .update({
                    status: "canceled",
                    plan: "free",
                    updated_at: new Date().toISOString(),
                })
                .eq("stripe_subscription_id", subscription.id);

            // Reverter professional para free
            const { data: sub } = await supabaseAdmin
                .from("subscriptions")
                .select("professional_id")
                .eq("stripe_subscription_id", subscription.id)
                .single();

            if (sub?.professional_id) {
                await supabaseAdmin
                    .from("professionals")
                    .update({ subscription_status: "canceled", plan: "free" })
                    .eq("id", sub.professional_id);
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
}
