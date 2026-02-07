"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSessionStatus, updatePaymentStatus } from "@/lib/actions/sessions";

interface SessionActionsProps {
    sessionId: string;
    currentStatus: string;
    currentPaymentStatus: string;
}

export function SessionActions({
    sessionId,
    currentStatus,
    currentPaymentStatus,
}: SessionActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleStatusUpdate = async (
        status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
    ) => {
        setIsLoading(status);
        try {
            const result = await updateSessionStatus(sessionId, status);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(
                    status === "completed"
                        ? "Sessão marcada como realizada!"
                        : status === "confirmed"
                            ? "Sessão confirmada!"
                            : status === "cancelled"
                                ? "Sessão cancelada"
                                : "Status atualizado!"
                );
                router.refresh();
            }
        } catch {
            toast.error("Erro ao atualizar status");
        } finally {
            setIsLoading(null);
        }
    };

    const handlePaymentUpdate = async (paymentStatus: "pending" | "paid" | "partial") => {
        setIsLoading("payment");
        try {
            const result = await updatePaymentStatus(sessionId, paymentStatus);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(
                    paymentStatus === "paid"
                        ? "Pagamento registrado!"
                        : "Status de pagamento atualizado!"
                );
                router.refresh();
            }
        } catch {
            toast.error("Erro ao atualizar pagamento");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <>
            {/* Payment Button */}
            {currentPaymentStatus !== "paid" && (
                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handlePaymentUpdate("paid")}
                    disabled={isLoading !== null}
                >
                    {isLoading === "payment" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Marcar como pago
                </Button>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
                <h3 className="text-lg font-semibold">Ações Rápidas</h3>
                <Separator />
                <div className="space-y-2">
                    {currentStatus === "scheduled" && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleStatusUpdate("confirmed")}
                            disabled={isLoading !== null}
                        >
                            {isLoading === "confirmed" && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Confirmar sessão
                        </Button>
                    )}
                    {currentStatus !== "completed" && (
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleStatusUpdate("completed")}
                            disabled={isLoading !== null}
                        >
                            {isLoading === "completed" && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Marcar como realizada
                        </Button>
                    )}
                    {currentStatus !== "cancelled" && (
                        <Button
                            variant="outline"
                            className="w-full text-red-600 hover:bg-red-50"
                            onClick={() => handleStatusUpdate("cancelled")}
                            disabled={isLoading !== null}
                        >
                            {isLoading === "cancelled" && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Cancelar sessão
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
