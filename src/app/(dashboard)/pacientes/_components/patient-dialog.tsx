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
import { PatientForm } from "./patient-form";
import { createPatient } from "@/lib/actions/patients";
import { toast } from "sonner";
import type { PatientFormData } from "@/lib/validators/patient";

export function PatientDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(data: PatientFormData) {
        setIsLoading(true);

        try {
            const result = await createPatient(data);

            if (result.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            toast.success("Paciente cadastrado com sucesso!");
            setOpen(false);
        } catch (error) {
            console.error("Error creating patient:", error);
            toast.error("Erro ao cadastrar paciente");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Paciente
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Paciente</DialogTitle>
                </DialogHeader>
                <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
