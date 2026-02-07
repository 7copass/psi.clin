"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

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

interface FinancialChartsProps {
    monthlyData: MonthlyData[];
    paymentStatusData: PaymentStatusData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border rounded-lg shadow-lg text-sm">
                <p className="font-semibold mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="text-purple-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-purple-600 mr-2" />
                        Receitas: {formatCurrency(payload[0].value)}
                    </p>
                    {/* Add expenses when available */}
                </div>
            </div>
        );
    }
    return null;
};

export function FinancialCharts({
    monthlyData,
    paymentStatusData,
}: FinancialChartsProps) {
    // Format months for display
    const formattedMonthlyData = monthlyData.map((d) => ({
        ...d,
        label: new Date(d.month + "-01").toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
        }),
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Income Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-6">Receitas por Mês</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formattedMonthlyData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                className="stroke-slate-200 dark:stroke-slate-700"
                            />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                            <Bar
                                dataKey="income"
                                fill="#9333ea"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payment Status Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-6">Status de Pagamentos</h3>
                <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={paymentStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {paymentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [
                                    `${value} sessões`,
                                    "Quantidade",
                                ]}
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    borderColor: "var(--border)",
                                    borderRadius: "8px",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Legend */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {paymentStatusData.reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                                Sessões
                            </p>
                        </div>
                    </div>
                </div>
                {/* Legend */}
                <div className="mt-4 flex justify-center gap-4">
                    {paymentStatusData.map((item) => (
                        <div key={item.name} className="flex items-center text-sm">
                            <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-slate-600 dark:text-slate-400">
                                {item.name}: {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
