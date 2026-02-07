"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Brain,
    Users,
    Calendar,
    FileText,
    BarChart3,
    MessageSquare,
    DollarSign,
    Settings,
    LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navigation = [
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Sessões", href: "/sessoes", icon: FileText },
    { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
    { name: "Assistente IA", href: "/assistente", icon: MessageSquare },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
    { name: "Monitoramento", href: "/monitoramento", icon: BarChart3 },
];

const bottomNavigation = [
    { name: "Configurações", href: "/conta", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Logout realizado com sucesso");
        router.push("/login");
        router.refresh();
    };

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 px-6 pb-4">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                        PSI.CLIN
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all",
                                                    isActive
                                                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-5 w-5 shrink-0",
                                                        isActive
                                                            ? "text-purple-600 dark:text-purple-400"
                                                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                    )}
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        {/* Bottom navigation */}
                        <li className="mt-auto">
                            <ul role="list" className="-mx-2 space-y-1">
                                {bottomNavigation.map((item) => {
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all",
                                                    isActive
                                                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-5 w-5 shrink-0",
                                                        isActive
                                                            ? "text-purple-600 dark:text-purple-400"
                                                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                    )}
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full group flex gap-x-3 rounded-lg p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                        <LogOut className="h-5 w-5 shrink-0" />
                                        Sair
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
