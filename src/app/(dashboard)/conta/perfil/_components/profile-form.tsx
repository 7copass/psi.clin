"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, User, Building2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateProfile, type ProfileData } from "@/lib/actions/profile";
import { formatCurrency } from "@/lib/utils/format";

interface ProfileFormProps {
    initialData: ProfileData & { email: string };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [data, setData] = useState<ProfileData>({
        full_name: initialData.full_name,
        crp: initialData.crp,
        phone: initialData.phone,
        clinic_name: initialData.clinic_name,
        clinic_cnpj: initialData.clinic_cnpj,
        clinic_address: initialData.clinic_address,
        default_session_duration: initialData.default_session_duration,
        default_session_value: initialData.default_session_value,
    });
    const [isPending, startTransition] = useTransition();

    const handleChange = (key: keyof ProfileData, value: string | number) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateProfile(data);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Perfil atualizado com sucesso!");
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Dados Pessoais */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <h2 className="font-semibold">Dados Pessoais</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo *</Label>
                        <Input
                            id="full_name"
                            value={data.full_name}
                            onChange={(e) => handleChange("full_name", e.target.value)}
                            placeholder="Seu nome completo"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={initialData.email}
                            disabled
                            className="bg-slate-100 dark:bg-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="crp">CRP</Label>
                        <Input
                            id="crp"
                            value={data.crp || ""}
                            onChange={(e) => handleChange("crp", e.target.value)}
                            placeholder="00/00000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            value={data.phone || ""}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>
            </section>

            <Separator />

            {/* Dados da Clínica */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <h2 className="font-semibold">Dados da Clínica</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="clinic_name">Nome da Clínica</Label>
                        <Input
                            id="clinic_name"
                            value={data.clinic_name || ""}
                            onChange={(e) => handleChange("clinic_name", e.target.value)}
                            placeholder="Nome do consultório ou clínica"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clinic_cnpj">CNPJ</Label>
                        <Input
                            id="clinic_cnpj"
                            value={data.clinic_cnpj || ""}
                            onChange={(e) => handleChange("clinic_cnpj", e.target.value)}
                            placeholder="00.000.000/0000-00"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="clinic_address">Endereço</Label>
                        <Input
                            id="clinic_address"
                            value={data.clinic_address || ""}
                            onChange={(e) => handleChange("clinic_address", e.target.value)}
                            placeholder="Endereço completo"
                        />
                    </div>
                </div>
            </section>

            <Separator />

            {/* Configurações */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <h2 className="font-semibold">Configurações Padrão</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duração da Sessão (minutos)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={data.default_session_duration}
                            onChange={(e) =>
                                handleChange("default_session_duration", parseInt(e.target.value) || 50)
                            }
                            min={15}
                            max={180}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Valor da Sessão (R$)</Label>
                        <Input
                            id="value"
                            type="number"
                            step="0.01"
                            value={data.default_session_value}
                            onChange={(e) =>
                                handleChange("default_session_value", parseFloat(e.target.value) || 150)
                            }
                            min={0}
                        />
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
