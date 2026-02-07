"use client";

import { useState, useEffect } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionSchema, type SessionFormData } from "@/lib/validators/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { SESSION_TYPES, SESSION_STATUS, PAYMENT_STATUS } from "@/lib/utils/constants";
import type { Patient, Session } from "@/lib/types/database";

interface SessionFormProps {
    patients: Pick<Patient, "id" | "full_name">[];
    session?: Session;
    defaultPatientId?: string;
    onSubmit: (data: SessionFormData) => Promise<void>;
    isLoading?: boolean;
}

export function SessionForm({
    patients,
    session,
    defaultPatientId,
    onSubmit,
    isLoading,
}: SessionFormProps) {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SessionFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(sessionSchema) as any,
        defaultValues: {
            patient_id: session?.patient_id || defaultPatientId || "",
            session_date: session?.session_date || new Date().toISOString().split("T")[0],
            start_time: session?.start_time || "",
            end_time: session?.end_time || "",
            duration_minutes: session?.duration_minutes || 50,
            session_type: (session?.session_type === "presential" ? "in_person" : session?.session_type) || "in_person",
            status: session?.status || "scheduled",
            value: session?.value || 150,
            payment_status: (session?.payment_status === "cancelled" ? "pending" : session?.payment_status) || "pending",
            notes: session?.notes || "",
        },
    });

    // Function to calculate end time based on start time + duration
    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
        if (!startTime) return "";
        const [hours, minutes] = startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    };

    // Watch start_time and duration_minutes to auto-calculate end_time
    const startTime = watch("start_time");
    const durationMinutes = watch("duration_minutes");

    useEffect(() => {
        if (startTime && durationMinutes) {
            const calculatedEndTime = calculateEndTime(startTime, Number(durationMinutes));
            setValue("end_time", calculatedEndTime);
        }
    }, [startTime, durationMinutes, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Paciente */}
            <div className="space-y-2">
                <Label>Paciente *</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                                "w-full justify-between font-normal",
                                !watch("patient_id") && "text-muted-foreground"
                            )}
                        >
                            {watch("patient_id")
                                ? patients.find(
                                    (patient) => patient.id === watch("patient_id")
                                )?.full_name
                                : "Selecione o paciente"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Buscar paciente..." />
                            <CommandList>
                                <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                                <CommandGroup>
                                    {patients.map((patient) => (
                                        <CommandItem
                                            key={patient.id}
                                            value={patient.full_name} // Buscamos pelo NOME
                                            onSelect={() => {
                                                setValue("patient_id", patient.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    watch("patient_id") === patient.id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {patient.full_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.patient_id && (
                    <span className="text-xs text-red-500">{errors.patient_id.message}</span>
                )}
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="session_date">Data *</Label>
                    <Input id="session_date" type="date" {...register("session_date")} />
                    {errors.session_date && (
                        <span className="text-xs text-red-500">{errors.session_date.message}</span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="start_time">Horário início</Label>
                    <Input id="start_time" type="time" {...register("start_time")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_time">Horário fim</Label>
                    <Input
                        id="end_time"
                        type="time"
                        value={watch("end_time") || ""}
                        readOnly
                        className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Tipo e Duração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tipo de sessão</Label>
                    <Select
                        value={watch("session_type")}
                        onValueChange={(value) =>
                            setValue("session_type", value as "in_person" | "online")
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(SESSION_TYPES).map(([key, val]) => (
                                <SelectItem key={key} value={key}>
                                    {val.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                    <Input
                        id="duration_minutes"
                        type="number"
                        {...register("duration_minutes")}
                        placeholder="50"
                    />
                </div>
            </div>

            {/* Valor e Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                        id="value"
                        type="number"
                        step="0.01"
                        {...register("value")}
                        placeholder="150.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Status do pagamento</Label>
                    <Select
                        value={watch("payment_status")}
                        onValueChange={(value) =>
                            setValue("payment_status", value as "pending" | "paid" | "partial")
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PAYMENT_STATUS).map(([key, val]) => (
                                <SelectItem key={key} value={key}>
                                    {val.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Status da sessão (apenas para edição) */}
            {session && (
                <div className="space-y-2">
                    <Label>Status da sessão</Label>
                    <Select
                        value={watch("status")}
                        onValueChange={(value) =>
                            setValue(
                                "status",
                                value as "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(SESSION_STATUS).map(([key, val]) => (
                                <SelectItem key={key} value={key}>
                                    {val.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Anotações sobre esta sessão..."
                    rows={3}
                />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : session ? (
                        "Salvar alterações"
                    ) : (
                        "Agendar sessão"
                    )}
                </Button>
            </div>
        </form>
    );
}
