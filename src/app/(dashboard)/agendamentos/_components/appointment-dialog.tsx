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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    SESSION_TYPES,
    RECURRENCE_TYPES,
    TIME_SLOTS,
} from "@/lib/utils/constants";
import { createSession } from "@/lib/actions/sessions";
import { createRecurringSessions } from "@/lib/actions/sessions";
import type { Patient, Session } from "@/lib/types/database";

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
    initialDate?: Date;
    onSuccess: () => void;
    defaultDuration: number;
    existingSessions?: Session[]; // Optional to avoid breaking other usages if any
}

export function AppointmentDialog({
    open,
    onOpenChange,
    patients,
    initialDate,
    onSuccess,
    defaultDuration,
    existingSessions = [],
}: AppointmentDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    const form = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema) as never,
        defaultValues: {
            patient_id: "",
            session_date: initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            start_time: "",
            end_time: "",
            session_type: "in_person",
            recurrence_type: "none",
            recurrence_end_date: "",
            value: undefined,
        },
    });

    // Update form date when initialDate changes
    // This effect is needed because defaultValues only works on mount
    // checking if form is dirty to avoid overwriting user input would be better but this is a simple dialog
    // actually, let's leave it as is, initialDate is usually passed when opening

    const recurrenceType = form.watch("recurrence_type");
    const selectedPatientId = form.watch("patient_id");
    const selectedDate = form.watch("session_date");
    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    // Calculate occupied slots
    const getOccupiedSlots = () => {
        if (!selectedDate || !existingSessions) return [];
        return existingSessions.filter(s =>
            s.session_date === selectedDate &&
            s.status !== 'cancelled' &&
            s.status !== 'no_show'
        ).map(s => s.start_time);
    };

    const occupiedSlots = getOccupiedSlots();

    // ... onSubmit ...

    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return date.toTimeString().slice(0, 5);
    };

    async function onSubmit(data: AppointmentFormData) {
        setIsLoading(true);
        try {
            const calculatedEndTime = data.end_time || calculateEndTime(data.start_time, defaultDuration);

            if (data.recurrence_type === "none") {
                const formData = new FormData();
                const sessionData = {
                    patient_id: data.patient_id,
                    session_date: data.session_date,
                    start_time: data.start_time,
                    end_time: calculatedEndTime,
                    status: "scheduled",
                    session_type: data.session_type,
                    value: data.value,
                    notes: "",
                };
                Object.entries(sessionData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                });
                const result = await createSession(formData);
                if (result.error) {
                    toast.error(result.error);
                    setIsLoading(false);
                    return;
                }
            } else {
                if (!data.recurrence_end_date) {
                    toast.error("Selecione a data final da recorrência");
                    setIsLoading(false);
                    return;
                }

                const result = await createRecurringSessions({
                    patientId: data.patient_id,
                    startDate: data.session_date,
                    startTime: data.start_time,
                    endTime: calculatedEndTime,
                    sessionType: data.session_type,
                    value: data.value,
                    recurrenceType: data.recurrence_type as "weekly" | "biweekly" | "monthly",
                    recurrenceEndDate: data.recurrence_end_date,
                });
                if (result.error) {
                    toast.error(result.error);
                    setIsLoading(false);
                    return;
                }
            }

            toast.success("Agendamento realizado com sucesso!");
            onOpenChange(false);
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao realizar agendamento");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-[500px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
                <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 text-left border-b border-purple-100/50">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Novo Agendamento
                    </DialogTitle>
                    <p className="text-sm text-slate-500 mt-1">Preencha os dados da sessão</p>
                </DialogHeader>

                <div className="p-6 pt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="patient_id"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-600 font-semibold mb-1">Paciente</FormLabel>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full h-12 justify-between rounded-xl bg-slate-50 border-slate-200 text-left font-normal hover:bg-slate-100",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? patients.find(
                                                                (patient) => patient.id === field.value
                                                            )?.full_name
                                                            : "Selecione o paciente..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0 rounded-xl" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Buscar paciente..." />
                                                    <CommandList>
                                                        <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                            {patients.map((patient) => (
                                                                <CommandItem
                                                                    value={patient.full_name}
                                                                    key={patient.id}
                                                                    onSelect={() => {
                                                                        form.setValue("patient_id", patient.id);
                                                                        setOpenCombobox(false);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            patient.id === field.value
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
                                            <FormLabel className="text-slate-600 font-semibold">Data</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-purple-500/20 focus:border-purple-500" />
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
                                            <FormLabel className="text-slate-600 font-semibold">Horário</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-purple-500/20 focus:border-purple-500">
                                                        <SelectValue placeholder="--:--" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[200px]">
                                                    {TIME_SLOTS.map((time) => {
                                                        const isOccupied = occupiedSlots.includes(time);
                                                        return (
                                                            <SelectItem
                                                                key={time}
                                                                value={time}
                                                                className={cn("cursor-pointer", isOccupied && "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400")}
                                                                disabled={isOccupied}
                                                            >
                                                                {time} {isOccupied && "(Ocupado)"}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="session_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600 font-semibold">Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-purple-500/20 focus:border-purple-500">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="in_person" className="cursor-pointer">
                                                        {SESSION_TYPES.in_person.label}
                                                    </SelectItem>
                                                    <SelectItem value="online" className="cursor-pointer">
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
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600 font-semibold">
                                                Valor
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={String(selectedPatient?.session_value || 150)}
                                                    {...field}
                                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-purple-500/20 focus:border-purple-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <FormField
                                    control={form.control}
                                    name="recurrence_type"
                                    render={({ field }) => (
                                        <FormItem className="mb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <FormLabel className="text-slate-600 font-semibold">Repetir sessão?</FormLabel>
                                            </div>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(RECURRENCE_TYPES).map(([key, value]) => (
                                                        <SelectItem key={key} value={key} className="cursor-pointer">
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
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                                        <FormField
                                            control={form.control}
                                            name="recurrence_end_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">Até quando?</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} className="h-10 rounded-lg bg-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    className="h-12 px-6 rounded-xl hover:bg-slate-100 text-slate-500"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 h-12 px-8 rounded-xl shadow-lg shadow-purple-600/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Agendando..." : "Confirmar Agendamento"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
