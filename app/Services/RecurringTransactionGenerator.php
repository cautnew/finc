<?php

namespace App\Services;

use App\Actions\Transactions\MaterializeRecurringOccurrence;
use App\Models\RecurringTransaction;
use Illuminate\Support\Carbon;

class RecurringTransactionGenerator
{
    public function __construct(private readonly MaterializeRecurringOccurrence $materialize) {}

    /**
     * Generate due transactions for every active recurring template and
     * advance each template to its next occurrence.
     */
    public function generate(): int
    {
        $generated = 0;

        RecurringTransaction::query()
            ->where('active', true)
            ->where('next_run_date', '<=', Carbon::today())
            ->each(function (RecurringTransaction $recurringTransaction) use (&$generated) {
                $this->materialize->handle($recurringTransaction);
                $generated++;
            });

        return $generated;
    }
}
