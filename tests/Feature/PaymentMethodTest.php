<?php

use App\Models\PaymentMethod;
use App\Models\User;

test('payment methods page is displayed', function () {
    $user = User::factory()->create();
    PaymentMethod::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('payment-methods.index'));

    $response->assertOk();
});

test('user can create a payment method', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('payment-methods.store'), [
        'name' => 'Pix',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('payment-methods.index'));

    expect($user->paymentMethods()->where('name', 'Pix')->exists())->toBeTrue();
});

test('user can update their own payment method', function () {
    $user = User::factory()->create();
    $paymentMethod = PaymentMethod::factory()->for($user)->create();

    $response = $this->actingAs($user)->put(route('payment-methods.update', $paymentMethod), [
        'name' => 'Cartão de crédito',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('payment-methods.index'));

    expect($paymentMethod->fresh()->name)->toBe('Cartão de crédito');
});

test('user can delete their own payment method', function () {
    $user = User::factory()->create();
    $paymentMethod = PaymentMethod::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(route('payment-methods.destroy', $paymentMethod));

    $response->assertRedirect(route('payment-methods.index'));

    expect(PaymentMethod::find($paymentMethod->id))->toBeNull();
});

test('user cannot delete another users payment method', function () {
    $owner = User::factory()->create();
    $paymentMethod = PaymentMethod::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->delete(route('payment-methods.destroy', $paymentMethod));

    $response->assertForbidden();
    expect(PaymentMethod::find($paymentMethod->id))->not->toBeNull();
});
