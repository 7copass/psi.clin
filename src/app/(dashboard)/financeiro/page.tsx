"use client";

import { useState, useEffect, useCallback } from "react";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    getFinancialSummary,
    getTransactions,
    getMonthlyChartData,
    updatePaymentStatus,
} from "@/lib/actions/financial";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { PAYMENT_STATUS, TRANSACTION_CATEGORIES, PAYMENT_METHODS } from "@/lib/utils/constants";
import { toast } from "sonner";

interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    pendingPayments: number;
    sessionsThisMonth: number;
    avgSessionValue: number;
}

interface Transaction {
    id: string;
    type: "income" | "expense";
    category: string;
    description: string;
    amount: number;
    date: string;
    patient_id?: string;
    session_id?: string;
    payment_method?: string;
    payment_status?: string;
}

interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
}

interface PaymentStatusData {
    name: string;
    value: number;
    color: string;
}

import { FinancialCharts } from "./_components/financial-charts";

export default function FinanceiroPage() {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState("month");

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        const now = new Date();
        let startDate: string;
        let endDate: string = now.toISOString().split("T")[0];

        switch (period) {
            case "week":
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate = weekAgo.toISOString().split("T")[0];
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString()
                    .split("T")[0];
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1)
                    .toISOString()
                    .split("T")[0];
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString()
                    .split("T")[0];
        }

        const [summaryResult, transactionsResult, chartResult] = await Promise.all([
            getFinancialSummary({ startDate, endDate }),
            getTransactions({ startDate, endDate, limit: 20 }),
            getMonthlyChartData(6),
        ]);

        if (summaryResult.data) setSummary(summaryResult.data);
        if (transactionsResult.data) setTransactions(transactionsResult.data);
        if (chartResult.data) setMonthlyData(chartResult.data);

        // Calculate payment status data from transactions
        const paid = transactionsResult.data?.filter((t) => t.payment_status === "paid").length || 0;
        const pending =
            transactionsResult.data?.filter(
                (t) => t.payment_status === "pending" || !t.payment_status
            ).length || 0;

        setPaymentStatusData([
            { name: "Pagas", value: paid, color: "#22c55e" },
            { name: "Pendentes", value: pending, color: "#eab308" },
        ]);

        setIsLoading(false);
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkAsPaid = async (sessionId: string, method: string) => {
        const result = await updatePaymentStatus(sessionId, "paid", method);
        if (result.success) {
            toast.success("Pagamento registrado!");
            fetchData();
        } else {
            toast.error(result.error || "Erro ao registrar pagamento");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Financeiro
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Acompanhe suas receitas e pagamentos
                    </p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Esta semana</SelectItem>
                        <SelectItem value="month">Este mês</SelectItem>
                        <SelectItem value="year">Este ano</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold mt-4">
                        {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                    <p className="text-sm text-slate-500">Receitas</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-4">
                        {formatCurrency(summary?.pendingPayments || 0)}
                    </p>
                    <p className="text-sm text-slate-500">Pendentes</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-4">
                        {summary?.sessionsThisMonth || 0}
                    </p>
                    <p className="text-sm text-slate-500">Sessões</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-4">
                        {formatCurrency(summary?.avgSessionValue || 0)}
                    </p>
                    <p className="text-sm text-slate-500">Ticket Médio</p>
                </div>
            </div>

            {/* Charts */}
            <FinancialCharts monthlyData={monthlyData} paymentStatusData={paymentStatusData} />

            <div className="bg-white dark:bg-slate-800 rounded-xl border">
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-lg">Últimas Transações</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500">Nenhuma transação encontrada</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => {
                                const category =
                                    TRANSACTION_CATEGORIES[
                                    transaction.category as keyof typeof TRANSACTION_CATEGORIES
                                    ];
                                const status =
                                    PAYMENT_STATUS[
                                    (transaction.payment_status ||
                                        "pending") as keyof typeof PAYMENT_STATUS
                                    ];

                                return (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-xs text-slate-500">
                                                    {category?.label || transaction.category}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(transaction.date)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    transaction.type === "income"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                {transaction.type === "income" ? "+" : "-"}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    status?.color === "green"
                                                        ? "bg-green-100 text-green-700"
                                                        : status?.color === "yellow"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : ""
                                                }
                                            >
                                                {status?.label || "Pendente"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {transaction.payment_status !== "paid" && (
                                                <Select
                                                    onValueChange={(method) =>
                                                        handleMarkAsPaid(transaction.id, method)
                                                    }
                                                >
                                                    <SelectTrigger className="w-32 h-8">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">Receber</span>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PAYMENT_METHODS.map((method) => (
                                                            <SelectItem key={method.value} value={method.value}>
                                                                {method.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>

    );
}
