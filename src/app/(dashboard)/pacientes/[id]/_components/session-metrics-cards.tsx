import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarRange, Hash } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

interface SessionMetricsCardsProps {
    lastSession: string;
    periodFrom: string;
    periodTo: string;
    totalSessions: number;
}

export function SessionMetricsCards({
    lastSession,
    periodFrom,
    periodTo,
    totalSessions,
}: SessionMetricsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Ultima sessao</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatDate(lastSession)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                            <CalendarRange className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Periodo</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {formatDate(periodFrom)} — {formatDate(periodTo)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                            <Hash className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total de sessoes</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {totalSessions}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
