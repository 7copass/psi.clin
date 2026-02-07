import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

// Formata data para exibição (ex: "02/02/2026")
export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return "-";
    // Handle timestamp strings by extracting just the date part
    let parsed: Date;
    if (typeof date === "string") {
        // If it's a timestamp with T, extract just the date part
        const dateString = date.includes("T") ? date.split("T")[0] : date;
        parsed = parseISO(dateString);
    } else {
        parsed = date;
    }
    if (!isValid(parsed)) return "-";
    return format(parsed, "dd/MM/yyyy", { locale: ptBR });
}

// Formata data e hora (ex: "02/02/2026 às 14:30")
export function formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return "-";
    const parsed = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsed)) return "-";
    return format(parsed, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

// Formata data relativa (ex: "há 2 dias")
export function formatRelativeDate(date: string | Date | null | undefined): string {
    if (!date) return "-";
    const parsed = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsed)) return "-";
    return formatDistanceToNow(parsed, { addSuffix: true, locale: ptBR });
}

// Formata valor monetário (ex: "R$ 150,00")
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

// Formata CPF (ex: "123.456.789-00")
export function formatCPF(cpf: string | null | undefined): string {
    if (!cpf) return "-";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Formata telefone (ex: "(11) 99999-9999")
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
}

// Formata duração em minutos (ex: "50 min" ou "1h 10min")
export function formatDuration(minutes: number | null | undefined): string {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Formata duração em segundos para mm:ss (ex: "05:30")
export function formatAudioDuration(seconds: number | null | undefined): string {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
