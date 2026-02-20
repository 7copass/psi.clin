// Planos disponíveis
export const PLANS = {
    trial: {
        name: "Trial (14 dias)",
        price: 0,
        features: {
            patients: 50,
            transcriptions: 40,
            smartnotes: -1, // ilimitado
            summaries: 5,
            assistant: 0,
        },
    },
    essential: {
        name: "Essencial",
        price: 59.90,
        features: {
            patients: 50,
            transcriptions: 40, // ~10h
            smartnotes: -1, // ilimitado
            summaries: 5,
            assistant: 0,
        },
    },
    professional: {
        name: "Profissional",
        price: 79.90,
        features: {
            patients: -1, // ilimitado
            transcriptions: 120, // ~30h
            smartnotes: -1,
            summaries: -1,
            assistant: 100, // mensagens
        },
    },
    clinic: {
        name: "Clínica",
        price: 99.90,
        features: {
            patients: -1,
            transcriptions: -1,
            smartnotes: -1,
            summaries: -1,
            assistant: -1,
        },
    },
} as const;

// Status de pagamento
export const PAYMENT_STATUS = {
    pending: { label: "Pendente", color: "yellow" },
    paid: { label: "Pago", color: "green" },
    partial: { label: "Parcial", color: "blue" },
    cancelled: { label: "Cancelado", color: "red" },
} as const;

// Status de sessão
export const SESSION_STATUS = {
    scheduled: { label: "Agendada", color: "blue" },
    confirmed: { label: "Confirmada", color: "purple" },
    completed: { label: "Realizada", color: "green" },
    cancelled: { label: "Cancelada", color: "red" },
    no_show: { label: "Falta", color: "orange" },
} as const;

// Tipos de sessão
export const SESSION_TYPES = {
    in_person: { label: "Presencial", icon: "MapPin" },
    presential: { label: "Presencial", icon: "MapPin" },
    online: { label: "Online", icon: "Video" },
} as const;

// Status do paciente
export const PATIENT_STATUS = {
    active: { label: "Ativo", color: "green" },
    inactive: { label: "Inativo", color: "yellow" },
    archived: { label: "Arquivado", color: "gray" },
} as const;

// Modelos de cobrança
export const BILLING_MODELS = {
    per_session: { label: "Por sessão" },
    monthly_package: { label: "Pacote mensal" },
} as const;

// Métodos de pagamento
export const PAYMENT_METHODS = [
    { value: "pix", label: "PIX" },
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "debit_card", label: "Cartão de Débito" },
    { value: "cash", label: "Dinheiro" },
    { value: "transfer", label: "Transferência" },
    { value: "health_insurance", label: "Plano de Saúde" },
] as const;

// Gêneros
export const GENDERS = [
    { value: "female", label: "Feminino" },
    { value: "male", label: "Masculino" },
    { value: "non_binary", label: "Não-binário" },
    { value: "other", label: "Outro" },
    { value: "prefer_not_to_say", label: "Prefiro não informar" },
] as const;

// Tamanhos de SmartNotes
export const SMARTNOTES_SIZES = {
    short: { label: "Curto", description: "2-3 tópicos principais" },
    medium: { label: "Médio", description: "5-7 tópicos" },
    long: { label: "Longo", description: "8+ tópicos detalhados" },
} as const;

// Duração padrão da sessão em minutos
export const DEFAULT_SESSION_DURATION = 50;

// Valor padrão da sessão
export const DEFAULT_SESSION_VALUE = 150;

// Dias de trial
export const TRIAL_DAYS = 7;

// Tipos de recorrência
export const RECURRENCE_TYPES = {
    none: { label: "Não repetir" },
    weekly: { label: "Semanalmente" },
    biweekly: { label: "Quinzenalmente" },
    monthly: { label: "Mensalmente" },
} as const;

// Visualizações do calendário
export const CALENDAR_VIEWS = {
    month: { label: "Mês" },
    week: { label: "Semana" },
    day: { label: "Dia" },
} as const;

// Slots de horário padrão (8h às 21h)
export const TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00",
] as const;

// Dias da semana
export const WEEKDAYS = [
    { value: 0, label: "Domingo", short: "Dom" },
    { value: 1, label: "Segunda", short: "Seg" },
    { value: 2, label: "Terça", short: "Ter" },
    { value: 3, label: "Quarta", short: "Qua" },
    { value: 4, label: "Quinta", short: "Qui" },
    { value: 5, label: "Sexta", short: "Sex" },
    { value: 6, label: "Sábado", short: "Sáb" },
] as const;

// Categorias de transação financeira
export const TRANSACTION_CATEGORIES = {
    session_payment: { label: "Pagamento de Sessão", type: "income" },
    package_payment: { label: "Pagamento de Pacote", type: "income" },
    health_insurance: { label: "Plano de Saúde", type: "income" },
    other_income: { label: "Outra Receita", type: "income" },
    refund: { label: "Reembolso", type: "expense" },
    platform_fee: { label: "Taxa da Plataforma", type: "expense" },
    other_expense: { label: "Outra Despesa", type: "expense" },
} as const;

// Tipos de transação
export const TRANSACTION_TYPES = {
    income: { label: "Receita", color: "green" },
    expense: { label: "Despesa", color: "red" },
} as const;
