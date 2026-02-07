import { z } from "zod";

// Schema base para paciente - campos obrigatórios marcados
export const patientSchema = z.object({
    // OBRIGATÓRIOS
    full_name: z
        .string()
        .min(3, "Nome deve ter no mínimo 3 caracteres")
        .max(100, "Nome deve ter no máximo 100 caracteres"),
    phone: z
        .string()
        .min(10, "Telefone deve ter no mínimo 10 dígitos")
        .max(20, "Telefone inválido"),
    gender: z.enum(["female", "male", "non_binary", "other", "prefer_not_to_say"]),

    // OPCIONAIS
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    cpf: z.string().optional(),
    birth_date: z.string().optional(),
    is_minor: z.boolean().optional(),
    profession: z.string().max(100).optional(),
    address: z.string().max(255).optional(),
    country: z.string().optional(),
    health_insurance: z.string().max(100).optional(),
    treatment: z.string().max(100).optional(),
    medications: z.array(z.string()).optional(),

    // Contatos de emergência
    emergency_contact_1_name: z.string().max(100).optional(),
    emergency_contact_1_phone: z.string().max(20).optional(),
    emergency_contact_2_name: z.string().max(100).optional(),
    emergency_contact_2_phone: z.string().max(20).optional(),

    // Pagamento
    billing_model: z.enum(["per_session", "monthly_package"]).optional(),
    session_value: z.coerce.number().min(0).optional(),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

// Schema para atualização (todos os campos opcionais)
export const patientUpdateSchema = patientSchema.partial();

export type PatientUpdateData = z.infer<typeof patientUpdateSchema>;
