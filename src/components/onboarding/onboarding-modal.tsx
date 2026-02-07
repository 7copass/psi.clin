"use client";

import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useOnboarding } from "./onboarding-provider";
import { cn } from "@/lib/utils";

export function OnboardingModal() {
    const router = useRouter();
    const {
        isOpen,
        currentStep,
        steps,
        closeOnboarding,
        nextStep,
        prevStep,
        completeOnboarding,
    } = useOnboarding();

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleAction = () => {
        if (step.route) {
            router.push(step.route);
            closeOnboarding();
        }
    };

    const handleNext = () => {
        if (isLastStep) {
            completeOnboarding();
        } else {
            nextStep();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeOnboarding()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-6 w-6" />
                                <span className="text-sm opacity-80">
                                    Passo {currentStep + 1} de {steps.length}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeOnboarding}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <DialogTitle className="text-2xl mt-4">{step.title}</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-slate-600 dark:text-slate-300">{step.description}</p>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-2 w-2 rounded-full transition-all",
                                    i === currentStep
                                        ? "bg-purple-600 w-6"
                                        : i < currentStep
                                            ? "bg-purple-300"
                                            : "bg-slate-200"
                                )}
                            />
                        ))}
                    </div>

                    {/* Action button */}
                    {step.action && (
                        <Button
                            onClick={handleAction}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {step.action}
                        </Button>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={isFirstStep}
                            className="gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>

                        <Button variant="ghost" onClick={closeOnboarding} className="text-slate-500">
                            Pular tutorial
                        </Button>

                        <Button onClick={handleNext} className="gap-1">
                            {isLastStep ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Concluir
                                </>
                            ) : (
                                <>
                                    Próximo
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
