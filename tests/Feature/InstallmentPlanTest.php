<?php

use App\Actions\Transactions\GenerateInstallmentTransactions;
use App\Models\InstallmentPlan;
use App\Models\Transaction;
use App\Models\User;

test('creating an installment transaction generates the plan and every installment', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => '100.00',
        'transaction_date' => '2026-01-10',
        'is_installment' => true,
        'installments_total' => 3,
        'description' => 'Geladeira',
        'notes' => 'Comprada na loja X, garantia de 1 ano',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $plan = InstallmentPlan::where('description', 'Geladeira')->firstOrFail();

    expect($plan->total_amount)->toBe('100.00');
    expect($plan->installments_total)->toBe(3);
    expect($plan->installments_paid)->toBe(0);
    expect($plan->notes)->toBe('Comprada na loja X, garantia de 1 ano');

    $installments = Transaction::where('installment_plan_id', $plan->id)
        ->orderBy('installment_number')
        ->get();

    expect($installments)->toHaveCount(3);
    expect($installments->sum('amount'))->toEqualWithDelta(100.00, 0.001);
    expect($installments->pluck('installment_number')->all())->toBe([1, 2, 3]);
    expect($installments->pluck('installments_total')->all())->toBe([3, 3, 3]);
    expect($installments->every(fn (Transaction $t) => $t->is_installment))->toBeTrue();
    expect($installments->every(fn (Transaction $t) => $t->notes === 'Comprada na loja X, garantia de 1 ano'))->toBeTrue();
    expect($installments[0]->transaction_date->toDateString())->toBe('2026-01-10');
    expect($installments[1]->transaction_date->toDateString())->toBe('2026-02-10');
    expect($installments[2]->transaction_date->toDateString())->toBe('2026-03-10');
});

test('a transaction cannot be both recurring and installment based', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => '100.00',
        'transaction_date' => '2026-01-10',
        'is_recurring' => true,
        'frequency' => 'monthly',
        'is_installment' => true,
        'installments_total' => 3,
    ]);

    $response->assertSessionHasErrors('is_installment');
});

test('installment plans page is displayed', function () {
    $user = User::factory()->create();
    InstallmentPlan::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('installment-plans.index'));

    $response->assertOk();
});

test('updating the total amount without changing the installment count redistributes amounts', function () {
    $user = User::factory()->create();
    $plan = InstallmentPlan::factory()->for($user)->create([
        'total_amount' => '90.00',
        'installments_total' => 3,
        'installments_paid' => 0,
    ]);
    app(GenerateInstallmentTransactions::class)->handle($plan);

    $response = $this->actingAs($user)->put(route('installment-plans.update', $plan), [
        'total_amount' => '150.00',
        'installments_total' => 3,
        'installments_paid' => 1,
        'notes' => 'Renegociado com o vendedor',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('installment-plans.index'));

    $plan->refresh();
    expect($plan->total_amount)->toBe('150.00');
    expect($plan->installments_paid)->toBe(1);
    expect($plan->notes)->toBe('Renegociado com o vendedor');

    $installments = $plan->transactions()->orderBy('installment_number')->get();
    expect($installments)->toHaveCount(3);
    expect($installments->sum('amount'))->toEqualWithDelta(150.00, 0.001);
});

test('changing the installment count regenerates the installments', function () {
    $user = User::factory()->create();
    $plan = InstallmentPlan::factory()->for($user)->create([
        'total_amount' => '90.00',
        'installments_total' => 3,
        'installments_paid' => 0,
    ]);
    app(GenerateInstallmentTransactions::class)->handle($plan);
    $originalIds = $plan->transactions()->pluck('id');

    $response = $this->actingAs($user)->put(route('installment-plans.update', $plan), [
        'total_amount' => '120.00',
        'installments_total' => 4,
        'installments_paid' => 0,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('installment-plans.index'));

    expect(Transaction::whereIn('id', $originalIds)->exists())->toBeFalse();

    $installments = $plan->transactions()->orderBy('installment_number')->get();
    expect($installments)->toHaveCount(4);
    expect($installments->sum('amount'))->toEqualWithDelta(120.00, 0.001);
    expect($installments->pluck('installment_number')->all())->toBe([1, 2, 3, 4]);
});

test('user cannot update another users installment plan', function () {
    $owner = User::factory()->create();
    $plan = InstallmentPlan::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->put(route('installment-plans.update', $plan), [
        'total_amount' => '1.00',
        'installments_total' => 2,
        'installments_paid' => 0,
    ]);

    $response->assertForbidden();
});

test('deleting an installment plan deletes its installments too', function () {
    $user = User::factory()->create();
    $plan = InstallmentPlan::factory()->for($user)->create([
        'installments_total' => 2,
    ]);
    app(GenerateInstallmentTransactions::class)->handle($plan);

    $response = $this->actingAs($user)->delete(route('installment-plans.destroy', $plan));

    $response->assertSessionHasNoErrors()->assertRedirect(route('installment-plans.index'));

    expect(InstallmentPlan::find($plan->id))->toBeNull();
    expect(Transaction::where('installment_plan_id', $plan->id)->exists())->toBeFalse();
});
