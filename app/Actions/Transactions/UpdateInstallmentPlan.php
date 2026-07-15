<?php

namespace App\Actions\Transactions;

use App\Models\InstallmentPlan;
use Illuminate\Support\Facades\DB;

class UpdateInstallmentPlan
{
    public function __construct(private readonly GenerateInstallmentTransactions $generateInstallments) {}

    /**
     * Update an installment plan, keeping its generated transactions in sync.
     *
     * @param  array<string, mixed>  $data
     */
    public function handle(InstallmentPlan $plan, array $data): InstallmentPlan
    {
        return DB::transaction(function () use ($plan, $data) {
            $installmentsTotalChanged = (int) $data['installments_total'] !== $plan->installments_total;

            $plan->update([
                'category_id' => $data['category_id'] ?? null,
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'total_amount' => $data['total_amount'],
                'installments_total' => $data['installments_total'],
                'installments_paid' => min((int) $data['installments_paid'], (int) $data['installments_total']),
                'description' => $data['description'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($installmentsTotalChanged) {
                $plan->transactions()->delete();
                $this->generateInstallments->handle($plan);
            } else {
                $this->redistributeAmounts($plan);
            }

            return $plan;
        });
    }

    private function redistributeAmounts(InstallmentPlan $plan): void
    {
        $amounts = $this->generateInstallments->splitAmount($plan->total_amount, $plan->installments_total);

        $plan->transactions()->orderBy('installment_number')->get()
            ->values()
            ->each(fn ($transaction, int $index) => $transaction->update(['amount' => $amounts[$index]]));
    }
}
