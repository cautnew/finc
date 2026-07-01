<?php

namespace App\Actions\Transactions;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class MaterializeRecurringOccurrence
{
    /**
     * Create the next Transaction occurrence for a recurring template and
     * advance the template to its following run date.
     *
     * @param  array<string, mixed>  $overrides  Values to use instead of the template's defaults
     *                                           (amount, transaction_date, due_date, payment_method_id, description).
     */
    public function handle(RecurringTransaction $recurringTransaction, array $overrides = []): Transaction
    {
        return DB::transaction(function () use ($recurringTransaction, $overrides) {
            $transaction = Transaction::create([
                'user_id' => $recurringTransaction->user_id,
                'category_id' => $recurringTransaction->category_id,
                'payment_method_id' => $overrides['payment_method_id'] ?? $recurringTransaction->payment_method_id,
                'recurring_transaction_id' => $recurringTransaction->id,
                'type' => $recurringTransaction->type,
                'amount' => $overrides['amount'] ?? $recurringTransaction->amount,
                'transaction_date' => $overrides['transaction_date'] ?? $recurringTransaction->next_run_date,
                'due_date' => $overrides['due_date'] ?? null,
                'description' => $overrides['description'] ?? $recurringTransaction->description,
                'is_recurring' => true,
            ]);

            $nextRunDate = $recurringTransaction->frequency->nextOccurrence($recurringTransaction->next_run_date);

            $recurringTransaction->update([
                'next_run_date' => $nextRunDate,
                'active' => $recurringTransaction->end_date === null || $nextRunDate->lte($recurringTransaction->end_date),
            ]);

            return $transaction;
        });
    }
}
