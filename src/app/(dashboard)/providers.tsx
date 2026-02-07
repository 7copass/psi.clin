"use client";

import { OnboardingProvider, OnboardingModal } from "@/components/onboarding";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            {children}
            <OnboardingModal />
        </OnboardingProvider>
    );
}
