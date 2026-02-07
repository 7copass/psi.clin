"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Brain, Eye, EyeOff, Check } from "lucide-react";

export default function CadastroPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordRequirements = [
        { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
        { label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
        { label: "Uma letra minúscula", valid: /[a-z]/.test(password) },
        { label: "Um número", valid: /[0-9]/.test(password) },
    ];

    const allRequirementsMet = passwordRequirements.every((req) => req.valid);
    const passwordsMatch = password === confirmPassword && confirmPassword !== "";

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!allRequirementsMet) {
            toast.error("A senha não atende aos requisitos mínimos");
            return;
        }

        if (!passwordsMatch) {
            toast.error("As senhas não coincidem");
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    toast.error("Este email já está cadastrado");
                } else {
                    toast.error(error.message);
                }
                return;
            }

            toast.success("Conta criada com sucesso! Verifique seu email.");
            router.push("/login");
        } catch {
            toast.error("Erro ao criar conta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                    <Brain className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
                <p className="text-white/60 mt-2">7 dias grátis para testar</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white/80">
                        Nome completo
                    </Label>
                    <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/80">
                        Senha
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {password && (
                        <ul className="mt-2 space-y-1">
                            {passwordRequirements.map((req, index) => (
                                <li
                                    key={index}
                                    className={`text-xs flex items-center gap-1 ${req.valid ? "text-green-400" : "text-white/40"
                                        }`}
                                >
                                    <Check
                                        className={`w-3 h-3 ${req.valid ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {req.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/80">
                        Confirmar senha
                    </Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 ${confirmPassword && !passwordsMatch ? "border-red-400" : ""
                            }`}
                    />
                    {confirmPassword && !passwordsMatch && (
                        <p className="text-xs text-red-400">As senhas não coincidem</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !allRequirementsMet || !passwordsMatch}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-5 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        "Criar conta grátis"
                    )}
                </Button>
            </form>

            <p className="text-center text-white/60 mt-6">
                Já tem uma conta?{" "}
                <Link
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                    Fazer login
                </Link>
            </p>
        </div>
    );
}
