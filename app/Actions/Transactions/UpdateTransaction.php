<?php

namespace App\Actions\Transactions;

use App\Models\Transaction;

class UpdateTransaction
{
    /**
     * Update a single transaction occurrence.
     *
     * Note: editing a transaction generated from a recurring template only
     * affects that occurrence; the template itself is left untouched.
     *
     * @param  array<string, mixed>  $data
     */
    public function handle(Transaction $transaction, array $data): Transaction
    {
        $transaction->update([
            'category_id' => $data['category_id'] ?? null,
            'payment_method_id' => $data['payment_method_id'] ?? null,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'transaction_date' => $data['transaction_date'],
            'due_date' => $data['due_date'] ?? null,
            'description' => $data['description'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return $transaction;
    }
}
