<?php

namespace App\Actions\Transactions;

use App\Models\InstallmentPlan;
use App\Models\Transaction;
use Illuminate\Support\Carbon;

class GenerateInstallmentTransactions
{
    /**
     * Create one Transaction per installment for the given plan.
     */
    public function handle(InstallmentPlan $plan): void
    {
        $amounts = $this->splitAmount($plan->total_amount, $plan->installments_total);
        $date = Carbon::parse($plan->start_date);

        foreach ($amounts as $index => $amount) {
            Transaction::create([
                'user_id' => $plan->user_id,
                'category_id' => $plan->category_id,
                'payment_method_id' => $plan->payment_method_id,
                'installment_plan_id' => $plan->id,
                'type' => $plan->type,
                'amount' => $amount,
                'transaction_date' => $date->copy()->addMonthsNoOverflow($index),
                'description' => $plan->description,
                'notes' => $plan->notes,
                'is_installment' => true,
                'installment_number' => $index + 1,
                'installments_total' => $plan->installments_total,
            ]);
        }
    }

    /**
     * Split a total amount into cent-accurate installments that sum back to the total exactly.
     *
     * @return array<int, string>
     */
    public function splitAmount(string $total, int $installments): array
    {
        $totalCents = (int) round(((float) $total) * 100);
        $base = intdiv($totalCents, $installments);
        $remainder = $totalCents - ($base * $installments);

        return collect(range(1, $installments))
            ->map(fn (int $i): int => $i <= $remainder ? $base + 1 : $base)
            ->map(fn (int $cents): string => number_format($cents / 100, 2, '.', ''))
            ->all();
    }
}
