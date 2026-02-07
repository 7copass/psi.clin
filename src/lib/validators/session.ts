import { z } from "zod";

export const sessionSchema = z.object({
    patient_id: z.string().uuid("ID do paciente inválido"),
    session_date: z.string().min(1, "Data da sessão é obrigatória"),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    duration_minutes: z.coerce.number().min(1).max(480).optional(),
    session_type: z.enum(["in_person", "online"]).optional(),
    status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
    value: z.coerce.number().min(0).optional(),
    payment_status: z.enum(["pending", "paid", "partial"]).optional(),
    notes: z.string().optional(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

export const sessionUpdateSchema = sessionSchema.partial().extend({
    patient_id: z.string().uuid().optional(),
});

export type SessionUpdateData = z.infer<typeof sessionUpdateSchema>;
