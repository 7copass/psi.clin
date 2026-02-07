"use client";

import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Professional } from "@/lib/types/database";

interface HeaderProps {
    professional: Professional | null;
}

export function Header({ professional }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Logout realizado com sucesso");
        router.push("/login");
        router.refresh();
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
            </Button>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                {/* Search */}
                <form className="flex flex-1 items-center" action="#" method="GET">
                    <div className="relative w-full max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Buscar paciente..."
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 sm:pr-4 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-500 text-[10px] font-medium text-white flex items-center justify-center">
                            3
                        </span>
                    </Button>

                    {/* Separator */}
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700" />

                    {/* Profile dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 rounded-full p-1.5 pr-4"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={professional?.avatar_url || undefined}
                                        alt={professional?.full_name}
                                    />
                                    <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-medium">
                                        {professional?.full_name
                                            ? getInitials(professional.full_name)
                                            : "??"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {professional?.full_name || "Usuário"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span>{professional?.full_name || "Usuário"}</span>
                                    <span className="text-xs text-slate-500 font-normal">
                                        {professional?.email}
                                    </span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/conta")}>
                                Minha conta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/conta/assinatura")}>
                                Assinatura
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
