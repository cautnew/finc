<?php

namespace App\Console\Commands;

use App\Services\RecurringTransactionGenerator;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('transactions:generate-recurring')]
#[Description('Generate due transactions from active recurring templates')]
class GenerateRecurringTransactions extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(RecurringTransactionGenerator $generator): int
    {
        $count = $generator->generate();

        $this->info("Generated {$count} recurring transaction(s).");

        return self::SUCCESS;
    }
}
