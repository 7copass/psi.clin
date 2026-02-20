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
        essential: 5990, // R$ 59,90 = 5990 centavos
        professional: 7990, // R$ 79,90 = 7990 centavos
        clinic: 9990, // R$ 99,90 = 9990 centavos
    };
}
