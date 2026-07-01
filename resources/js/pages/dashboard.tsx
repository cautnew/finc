import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index as analyticsIndex } from '@/routes/analytics';

type Totals = { income: number; expense: number; balance: number };
type CategoryTotal = {
    category_id: number;
    name: string;
    color: string | null;
    total: number;
};
type MonthlyEvolution = { month: string; income: number; expense: number };

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);

export default function Dashboard({
    totals,
    expensesByCategory,
    monthlyEvolution,
    filters,
}: {
    totals: Totals;
    expensesByCategory: CategoryTotal[];
    monthlyEvolution: MonthlyEvolution[];
    filters: { from: string; to: string };
}) {
    const [period, setPeriod] = useState(filters);

    const applyPeriod = () => {
        router.get(dashboard().url, period, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="from">De</Label>
                            <Input
                                id="from"
                                type="date"
                                value={period.from}
                                onChange={(e) =>
                                    setPeriod((p) => ({
                                        ...p,
                                        from: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="to">Até</Label>
                            <Input
                                id="to"
                                type="date"
                                value={period.to}
                                onChange={(e) =>
                                    setPeriod((p) => ({
                                        ...p,
                                        to: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <Button variant="secondary" onClick={applyPeriod}>
                            Filtrar
                        </Button>
                    </div>

                    <Button variant="outline" asChild>
                        <a href={analyticsIndex().url}>Ver análises</a>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Receitas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totals.income)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Despesas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-destructive">
                                {formatCurrency(totals.expense)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Saldo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {formatCurrency(totals.balance)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Despesas por categoria</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {expensesByCategory.length === 0 ? (
                                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    Sem despesas no período selecionado.
                                </p>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            dataKey="total"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                        >
                                            {expensesByCategory.map(
                                                (category) => (
                                                    <Cell
                                                        key={
                                                            category.category_id
                                                        }
                                                        fill={
                                                            category.color ??
                                                            'var(--color-primary)'
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                formatCurrency(Number(value))
                                            }
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Evolução mensal</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyEvolution}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border"
                                    />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        formatter={(value) =>
                                            formatCurrency(Number(value))
                                        }
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="income"
                                        name="Receitas"
                                        fill="oklch(0.6 0.16 150)"
                                    />
                                    <Bar
                                        dataKey="expense"
                                        name="Despesas"
                                        fill="oklch(0.6 0.2 25)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
