import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardProviders } from "./providers";

export const metadata: Metadata = {
    title: "PSI.CLIN",
    description: "Plataforma para psicólogos",
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Buscar dados do profissional
    const { data: professional } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <DashboardProviders>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <Sidebar />
                <div className="lg:pl-72">
                    <Header professional={professional} />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </DashboardProviders>
    );
}
