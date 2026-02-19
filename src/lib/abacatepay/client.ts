export const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";

export async function abacatePayFetch(endpoint: string, options: RequestInit = {}) {
    const apiKey = process.env.ABACATEPAY_API_KEY;

    if (!apiKey) {
        throw new Error("ABACATEPAY_API_KEY não configurada no ambiente.");
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.set("Content-Type", "application/json");

    const url = `${ABACATEPAY_API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Abacate Pay Error:", errorData || response.statusText);
        throw new Error(`Abacate Pay API error: ${response.status} - ${errorData?.error || response.statusText}`);
    }

    return response.json();
}
