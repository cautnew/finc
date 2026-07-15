<?php

use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;

test('transactions page is displayed', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('transactions.index'));

    $response->assertOk();
});

test('user can create a transaction', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $paymentMethod = PaymentMethod::factory()->for($user)->create();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => '150.50',
        'transaction_date' => '2026-01-10',
        'category_id' => $category->id,
        'payment_method_id' => $paymentMethod->id,
        'description' => 'Mercado',
        'notes' => 'Compra do mês, cartão final 1234',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction = $user->transactions()->where('description', 'Mercado')->first();

    expect($transaction)->not->toBeNull();
    expect($transaction->notes)->toBe('Compra do mês, cartão final 1234');
});

test('creating a recurring transaction also creates its template', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => '50.00',
        'transaction_date' => '2026-01-10',
        'is_recurring' => true,
        'frequency' => 'monthly',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction = $user->transactions()->latest('id')->first();

    expect($transaction->is_recurring)->toBeTrue();
    expect($transaction->recurring_transaction_id)->not->toBeNull();

    $recurringTransaction = RecurringTransaction::find($transaction->recurring_transaction_id);

    expect($recurringTransaction)->not->toBeNull();
    expect($recurringTransaction->next_run_date->toDateString())->toBe('2026-02-10');
    expect($recurringTransaction->active)->toBeTrue();
});

test('user cannot use another users category when creating a transaction', function () {
    $user = User::factory()->create();
    $otherUsersCategory = Category::factory()->create();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => '10.00',
        'transaction_date' => '2026-01-10',
        'category_id' => $otherUsersCategory->id,
    ]);

    $response->assertSessionHasErrors('category_id');
});

test('user can update their own transaction', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->for($user)->create();

    $response = $this->actingAs($user)->put(route('transactions.update', $transaction), [
        'type' => 'income',
        'amount' => '99.99',
        'transaction_date' => '2026-02-01',
        'notes' => 'Ajustado manualmente',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction->refresh();
    expect($transaction->amount)->toBe('99.99');
    expect($transaction->notes)->toBe('Ajustado manualmente');
});

test('user cannot delete another users transaction', function () {
    $owner = User::factory()->create();
    $transaction = Transaction::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->delete(route('transactions.destroy', $transaction));

    $response->assertForbidden();
    expect(Transaction::find($transaction->id))->not->toBeNull();
});
