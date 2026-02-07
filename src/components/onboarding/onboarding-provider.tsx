"use client";

import { useState, useEffect, createContext, useContext } from "react";

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    action?: string;
    route?: string;
}

interface OnboardingContextType {
    isOpen: boolean;
    currentStep: number;
    steps: OnboardingStep[];
    isComplete: boolean;
    openOnboarding: () => void;
    closeOnboarding: () => void;
    nextStep: () => void;
    prevStep: () => void;
    completeOnboarding: () => void;
    markStepComplete: (stepId: string) => void;
    completedSteps: string[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: "welcome",
        title: "Bem-vindo ao PSI.CLIN! 👋",
        description:
            "Sua plataforma completa para gestão de consultório psicológico. Vamos te guiar pelos primeiros passos!",
    },
    {
        id: "patient",
        title: "Cadastre seu primeiro paciente",
        description:
            "Comece adicionando um paciente. Você pode incluir informações básicas agora e completar depois.",
        action: "Cadastrar Paciente",
        route: "/pacientes",
    },
    {
        id: "schedule",
        title: "Agende um atendimento",
        description:
            "Use nosso calendário para organizar sua agenda e visualizar todos os seus compromissos.",
        action: "Ir para Agendamentos",
        route: "/agendamentos",
    },
    {
        id: "session",
        title: "Registre uma sessão",
        description:
            "Grave áudio, faça anotações e deixe a IA transcrever e resumir automaticamente.",
        action: "Ver Sessões",
        route: "/sessoes",
    },
    {
        id: "ai",
        title: "Use a IA a seu favor",
        description:
            "Gere evoluções automáticas, resumos consolidados e converse com o assistente IA para insights.",
        action: "Abrir Assistente",
        route: "/assistente",
    },
];

const STORAGE_KEY = "psi.clin.onboarding";

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Verificar localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            setIsComplete(data.complete || false);
            setCompletedSteps(data.completedSteps || []);
        } else {
            // Primeiro acesso - abrir onboarding
            setIsOpen(true);
        }
        setHasChecked(true);
    }, []);

    useEffect(() => {
        if (hasChecked) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ complete: isComplete, completedSteps })
            );
        }
    }, [isComplete, completedSteps, hasChecked]);

    const openOnboarding = () => setIsOpen(true);
    const closeOnboarding = () => setIsOpen(false);

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const completeOnboarding = () => {
        setIsComplete(true);
        setIsOpen(false);
    };

    const markStepComplete = (stepId: string) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps((prev) => [...prev, stepId]);
        }
    };

    return (
        <OnboardingContext.Provider
            value={{
                isOpen,
                currentStep,
                steps: ONBOARDING_STEPS,
                isComplete,
                openOnboarding,
                closeOnboarding,
                nextStep,
                prevStep,
                completeOnboarding,
                markStepComplete,
                completedSteps,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within OnboardingProvider");
    }
    return context;
}
