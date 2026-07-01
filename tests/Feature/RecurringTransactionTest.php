<?php

use App\Models\PaymentMethod;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;

test('recurring transactions page is displayed', function () {
    $user = User::factory()->create();
    RecurringTransaction::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('recurring-transactions.index'));

    $response->assertOk();
});

test('user can update their own recurring transaction', function () {
    $user = User::factory()->create();
    $recurringTransaction = RecurringTransaction::factory()->for($user)->create([
        'active' => true,
    ]);

    $response = $this->actingAs($user)->put(route('recurring-transactions.update', $recurringTransaction), [
        'amount' => '75.00',
        'frequency' => 'weekly',
        'active' => false,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('recurring-transactions.index'));

    $recurringTransaction->refresh();

    expect($recurringTransaction->amount)->toBe('75.00');
    expect($recurringTransaction->frequency->value)->toBe('weekly');
    expect($recurringTransaction->active)->toBeFalse();
});

test('user cannot update another users recurring transaction', function () {
    $owner = User::factory()->create();
    $recurringTransaction = RecurringTransaction::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->put(route('recurring-transactions.update', $recurringTransaction), [
        'amount' => '1.00',
        'frequency' => 'daily',
        'active' => true,
    ]);

    $response->assertForbidden();
});

test('user can launch a recurring transaction with custom values', function () {
    $user = User::factory()->create();
    $pm = PaymentMethod::factory()->for($user)->create();
    $recurringTransaction = RecurringTransaction::factory()->for($user)->create([
        'frequency' => 'monthly',
        'next_run_date' => Carbon::parse('2026-07-10'),
        'amount' => '49.90',
        'active' => true,
    ]);

    $response = $this->actingAs($user)->post(
        route('recurring-transactions.launch', $recurringTransaction),
        [
            'amount' => '55.00',
            'transaction_date' => '2026-07-12',
            'due_date' => '2026-07-15',
            'payment_method_id' => $pm->id,
            'description' => 'Ajustado manualmente',
        ]
    );

    $response->assertSessionHasNoErrors()->assertRedirect(route('recurring-transactions.index'));

    $transaction = Transaction::where('recurring_transaction_id', $recurringTransaction->id)->first();

    expect($transaction)->not->toBeNull();
    expect($transaction->amount)->toBe('55.00');
    expect($transaction->transaction_date->toDateString())->toBe('2026-07-12');
    expect($transaction->due_date->toDateString())->toBe('2026-07-15');
    expect($transaction->payment_method_id)->toBe($pm->id);
    expect($transaction->description)->toBe('Ajustado manualmente');
    expect($transaction->is_recurring)->toBeTrue();

    // Next run date advanced by one month
    expect($recurringTransaction->fresh()->next_run_date->toDateString())->toBe('2026-08-10');
});

test('user cannot launch another users recurring transaction', function () {
    $owner = User::factory()->create();
    $recurringTransaction = RecurringTransaction::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->post(
        route('recurring-transactions.launch', $recurringTransaction),
        ['amount' => '1.00', 'transaction_date' => '2026-07-01']
    );

    $response->assertForbidden();
    expect(Transaction::where('recurring_transaction_id', $recurringTransaction->id)->count())->toBe(0);
});

test('user can delete their own recurring transaction', function () {
    $user = User::factory()->create();
    $recurringTransaction = RecurringTransaction::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(route('recurring-transactions.destroy', $recurringTransaction));

    $response->assertRedirect(route('recurring-transactions.index'));

    expect(RecurringTransaction::find($recurringTransaction->id))->toBeNull();
});
