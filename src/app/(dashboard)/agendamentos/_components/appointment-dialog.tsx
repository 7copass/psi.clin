"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    SESSION_TYPES,
    RECURRENCE_TYPES,
    TIME_SLOTS,
} from "@/lib/utils/constants";
import { createSession } from "@/lib/actions/sessions";
import { createRecurringSessions } from "@/lib/actions/sessions";
import type { Patient } from "@/lib/types/database";

const appointmentSchema = z.object({
    patient_id: z.string().min(1, "Selecione um paciente"),
    session_date: z.string().min(1, "Selecione uma data"),
    start_time: z.string().min(1, "Selecione um horário"),
    end_time: z.string().optional(),
    session_type: z.enum(["in_person", "online"]),
    recurrence_type: z.enum(["none", "weekly", "biweekly", "monthly"]),
    recurrence_end_date: z.string().optional(),
    value: z.coerce.number().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patients: Pick<Patient, "id" | "full_name" | "session_value">[];
    initialDate?: string;
    onSuccess: () => void;
}

export function AppointmentDialog({
    open,
    onOpenChange,
    patients,
    initialDate,
    onSuccess,
}: AppointmentDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema) as never,
        defaultValues: {
            patient_id: "",
            session_date: initialDate || new Date().toISOString().split("T")[0],
            start_time: "",
            end_time: "",
            session_type: "in_person",
            recurrence_type: "none",
            recurrence_end_date: "",
            value: undefined,
        },
    });

    const recurrenceType = form.watch("recurrence_type");
    const selectedPatientId = form.watch("patient_id");
    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    const onSubmit = async (data: AppointmentFormData) => {
        setIsLoading(true);

        try {
            if (data.recurrence_type !== "none" && data.recurrence_end_date) {
                // Create recurring sessions
                const result = await createRecurringSessions({
                    patientId: data.patient_id,
                    startDate: data.session_date,
                    startTime: data.start_time,
                    endTime: data.end_time,
                    sessionType: data.session_type,
                    recurrenceType: data.recurrence_type,
                    recurrenceEndDate: data.recurrence_end_date,
                    value: data.value || selectedPatient?.session_value,
                });

                if (result.error) {
                    toast.error(result.error);
                    return;
                }

                toast.success(`${result.count} sessões criadas`);
            } else {
                // Create single session
                const formData = new FormData();
                formData.append("patient_id", data.patient_id);
                formData.append("session_date", data.session_date);
                formData.append("start_time", data.start_time);
                if (data.end_time) formData.append("end_time", data.end_time);
                formData.append("session_type", data.session_type);
                if (data.value) formData.append("value", String(data.value));

                const result = await createSession(formData);

                if (result.error) {
                    toast.error(result.error);
                    return;
                }

                toast.success("Sessão agendada");
            }

            onOpenChange(false);
            form.reset();
            onSuccess();
            router.refresh();
        } catch {
            toast.error("Erro ao criar agendamento");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="patient_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paciente *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um paciente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="session_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Horário *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Horário" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TIME_SLOTS.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="session_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de sessão</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="in_person">
                                                {SESSION_TYPES.in_person.label}
                                            </SelectItem>
                                            <SelectItem value="online">
                                                {SESSION_TYPES.online.label}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="recurrence_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recorrência</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(RECURRENCE_TYPES).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>
                                                    {value.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {recurrenceType !== "none" && (
                            <FormField
                                control={form.control}
                                name="recurrence_end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repetir até</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Valor{" "}
                                        {selectedPatient?.session_value && (
                                            <span className="text-slate-500 font-normal">
                                                (padrão: R$ {selectedPatient.session_value})
                                            </span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder={String(selectedPatient?.session_value || 150)}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "Salvando..." : "Agendar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
