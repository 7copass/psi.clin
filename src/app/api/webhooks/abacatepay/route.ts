import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const bodyText = await request.text();
        const signature = request.headers.get("x-webhook-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
        if (secret) {
            const hash = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
            if (hash !== signature) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        }

        const body = JSON.parse(bodyText);
        const event = body.event;

        if (event === "billing.paid") {
            const data = body.data;
            const metadata = data.metadata || data.customer?.metadata;

            if (metadata?.userId && metadata?.plan) {
                const userId = metadata.userId;
                const plan = metadata.plan;

                await supabaseAdmin.from("subscriptions").upsert({
                    professional_id: userId,
                    stripe_customer_id: data.customer?.id || data.id, // reaproveitando a coluna
                    stripe_subscription_id: data.id,
                    status: "active",
                    plan: plan,
                    updated_at: new Date().toISOString(),
                });

                await supabaseAdmin
                    .from("professionals")
                    .update({ subscription_status: "active", plan })
                    .eq("id", userId);
            }
        } else if (event === "billing.canceled" || event === "billing.failed") {
            const data = body.data;

            await supabaseAdmin.from("subscriptions")
                .update({ status: event === "billing.canceled" ? "canceled" : "past_due", updated_at: new Date().toISOString() })
                .eq("stripe_subscription_id", data.id);

            const { data: sub } = await supabaseAdmin
                .from("subscriptions")
                .select("professional_id")
                .eq("stripe_subscription_id", data.id)
                .single();

            if (sub?.professional_id) {
                await supabaseAdmin
                    .from("professionals")
                    .update({
                        subscription_status: event === "billing.canceled" ? "canceled" : "past_due",
                        plan: event === "billing.canceled" ? "free" : undefined
                    })
                    .eq("id", sub.professional_id);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("AbacatePay Webhook error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
    }
}
