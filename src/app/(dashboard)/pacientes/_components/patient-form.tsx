"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormData } from "@/lib/validators/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { GENDERS, BILLING_MODELS, PAYMENT_METHODS } from "@/lib/utils/constants";
import type { Patient } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/utils/phone-mask";
import { toast } from "sonner";

interface PatientFormProps {
    patient?: Patient;
    onSubmit: (data: PatientFormData) => Promise<void>;
    isLoading?: boolean;
}

const STEPS = [
    { key: "personal", title: "Dados Pessoais" },
    { key: "health", title: "Saúde" },
    { key: "contacts", title: "Contatos" },
    { key: "billing", title: "Pagamento" },
] as const;

export function PatientForm({ patient, onSubmit, isLoading }: PatientFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<PatientFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(patientSchema) as any,
        defaultValues: {
            full_name: patient?.full_name || "",
            phone: patient?.phone || "",
            email: patient?.email || "",
            cpf: patient?.cpf || "",
            birth_date: patient?.birth_date || "",
            is_minor: patient?.is_minor || false,
            gender: (patient?.gender as PatientFormData["gender"]) || undefined,
            profession: patient?.profession || "",
            address: patient?.address || "",
            country: patient?.country || "Brasil",
            health_insurance: patient?.health_insurance || "",
            treatment: patient?.treatment || "",
            medications: patient?.medications || [],
            emergency_contact_1_name: patient?.emergency_contact_1_name || "",
            emergency_contact_1_phone: patient?.emergency_contact_1_phone || "",
            emergency_contact_2_name: patient?.emergency_contact_2_name || "",
            emergency_contact_2_phone: patient?.emergency_contact_2_phone || "",
            billing_model: patient?.billing_model || "per_session",
            session_value: patient?.session_value || 150,
            payment_method: patient?.payment_method || "",
            notes: patient?.notes || "",
        },
    });

    const billingModel = watch("billing_model");
    const watchedPhone = watch("phone");
    const watchedGender = watch("gender");
    const watchedEmergency1 = watch("emergency_contact_1_phone");
    const watchedEmergency2 = watch("emergency_contact_2_phone");

    const isLastStep = currentStep === STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    // Handler para aplicar máscara de telefone
    const handlePhoneInput = (field: keyof PatientFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setValue(field, formatted);
    };

    // Validação por etapa
    const validateStep = async (step: number): Promise<boolean> => {
        const errorList: string[] = [];

        if (step === 0) {
            // Etapa 1: Nome, Telefone e Gênero obrigatórios
            const name = watch("full_name");
            const phone = watch("phone");
            const gender = watch("gender");

            if (!name || name.length < 3) {
                errorList.push("Nome é obrigatório (mín. 3 caracteres)");
            }
            if (!phone || phone.length < 10) {
                errorList.push("Telefone é obrigatório (mín. 10 dígitos)");
            }
            if (!gender) {
                errorList.push("Gênero é obrigatório");
            }
        } else if (step === 2) {
            // Etapa 3: Pelo menos 1 telefone de emergência
            const emergency1 = watch("emergency_contact_1_phone");
            const emergency2 = watch("emergency_contact_2_phone");

            const hasPhone1 = emergency1 && emergency1.replace(/\D/g, "").length >= 10;
            const hasPhone2 = emergency2 && emergency2.replace(/\D/g, "").length >= 10;

            if (!hasPhone1 && !hasPhone2) {
                errorList.push("Pelo menos 1 telefone de emergência é obrigatório");
            }
        }

        setStepErrors({ ...stepErrors, [step]: errorList });

        if (errorList.length > 0) {
            errorList.forEach(err => toast.error(err));
            return false;
        }

        return true;
    };

    const handleNext = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid && !isLastStep) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Clicar em uma etapa - só permite se as etapas anteriores estão válidas
    const handleStepClick = async (targetStep: number) => {
        // Se está voltando, permite direto
        if (targetStep < currentStep) {
            setCurrentStep(targetStep);
            return;
        }

        // Se está avançando, valida todas as etapas intermediárias
        for (let i = currentStep; i < targetStep; i++) {
            const isValid = await validateStep(i);
            if (!isValid) {
                return; // Para no primeiro erro
            }
        }

        setCurrentStep(targetStep);
    };

    const handleFormSubmit = async () => {
        // Valida etapa atual antes de submeter
        const isValid = await validateStep(currentStep);
        if (!isValid) return;

        // Valida todo o formulário antes de submeter
        const isFormValid = await trigger();
        if (!isFormValid) {
            toast.error("Verifique os campos obrigatórios");
            return;
        }

        // Pega os dados do formulário
        const data = watch();
        await onSubmit(data);
    };

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    {STEPS.map((step, index) => (
                        <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(index)}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                                        index < currentStep
                                            ? "bg-green-500 text-white"
                                            : index === currentStep
                                                ? "bg-purple-600 text-white ring-4 ring-purple-200"
                                                : "bg-slate-200 text-slate-500 dark:bg-slate-700 hover:bg-slate-300",
                                        stepErrors[index]?.length ? "ring-2 ring-red-500" : ""
                                    )}
                                >
                                    {index < currentStep ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </button>
                                <span
                                    className={cn(
                                        "text-xs mt-1 text-center",
                                        index === currentStep
                                            ? "text-purple-600 font-medium"
                                            : "text-slate-500"
                                    )}
                                >
                                    {step.title}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "h-0.5 flex-1 mx-2",
                                        index < currentStep ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[350px]">
                {/* Step 1: Dados Pessoais */}
                {currentStep === 0 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="flex items-center gap-1">
                                    Nome completo
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="full_name"
                                    {...register("full_name")}
                                    placeholder="Nome do paciente"
                                    className={cn(errors.full_name && "border-red-500")}
                                />
                                {errors.full_name && (
                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.full_name.message}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-1">
                                    Telefone
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    value={watchedPhone}
                                    onChange={handlePhoneInput("phone")}
                                    placeholder="(11) 99999-9999"
                                    className={cn(errors.phone && "border-red-500")}
                                />
                                {errors.phone && (
                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.phone.message}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    {...register("cpf")}
                                    placeholder="000.000.000-00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Data de nascimento</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    {...register("birth_date")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    Gênero
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={watchedGender || ""}
                                    onValueChange={(value) => setValue("gender", value as PatientFormData["gender"])}
                                >
                                    <SelectTrigger className={cn(!watchedGender && stepErrors[0]?.length && "border-red-500")}>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GENDERS.map((g) => (
                                            <SelectItem key={g.value} value={g.value}>
                                                {g.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!watchedGender && errors.gender && (
                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Gênero é obrigatório
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profession">Profissão</Label>
                                <Input
                                    id="profession"
                                    {...register("profession")}
                                    placeholder="Engenheiro, Médico, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input
                                    id="address"
                                    {...register("address")}
                                    placeholder="Rua, número, bairro, cidade"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Saúde */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="treatment">Tipo de tratamento</Label>
                                <Input
                                    id="treatment"
                                    {...register("treatment")}
                                    placeholder="TCC, Psicanálise, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="health_insurance">Plano de saúde</Label>
                                <Input
                                    id="health_insurance"
                                    {...register("health_insurance")}
                                    placeholder="Unimed, Amil, etc."
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    {...register("notes")}
                                    placeholder="Informações adicionais sobre o paciente..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_minor"
                                {...register("is_minor")}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            <Label htmlFor="is_minor" className="text-sm font-normal">
                                Paciente é menor de idade
                            </Label>
                        </div>
                    </div>
                )}

                {/* Step 3: Contatos de Emergência */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Pelo menos um contato de emergência com telefone é obrigatório.
                            </p>
                        </div>

                        <div className={cn(
                            "p-4 border rounded-lg space-y-4",
                            stepErrors[2]?.length && !watchedEmergency1?.replace(/\D/g, "").length && "border-red-500"
                        )}>
                            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                Contato de Emergência 1
                                <span className="text-red-500">*</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_1_name">Nome</Label>
                                    <Input
                                        id="emergency_contact_1_name"
                                        {...register("emergency_contact_1_name")}
                                        placeholder="Nome do contato"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_1_phone" className="flex items-center gap-1">
                                        Telefone
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="emergency_contact_1_phone"
                                        value={watchedEmergency1 || ""}
                                        onChange={handlePhoneInput("emergency_contact_1_phone")}
                                        placeholder="(11) 99999-9999"
                                        className={cn(
                                            stepErrors[2]?.length && !watchedEmergency1?.replace(/\D/g, "").length && "border-red-500"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                Contato de Emergência 2 (opcional)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_2_name">Nome</Label>
                                    <Input
                                        id="emergency_contact_2_name"
                                        {...register("emergency_contact_2_name")}
                                        placeholder="Nome do contato"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_2_phone">Telefone</Label>
                                    <Input
                                        id="emergency_contact_2_phone"
                                        value={watchedEmergency2 || ""}
                                        onChange={handlePhoneInput("emergency_contact_2_phone")}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Pagamento */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Modelo de cobrança</Label>
                                <Select
                                    value={billingModel || "per_session"}
                                    onValueChange={(value) => setValue("billing_model", value as "per_session" | "monthly_package")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(BILLING_MODELS).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>
                                                {val.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="session_value">
                                    {billingModel === "per_session" ? "Valor da sessão (R$)" : "Valor do pacote (R$)"}
                                </Label>
                                <Input
                                    id="session_value"
                                    type="number"
                                    step="0.01"
                                    {...register("session_value")}
                                    placeholder="150.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Forma de pagamento preferida</Label>
                                <Select
                                    value={watch("payment_method") || ""}
                                    onValueChange={(value) => setValue("payment_method", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((pm) => (
                                            <SelectItem key={pm.value} value={pm.value}>
                                                {pm.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className={cn(isFirstStep && "invisible")}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                </Button>

                <div className="flex gap-2">
                    {!isLastStep ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Próximo
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleFormSubmit}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : patient ? (
                                "Salvar alterações"
                            ) : (
                                "Cadastrar paciente"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
