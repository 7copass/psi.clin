// Database types - auto-generated style for Supabase
// For now, defining the initial schema types manually

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            professionals: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string;
                    crp: string | null;
                    phone: string | null;
                    avatar_url: string | null;
                    clinic_name: string | null;
                    clinic_cnpj: string | null;
                    clinic_address: string | null;
                    default_session_duration: number;
                    default_session_value: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name: string;
                    crp?: string | null;
                    phone?: string | null;
                    avatar_url?: string | null;
                    clinic_name?: string | null;
                    clinic_cnpj?: string | null;
                    clinic_address?: string | null;
                    default_session_duration?: number;
                    default_session_value?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string;
                    crp?: string | null;
                    phone?: string | null;
                    avatar_url?: string | null;
                    clinic_name?: string | null;
                    clinic_cnpj?: string | null;
                    clinic_address?: string | null;
                    default_session_duration?: number;
                    default_session_value?: number;
                    updated_at?: string;
                };
            };
            patients: {
                Row: {
                    id: string;
                    professional_id: string;
                    full_name: string;
                    phone: string;
                    email: string | null;
                    cpf: string | null;
                    birth_date: string | null;
                    is_minor: boolean;
                    gender: string | null;
                    profession: string | null;
                    address: string | null;
                    country: string;
                    health_insurance: string | null;
                    treatment: string | null;
                    medications: string[] | null;
                    emergency_contact_1_name: string | null;
                    emergency_contact_1_phone: string | null;
                    emergency_contact_2_name: string | null;
                    emergency_contact_2_phone: string | null;
                    billing_model: "per_session" | "monthly_package";
                    session_value: number;
                    payment_method: string | null;
                    status: "active" | "inactive" | "archived";
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    professional_id: string;
                    full_name: string;
                    phone: string;
                    email?: string | null;
                    cpf?: string | null;
                    birth_date?: string | null;
                    is_minor?: boolean;
                    gender?: string | null;
                    profession?: string | null;
                    address?: string | null;
                    country?: string;
                    health_insurance?: string | null;
                    treatment?: string | null;
                    medications?: string[] | null;
                    emergency_contact_1_name?: string | null;
                    emergency_contact_1_phone?: string | null;
                    emergency_contact_2_name?: string | null;
                    emergency_contact_2_phone?: string | null;
                    billing_model?: "per_session" | "monthly_package";
                    session_value?: number;
                    payment_method?: string | null;
                    status?: "active" | "inactive" | "archived";
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    full_name?: string;
                    phone?: string;
                    email?: string | null;
                    cpf?: string | null;
                    birth_date?: string | null;
                    is_minor?: boolean;
                    gender?: string | null;
                    profession?: string | null;
                    address?: string | null;
                    country?: string;
                    health_insurance?: string | null;
                    treatment?: string | null;
                    medications?: string[] | null;
                    emergency_contact_1_name?: string | null;
                    emergency_contact_1_phone?: string | null;
                    emergency_contact_2_name?: string | null;
                    emergency_contact_2_phone?: string | null;
                    billing_model?: "per_session" | "monthly_package";
                    session_value?: number;
                    payment_method?: string | null;
                    status?: "active" | "inactive" | "archived";
                    notes?: string | null;
                    updated_at?: string;
                };
            };
            sessions: {
                Row: {
                    id: string;
                    professional_id: string;
                    patient_id: string;
                    session_date: string;
                    start_time: string | null;
                    end_time: string | null;
                    session_type: "presential" | "online" | "in_person";
                    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
                    notes: string | null;
                    evolution: string | null;
                    evolution_generated_at: string | null;
                    duration_minutes: number | null;
                    value: number | null;
                    payment_status: "pending" | "paid" | "partial" | "cancelled";
                    transcription: string | null;
                    smartnotes: Record<string, unknown> | null;
                    ai_status: "pending" | "processing" | "completed" | "error" | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    professional_id?: string;
                    patient_id: string;
                    session_date: string;
                    start_time?: string | null;
                    end_time?: string | null;
                    session_type?: "presential" | "online" | "in_person";
                    status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
                    notes?: string | null;
                    evolution?: string | null;
                    evolution_generated_at?: string | null;
                    duration_minutes?: number | null;
                    value?: number | null;
                    payment_status?: "pending" | "paid" | "partial" | "cancelled";
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    session_date?: string;
                    start_time?: string | null;
                    end_time?: string | null;
                    session_type?: "presential" | "online" | "in_person";
                    status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
                    notes?: string | null;
                    evolution?: string | null;
                    evolution_generated_at?: string | null;
                    duration_minutes?: number | null;
                    value?: number | null;
                    payment_status?: "pending" | "paid" | "partial" | "cancelled";
                    updated_at?: string;
                };
            };
            session_audios: {
                Row: {
                    id: string;
                    session_id: string;
                    professional_id: string;
                    audio_name: string;
                    audio_url: string;
                    duration_seconds: number | null;
                    transcription: string | null;
                    transcription_status: "pending" | "processing" | "completed" | "failed";
                    smartnotes: Json | null;
                    smartnotes_size: "short" | "medium" | "long" | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    professional_id: string;
                    audio_name: string;
                    audio_url: string;
                    duration_seconds?: number | null;
                    transcription?: string | null;
                    transcription_status?: "pending" | "processing" | "completed" | "failed";
                    smartnotes?: Json | null;
                    smartnotes_size?: "short" | "medium" | "long" | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    audio_name?: string;
                    transcription?: string | null;
                    transcription_status?: "pending" | "processing" | "completed" | "failed";
                    smartnotes?: Json | null;
                    smartnotes_size?: "short" | "medium" | "long" | null;
                    updated_at?: string;
                };
            };
            anamneses: {
                Row: {
                    id: string;
                    patient_id: string;
                    professional_id: string;
                    content: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    professional_id: string;
                    content?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    content?: Json;
                    updated_at?: string;
                };
            };
            patient_summaries: {
                Row: {
                    id: string;
                    patient_id: string;
                    professional_id: string;
                    summary_content: Json;
                    sessions_included: string[] | null;
                    generated_at: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    professional_id: string;
                    summary_content: Json;
                    sessions_included?: string[] | null;
                    generated_at?: string;
                    created_at?: string;
                };
                Update: {
                    summary_content?: Json;
                    sessions_included?: string[] | null;
                    generated_at?: string;
                };
            };
            patient_documents: {
                Row: {
                    id: string;
                    patient_id: string;
                    professional_id: string;
                    name: string;
                    file_path: string;
                    file_type: string | null;
                    file_size: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    professional_id: string;
                    name: string;
                    file_path: string;
                    file_type?: string | null;
                    file_size?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    file_path?: string;
                    file_type?: string | null;
                    file_size?: number | null;
                    updated_at?: string;
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    professional_id: string;
                    stripe_customer_id: string | null;
                    stripe_subscription_id: string | null;
                    plan: "free" | "essential" | "professional" | "clinic";
                    status: "active" | "cancelled" | "past_due" | "trialing";
                    trial_ends_at: string | null;
                    current_period_start: string | null;
                    current_period_end: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    professional_id: string;
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    plan?: "free" | "essential" | "professional" | "clinic";
                    status?: "active" | "cancelled" | "past_due" | "trialing";
                    trial_ends_at?: string | null;
                    current_period_start?: string | null;
                    current_period_end?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    plan?: "free" | "essential" | "professional" | "clinic";
                    status?: "active" | "cancelled" | "past_due" | "trialing";
                    trial_ends_at?: string | null;
                    current_period_start?: string | null;
                    current_period_end?: string | null;
                    updated_at?: string;
                };
            };
            assistant_chats: {
                Row: {
                    id: string;
                    professional_id: string;
                    patient_id: string | null;
                    title: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    professional_id: string;
                    patient_id?: string | null;
                    title?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    patient_id?: string | null;
                    title?: string | null;
                    updated_at?: string;
                };
            };
            evolucoes_consolidadas: {
                Row: {
                    id: string;
                    patient_id: string;
                    professional_id: string;
                    titulo: string;
                    periodo_inicio: string;
                    periodo_fim: string;
                    sessoes_incluidas: string[];
                    conteudo_json: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    professional_id: string;
                    titulo: string;
                    periodo_inicio: string;
                    periodo_fim: string;
                    sessoes_incluidas: string[];
                    conteudo_json: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    titulo?: string;
                    conteudo_json?: Json;
                    updated_at?: string;
                };
            };
            assistant_messages: {
                Row: {
                    id: string;
                    chat_id: string;
                    role: "user" | "assistant";
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    chat_id: string;
                    role: "user" | "assistant";
                    content: string;
                    created_at?: string;
                };
                Update: {
                    content?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: {
            get_current_professional: {
                Args: Record<string, never>;
                Returns: {
                    id: string;
                    email: string;
                    full_name: string;
                    crp: string | null;
                    avatar_url: string | null;
                    plan: string;
                    trial_ends_at: string | null;
                }[];
            };
            get_dashboard_stats: {
                Args: Record<string, never>;
                Returns: {
                    total_patients: number;
                    active_patients: number;
                    total_sessions: number;
                    sessions_this_month: number;
                    pending_payments: number;
                }[];
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];

// Convenience types
export type Professional = Tables<"professionals">;
export type Patient = Tables<"patients">;
export type Session = Tables<"sessions">;
export type SessionAudio = Tables<"session_audios">;
export type Anamnese = Tables<"anamneses">;
export type PatientSummary = Tables<"patient_summaries">;
export type Subscription = Tables<"subscriptions">;
export type AssistantChat = Tables<"assistant_chats">;
export type AssistantMessage = Tables<"assistant_messages">;
export type EvolucaoConsolidada = Tables<"evolucoes_consolidadas">;
