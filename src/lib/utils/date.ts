/**
 * Returns the current date in YYYY-MM-DD format based on America/Sao_Paulo timezone.
 * Useful for querying databases where dates are stored as strings (YYYY-MM-DD)
 * and "today" must respect the user's local time (UTC-3), not server UTC.
 */
export function getTodayDate(): string {
    return new Date().toLocaleString("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).split(",")[0];
}

/**
 * Returns the current month in YYYY-MM format based on America/Sao_Paulo timezone.
 */
export function getCurrentMonth(): string {
    return new Date().toLocaleString("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit"
    }).substring(0, 7);
}

/**
 * Checks if a given date string (YYYY-MM-DD) is today in America/Sao_Paulo.
 */
export function isToday(dateString: string): boolean {
    return dateString === getTodayDate();
}

/**
 * Checks if a given date string (YYYY-MM-DD) is in the past in America/Sao_Paulo.
 */
export function isPastDate(dateString: string): boolean {
    return dateString < getTodayDate();
}
