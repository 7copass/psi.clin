import { abacatePayFetch } from "./client";

export interface CreateBillingParams {
    frequency?: "ONE_TIME" | "RECURRING";
    methods: ("PIX" | "CARD")[];
    products: {
        externalId: string;
        name: string;
        description: string;
        quantity: number;
        price: number; // em centavos
    }[];
    returnUrl: string;
    completionUrl: string;
    customerId?: string;
    customer?: {
        name: string;
        cellphone: string;
        email: string;
        taxId: string;
    };
    externalId?: string;
    metadata?: Record<string, string>;
}

/**
 * Cria uma nova cobrança no Abacate Pay
 */
export async function createBilling(params: CreateBillingParams) {
    const response = await abacatePayFetch("/billing/create", {
        method: "POST",
        body: JSON.stringify(params),
    });

    return response.data;
}

/**
 * Retorna os preços em centavos configurados para cada plano
 */
export function getPlanPrices() {
    return {
        essential: 4990, // R$ 49,90 = 4990 centavos
        professional: 9990, // R$ 99,90 = 9990 centavos
        clinic: 19990, // R$ 199,90 = 19990 centavos
    };
}
