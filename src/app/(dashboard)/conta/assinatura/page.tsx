import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check, Sparkles, Crown, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/utils/constants";
import { getSubscription } from "@/lib/stripe/subscriptions";
import { startCheckout, openBillingPortal } from "@/lib/actions/billing";

export default async function AssinaturaPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const subscription = await getSubscription(user.id);
    const currentPlan = subscription?.plan && subscription.plan !== "free" ? subscription.plan : "trial";
    const status = subscription?.status || "active";

    const plans = [
        {
            key: "essential",
            name: "Essencial",
            price: 59.90,
            tagline: "Para psicólogos que estão começando a organizar sua prática clínica.",
            icon: Sparkles,
            features: [
                "Até 50 pacientes",
                "40 transcrições/mês (~10h)",
                "SmartNotes ilimitado",
                "5 Resumos Consolidados/mês",
                "Ficha de Evolução com IA",
                "Editor de notas clínicas",
            ],
            featured: false,
        },
        {
            key: "professional",
            name: "Profissional",
            price: 79.90,
            tagline: "Para psicólogos que querem automatizar sua agenda e focar no que importa.",
            icon: Crown,
            features: [
                "Pacientes ilimitados",
                "120 transcrições/mês (~30h)",
                "SmartNotes ilimitado",
                "Resumos Consolidados ilimitados",
                "Ficha de Evolução com IA",
                "Avisos automáticos via WhatsApp",
                "Suporte prioritário",
            ],
            featured: true,
        },
        {
            key: "clinic",
            name: "Clínica",
            price: 99.90,
            tagline: "Para clínicas e equipes que precisam de controle total em um só lugar.",
            icon: Building2,
            features: [
                "Tudo do Profissional",
                "Transcrições ilimitadas",
                "Assistente IA ilimitado",
                "Multi-profissionais",
                "Gestão de equipe",
                "Avisos WhatsApp ilimitados",
            ],
            featured: false,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Assinatura
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Gerencie seu plano e acesse todos os recursos
                </p>
            </div>

            {/* Status messages */}
            {params.success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                        ✅ Assinatura realizada com sucesso! Obrigado por escolher o PSI.CLIN.
                    </p>
                </div>
            )}

            {params.canceled && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-700 dark:text-yellow-300">
                        Checkout cancelado. Você pode tentar novamente quando quiser.
                    </p>
                </div>
            )}

            {/* Current plan */}
            {currentPlan !== "trial" && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Plano atual</p>
                            <p className="text-xl font-bold flex items-center gap-2">
                                {PLANS[currentPlan as keyof typeof PLANS]?.name || currentPlan}
                                <Badge
                                    variant={status === "active" ? "default" : "destructive"}
                                    className={status === "active" ? "bg-green-100 text-green-700" : ""}
                                >
                                    {status === "active" ? "Ativo" : status === "past_due" ? "Pendente" : status}
                                </Badge>
                            </p>
                        </div>
                        <form action={openBillingPortal}>
                            <Button variant="outline">Gerenciar assinatura</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Plans grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => {
                    const isCurrentPlan = plan.key === currentPlan;
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.key}
                            className={`relative bg-white dark:bg-slate-800 rounded-xl border p-6 ${plan.featured
                                ? "border-purple-500 ring-2 ring-purple-500/20"
                                : ""
                                } ${isCurrentPlan ? "bg-purple-50 dark:bg-purple-900/10" : ""}`}
                        >
                            {plan.featured && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
                                    Mais popular
                                </Badge>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Icon className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                            </div>

                            {plan.tagline && (
                                <p className="text-xs text-slate-500 mb-4 min-h-[40px]">
                                    {plan.tagline}
                                </p>
                            )}

                            <div className="mb-4">
                                <span className="text-3xl font-bold">
                                    {plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-slate-500">/mês</span>
                                )}
                            </div>

                            <ul className="space-y-2 mb-6 text-sm">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {isCurrentPlan ? (
                                <Button variant="outline" disabled className="w-full border-purple-500 text-purple-700 dark:text-purple-400">
                                    Seu Plano Atual
                                </Button>
                            ) : (
                                <form
                                    action={async () => {
                                        "use server";
                                        await startCheckout(plan.key as "essential" | "professional" | "clinic");
                                    }}
                                >
                                    <Button
                                        className={`w-full ${plan.featured
                                            ? "bg-purple-600 hover:bg-purple-700"
                                            : ""
                                            }`}
                                    >
                                        {plan.key === "essential" ? "Teste por 14 dias grátis" : "Assinar"}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* FAQ */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Perguntas frequentes</h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <p className="font-medium">Posso trocar de plano a qualquer momento?</p>
                        <p className="text-slate-500">
                            Sim! O upgrade é imediato e o downgrade vale a partir do próximo ciclo.
                        </p>
                    </div>
                    <div>
                        <p className="font-medium">O que acontece com meus dados se eu cancelar?</p>
                        <p className="text-slate-500">
                            Seus dados ficam salvos por 90 dias. Você pode reativar quando quiser.
                        </p>
                    </div>
                    <div>
                        <p className="font-medium">Quais formas de pagamento são aceitas?</p>
                        <p className="text-slate-500">
                            PIX, Cartão de crédito e Ticket (via Abacate Pay).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
