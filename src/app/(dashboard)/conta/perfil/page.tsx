import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { ProfileForm } from "./_components/profile-form";
import type { Professional } from "@/lib/types/database";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", user.id)
        .single();

    const professional = data as Professional | null;

    if (!professional) {
        redirect("/login");
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Meu Perfil
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gerencie suas informações pessoais e da clínica
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <ProfileForm
                    initialData={{
                        email: user.email!,
                        full_name: professional.full_name,
                        crp: professional.crp,
                        phone: professional.phone,
                        clinic_name: professional.clinic_name,
                        clinic_cnpj: professional.clinic_cnpj,
                        clinic_address: professional.clinic_address,
                        default_session_duration: professional.default_session_duration || 50,
                        default_session_value: professional.default_session_value || 150,
                    }}
                />
            </div>
        </div>
    );
}
