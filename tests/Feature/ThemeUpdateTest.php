<?php

use App\Enums\Theme;
use App\Models\User;

test('user can update their color theme', function () {
    $user = User::factory()->create(['theme' => Theme::Blue]);

    $response = $this->actingAs($user)->patch(route('theme.update'), [
        'theme' => 'roxo',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    expect($user->fresh()->theme)->toBe(Theme::Purple);
});

test('theme update rejects invalid values', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('theme.update'), [
        'theme' => 'invalid-theme',
    ]);

    $response->assertSessionHasErrors('theme');
});
