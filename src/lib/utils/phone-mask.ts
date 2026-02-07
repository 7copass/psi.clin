/**
 * Máscara para telefone brasileiro
 * Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhone(value: string): string {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limited = digits.slice(0, 11);

    // Aplica a máscara
    if (limited.length === 0) return "";
    if (limited.length <= 2) return `(${limited}`;
    if (limited.length <= 6)
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 10)
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}

/**
 * Remove a máscara do telefone, retornando apenas dígitos
 */
export function unformatPhone(value: string): string {
    return value.replace(/\D/g, "");
}

/**
 * Valida se o telefone tem o formato brasileiro correto
 * Aceita celulares (11 dígitos com 9) e fixos (10 dígitos)
 */
export function isValidBrazilianPhone(value: string): boolean {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
}
