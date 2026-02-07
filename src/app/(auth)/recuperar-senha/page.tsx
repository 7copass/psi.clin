"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Brain, ArrowLeft, CheckCircle } from "lucide-react";

export default function RecuperarSenhaPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            setEmailSent(true);
            toast.success("Email enviado com sucesso!");
        } catch {
            toast.error("Erro ao enviar email. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Email enviado!</h2>
                <p className="text-white/60 mb-6">
                    Enviamos um link de recuperação para{" "}
                    <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-white/40 text-sm mb-6">
                    Verifique sua caixa de entrada e a pasta de spam.
                </p>
                <Link href="/login">
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para o login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                    <Brain className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Recuperar senha</h1>
                <p className="text-white/60 mt-2">
                    Digite seu email para receber o link de recuperação
                </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
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

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-5"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        "Enviar link de recuperação"
                    )}
                </Button>
            </form>

            <p className="text-center mt-6">
                <Link
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                </Link>
            </p>
        </div>
    );
}
