"use client";

import Link from "next/link";
import { Phone, Mail, Calendar, MoreVertical, MapPin, Video, DollarSign } from "lucide-react";
import { formatPhone, formatDate, formatCurrency } from "@/lib/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archivePatient } from "@/lib/actions/patients";
import { toast } from "sonner";
import type { Patient } from "@/lib/types/database";

interface PatientCardProps {
    patient: Patient;
    viewMode?: "grid" | "list";
}

export function PatientCard({ patient, viewMode = "grid" }: PatientCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleArchive = async () => {
        const result = await archivePatient(patient.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Paciente arquivado com sucesso");
        }
    };

    if (viewMode === "list") {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                <Link href={`/pacientes/${patient.id}`} className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                            {getInitials(patient.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {patient.full_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {formatPhone(patient.phone)}
                            </span>
                            {patient.email && (
                                <span className="flex items-center gap-1 truncate">
                                    <Mail className="h-3 w-3" />
                                    {patient.email}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {patient.treatment && (
                            <Badge variant="secondary" className="font-normal">
                                {patient.treatment}
                            </Badge>
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {formatCurrency(patient.session_value)}
                        </span>
                    </div>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${patient.id}`}>Ver perfil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${patient.id}/editar`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/sessoes/nova?paciente=${patient.id}`}>Nova sessão</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleArchive} className="text-red-600">
                            Arquivar paciente
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <Link
                    href={`/pacientes/${patient.id}`}
                    className="flex items-center gap-3 flex-1"
                >
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                            {getInitials(patient.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            {patient.full_name}
                        </h3>
                        {patient.treatment && (
                            <Badge variant="secondary" className="mt-1 font-normal text-xs">
                                {patient.treatment}
                            </Badge>
                        )}
                    </div>
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${patient.id}`}>Ver perfil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${patient.id}/editar`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/sessoes/nova?paciente=${patient.id}`}>Nova sessão</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleArchive} className="text-red-600">
                            Arquivar paciente
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{formatPhone(patient.phone)}</span>
                </div>
                {patient.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{patient.email}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span>{formatCurrency(patient.session_value)}/sessão</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    asChild
                >
                    <Link href={`/pacientes/${patient.id}`}>Ver Perfil</Link>
                </Button>
                <Button
                    size="sm"
                    className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                    asChild
                >
                    <Link href={`/sessoes/nova?paciente=${patient.id}`}>Nova Sessão</Link>
                </Button>
            </div>
        </div>
    );
}
