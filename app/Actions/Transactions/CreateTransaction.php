<?php

namespace App\Actions\Transactions;

use App\Enums\RecurrenceFrequency;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CreateTransaction
{
    /**
     * Create a transaction, materializing a recurring template when requested.
     *
     * @param  array<string, mixed>  $data
     */
    public function handle(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data) {
            $recurringTransactionId = null;

            if ($data['is_recurring'] ?? false) {
                $frequency = RecurrenceFrequency::from($data['frequency']);
                $transactionDate = Carbon::parse($data['transaction_date']);

                $recurringTransaction = RecurringTransaction::create([
                    'user_id' => $user->id,
                    'category_id' => $data['category_id'] ?? null,
                    'payment_method_id' => $data['payment_method_id'] ?? null,
                    'type' => $data['type'],
                    'amount' => $data['amount'],
                    'description' => $data['description'] ?? null,
                    'frequency' => $frequency,
                    'start_date' => $transactionDate,
                    'next_run_date' => $frequency->nextOccurrence($transactionDate),
                    'end_date' => $data['end_date'] ?? null,
                    'active' => true,
                ]);

                $recurringTransactionId = $recurringTransaction->id;
            }

            return Transaction::create([
                'user_id' => $user->id,
                'category_id' => $data['category_id'] ?? null,
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'recurring_transaction_id' => $recurringTransactionId,
                'type' => $data['type'],
                'amount' => $data['amount'],
                'transaction_date' => $data['transaction_date'],
                'due_date' => $data['due_date'] ?? null,
                'description' => $data['description'] ?? null,
                'is_recurring' => $recurringTransactionId !== null,
            ]);
        });
    }
}
