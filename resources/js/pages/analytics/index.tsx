import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Rectangle,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as analyticsIndex } from '@/routes/analytics';
import type { BreadcrumbItem } from '@/types';

type CategoryTotal = {
    category_id: number;
    name: string;
    color: string | null;
    total: number;
};
type PaymentMethodTotal = {
    payment_method_id: number;
    name: string;
    total: number;
};
type MonthlyEvolution = { month: string; income: number; expense: number };
type CategoryTrendEntry = { month: string; categories: CategoryTotal[] };

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);

/**
 * Generates `count` evenly spaced tones of the active color theme's
 * `--primary` hue, from dark to light, for use as fallback chart colors
 * when no user-defined color exists.
 *
 * @return array<int, string>
 */
function generateThemeTones(count: number): string[] {
    if (count <= 0) {
        return [];
    }

    if (typeof window === 'undefined') {
        return Array.from({ length: count }, () => 'oklch(0.55 0.2 255)');
    }

    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
    const match = raw.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);

    if (!match) {
        return Array.from(
            { length: count },
            () => raw || 'oklch(0.55 0.2 255)',
        );
    }

    const chroma = parseFloat(match[2]);
    const hue = parseFloat(match[3]);

    if (count === 1) {
        return [`oklch(${match[1]} ${chroma} ${hue})`];
    }

    const minLightness = 0.32;
    const maxLightness = 0.82;

    return Array.from({ length: count }, (_, index) => {
        const lightness =
            minLightness +
            ((maxLightness - minLightness) * index) / (count - 1);

        return `oklch(${lightness.toFixed(3)} ${chroma} ${hue})`;
    });
}

export default function AnalyticsIndex({
    expensesByCategory,
    expensesByPaymentMethod,
    monthlyEvolution,
    categoryTrend,
}: {
    expensesByCategory: CategoryTotal[];
    expensesByPaymentMethod: PaymentMethodTotal[];
    monthlyEvolution: MonthlyEvolution[];
    categoryTrend: CategoryTrendEntry[];
}) {
    const categoryColorMap = useMemo(() => {
        const missing = expensesByCategory.filter(
            (category) => !category.color,
        ).length;
        const fallbackTones = generateThemeTones(missing);
        let fallbackIndex = 0;

        return new Map<number, string>(
            expensesByCategory.map((category) => [
                category.category_id,
                category.color ?? fallbackTones[fallbackIndex++],
            ]),
        );
    }, [expensesByCategory]);

    const topCategories = useMemo(
        () => expensesByCategory.slice(0, 6).map((category) => category.name),
        [expensesByCategory],
    );

    const topCategoryColors = useMemo(
        () =>
            expensesByCategory
                .slice(0, 6)
                .map((category) => categoryColorMap.get(category.category_id)),
        [expensesByCategory, categoryColorMap],
    );

    const paymentMethodColors = useMemo(
        () => generateThemeTones(expensesByPaymentMethod.length),
        [expensesByPaymentMethod.length],
    );

    const [incomeColor, expenseColor] = useMemo(
        () => generateThemeTones(2),
        [],
    );

    const trendData = useMemo(
        () =>
            categoryTrend.map((entry) => {
                const row: Record<string, string | number> = {
                    month: entry.month,
                };

                topCategories.forEach((name) => {
                    const match = entry.categories.find(
                        (category) => category.name === name,
                    );
                    row[name] = match ? match.total : 0;
                });

                return row;
            }),
        [categoryTrend, topCategories],
    );

    return (
        <>
            <Head title="Análises" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Análises"
                    description="Evolução de custos por categoria e forma de pagamento"
                />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Despesas por categoria</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expensesByCategory.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Sem despesas nos últimos meses.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {expensesByCategory.map((category) => (
                                        <li
                                            key={category.category_id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="size-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            categoryColorMap.get(
                                                                category.category_id,
                                                            ),
                                                    }}
                                                />
                                                {category.name}
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(category.total)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Despesas por forma de pagamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                            {expensesByPaymentMethod.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Sem despesas nos últimos meses.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={expensesByPaymentMethod}
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-border"
                                        />
                                        <XAxis type="number" fontSize={12} />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={120}
                                            fontSize={12}
                                        />
                                        <Tooltip
                                            formatter={(value) =>
                                                formatCurrency(Number(value))
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            name="Total"
                                            shape={(props) => (
                                                <Rectangle
                                                    {...props}
                                                    fill={
                                                        paymentMethodColors[
                                                            props.index
                                                        ]
                                                    }
                                                />
                                            )}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Receitas x despesas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyEvolution}>
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
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    name="Receitas"
                                    stroke={incomeColor}
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expense"
                                    name="Despesas"
                                    stroke={expenseColor}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Tendência de despesas por categoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        {topCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Sem dados suficientes para identificar
                                tendências.
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
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
                                    {topCategories.map((name, index) => (
                                        <Bar
                                            key={name}
                                            dataKey={name}
                                            stackId="categories"
                                            fill={topCategoryColors[index]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AnalyticsIndex.layout = {
    breadcrumbs: [
        { title: 'Análises', href: analyticsIndex() },
    ] satisfies BreadcrumbItem[],
};
