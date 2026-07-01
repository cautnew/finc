<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class FinancialSummaryService
{
    /**
     * @return array{income: float, expense: float, balance: float}
     */
    public function totals(User $user, Carbon $from, Carbon $to): array
    {
        $totals = $user->transactions()
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $income = (float) ($totals[TransactionType::Income->value] ?? 0);
        $expense = (float) ($totals[TransactionType::Expense->value] ?? 0);

        return [
            'income' => $income,
            'expense' => $expense,
            'balance' => $income - $expense,
        ];
    }

    /**
     * @return Collection<int, array{category_id: int, name: string, color: string|null, total: float}>
     */
    public function byCategory(User $user, Carbon $from, Carbon $to, TransactionType $type = TransactionType::Expense): Collection
    {
        return $user->transactions()
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->whereBetween('transaction_date', [$from, $to])
            ->where('type', $type)
            ->selectRaw('categories.id as category_id, categories.name, categories.color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * @return Collection<int, array{payment_method_id: int, name: string, total: float}>
     */
    public function byPaymentMethod(User $user, Carbon $from, Carbon $to): Collection
    {
        return $user->transactions()
            ->join('payment_methods', 'payment_methods.id', '=', 'transactions.payment_method_id')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('payment_methods.id as payment_method_id, payment_methods.name, SUM(transactions.amount) as total')
            ->groupBy('payment_methods.id', 'payment_methods.name')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Income/expense totals for each of the last `$months` calendar months.
     *
     * @return Collection<int, array{month: string, income: float, expense: float}>
     */
    public function monthlyEvolution(User $user, int $months = 6): Collection
    {
        $start = Carbon::now()->subMonthsNoOverflow($months - 1)->startOfMonth();

        $transactions = $user->transactions()
            ->where('transaction_date', '>=', $start)
            ->get(['transaction_date', 'type', 'amount']);

        return collect(range(0, $months - 1))
            ->map(fn (int $offset) => Carbon::now()->subMonthsNoOverflow($months - 1 - $offset)->startOfMonth())
            ->map(function (Carbon $month) use ($transactions) {
                $monthTransactions = $transactions->filter(
                    fn ($transaction) => $transaction->transaction_date->isSameMonth($month)
                );

                return [
                    'month' => $month->format('Y-m'),
                    'income' => (float) $monthTransactions->where('type', TransactionType::Income)->sum('amount'),
                    'expense' => (float) $monthTransactions->where('type', TransactionType::Expense)->sum('amount'),
                ];
            });
    }
}
