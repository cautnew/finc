<?php

use App\Models\RecurringTransaction;
use App\Models\User;
use App\Services\RecurringTransactionGenerator;
use Illuminate\Support\Carbon;

test('it generates a transaction for each due recurring template and advances next_run_date', function () {
    $user = User::factory()->create();

    $recurringTransaction = RecurringTransaction::factory()->for($user)->create([
        'frequency' => 'monthly',
        'next_run_date' => Carbon::today(),
        'end_date' => null,
        'active' => true,
    ]);

    $generated = app(RecurringTransactionGenerator::class)->generate();

    expect($generated)->toBe(1);

    $transaction = $user->transactions()->first();

    expect($transaction)->not->toBeNull();
    expect($transaction->recurring_transaction_id)->toBe($recurringTransaction->id);
    expect($transaction->is_recurring)->toBeTrue();

    $recurringTransaction->refresh();

    expect($recurringTransaction->next_run_date->toDateString())
        ->toBe(Carbon::today()->addMonthNoOverflow()->toDateString());
    expect($recurringTransaction->active)->toBeTrue();
});

test('it deactivates the template once next_run_date passes end_date', function () {
    $user = User::factory()->create();

    $recurringTransaction = RecurringTransaction::factory()->for($user)->create([
        'frequency' => 'monthly',
        'next_run_date' => Carbon::today(),
        'end_date' => Carbon::today(),
        'active' => true,
    ]);

    app(RecurringTransactionGenerator::class)->generate();

    expect($recurringTransaction->refresh()->active)->toBeFalse();
});

test('it ignores inactive or not-yet-due templates', function () {
    $user = User::factory()->create();

    RecurringTransaction::factory()->for($user)->create([
        'next_run_date' => Carbon::today()->addDay(),
        'active' => true,
    ]);

    RecurringTransaction::factory()->for($user)->create([
        'next_run_date' => Carbon::today(),
        'active' => false,
    ]);

    $generated = app(RecurringTransactionGenerator::class)->generate();

    expect($generated)->toBe(0);
    expect($user->transactions()->count())->toBe(0);
});
