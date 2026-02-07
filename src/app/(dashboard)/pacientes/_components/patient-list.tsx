"use client";

import { useState } from "react";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PatientCard } from "./patient-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import type { Patient } from "@/lib/types/database";

interface PatientListProps {
    patients: Patient[];
}

export function PatientList({ patients }: PatientListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filteredPatients = patients.filter((patient) =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome, telefone ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-800"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                    <div className="flex border rounded-lg">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="rounded-r-none h-9 w-9"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="rounded-l-none h-9 w-9"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Patient Grid/List */}
            {filteredPatients.length > 0 ? (
                <div
                    className={
                        viewMode === "grid"
                            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                            : "space-y-4"
                    }
                >
                    {filteredPatients.map((patient) => (
                        <PatientCard key={patient.id} patient={patient} viewMode={viewMode} />
                    ))}
                </div>
            ) : searchTerm ? (
                <EmptyState
                    icon={Users}
                    title="Nenhum paciente encontrado"
                    description={`Nenhum resultado para "${searchTerm}". Tente outro termo de busca.`}
                />
            ) : (
                <EmptyState
                    icon={Users}
                    title="Nenhum paciente cadastrado"
                    description="Comece cadastrando seu primeiro paciente para usar a plataforma."
                />
            )}
        </div>
    );
}
