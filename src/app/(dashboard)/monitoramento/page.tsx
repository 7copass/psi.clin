import { Suspense } from "react";
import {
    getMonitoringStats,
    getRecentActivity,
    getPatientRiskStatus,
} from "@/lib/actions/monitoring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Activity,
    Users,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default async function MonitoringPage() {
    const [stats, activities, risks] = await Promise.all([
        getMonitoringStats(),
        getRecentActivity(),
        getPatientRiskStatus(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Monitoramento Clínico</h1>
                <p className="text-muted-foreground">
                    Acompanhe o progresso da sua clínica e a retenção de pacientes.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePatients}</div>
                        <p className="text-xs text-muted-foreground">
                            de {stats.totalPatients} totais
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessões no Mês</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.sessionsThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            realizadas este mês
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.scheduledSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            sessões futuras
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">
                            em breve (IA calculate)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Risk / Retention Monitoring */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Monitoramento de Retenção</CardTitle>
                        <CardDescription>
                            Pacientes sem sessões recentes podem estar em risco de abandonar o tratamento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {risks.map((patient) => (
                                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                        <div className="space-y-1">
                                            <p className="font-medium leading-none">{patient.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {patient.daysSinceLastSession !== null
                                                    ? `Última sessão há ${patient.daysSinceLastSession} dias`
                                                    : "Nenhuma sessão realizada"
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            {patient.daysSinceLastSession !== null && patient.daysSinceLastSession > 30 ? (
                                                <Badge variant="destructive" className="flex gap-1 items-center">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Risco Alto
                                                </Badge>
                                            ) : patient.daysSinceLastSession !== null && patient.daysSinceLastSession > 14 ? (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                    Atenção
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                                                    Regular
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {risks.length === 0 && (
                                    <p className="text-center text-muted-foreground py-10">
                                        Nenhum paciente ativo encontrado.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                        <CardDescription>
                            Últimas atualizações dos seus pacientes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-6">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 group">
                                        <div className="relative mt-1">
                                            <div className="absolute top-0 left-1/2 -ml-[1px] h-full w-[2px] bg-slate-100 dark:bg-slate-800" />
                                            <div className="relative h-3 w-3 rounded-full bg-purple-600 ring-4 ring-white dark:ring-slate-950" />
                                        </div>
                                        <div className="pb-4 space-y-1 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{activity.title}</p>
                                                <time className="text-xs text-muted-foreground truncate ml-2">
                                                    {new Date(activity.date).toLocaleDateString('pt-BR')}
                                                </time>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {activity.description}
                                            </p>
                                            <div className="pt-1">
                                                <Link
                                                    href={`/sessoes/${activity.id}`}
                                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Ver detalhes <ArrowUpRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <p className="text-center text-muted-foreground py-10">
                                        Nenhuma atividade recente.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
