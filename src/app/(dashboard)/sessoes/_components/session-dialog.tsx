"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SessionForm } from "./session-form";
import { createSession } from "@/lib/actions/sessions";
import { toast } from "sonner";
import type { SessionFormData } from "@/lib/validators/session";
import type { Patient } from "@/lib/types/database";

interface SessionDialogProps {
    patients: Pick<Patient, "id" | "full_name">[];
    defaultPatientId?: string;
}

export function SessionDialog({ patients, defaultPatientId }: SessionDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(data: SessionFormData) {
        setIsLoading(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        const result = await createSession(formData);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success("Sessão agendada com sucesso!");
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Sessão
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Nova Sessão</DialogTitle>
                </DialogHeader>
                <SessionForm
                    patients={patients}
                    defaultPatientId={defaultPatientId}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
