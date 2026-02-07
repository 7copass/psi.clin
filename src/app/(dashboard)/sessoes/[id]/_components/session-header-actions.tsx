"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSessionStatus } from "@/lib/actions/sessions";

interface SessionHeaderActionsProps {
    sessionId: string;
    currentStatus: string;
    isPast: boolean;
}

export function SessionHeaderActions({
    sessionId,
    currentStatus,
    isPast,
}: SessionHeaderActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStartSession = async () => {
        setIsLoading(true);
        try {
            // Change status to "confirmed" or go directly to session page
            const result = await updateSessionStatus(sessionId, "confirmed");
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Sessão iniciada!");
                router.refresh();
            }
        } catch {
            toast.error("Erro ao iniciar sessão");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/sessoes/${sessionId}/editar`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Link>
            </Button>
            {currentStatus !== "completed" && currentStatus !== "cancelled" && !isPast && (
                <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleStartSession}
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {currentStatus === "confirmed" ? "Sessão em andamento" : "Iniciar Sessão"}
                </Button>
            )}
        </div>
    );
}
