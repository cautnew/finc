<?php

use App\Models\Transaction;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('analytics.index'));

    $response->assertRedirect(route('login'));
});

test('analytics page is displayed with transaction data', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create(['type' => 'expense']);

    $response = $this->actingAs($user)->get(route('analytics.index'));

    $response->assertOk();
});
