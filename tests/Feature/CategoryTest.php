<?php

use App\Models\Category;
use App\Models\User;

test('categories page is displayed', function () {
    $user = User::factory()->create();
    Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('categories.index'));

    $response->assertOk();
});

test('user can create a category', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('categories.store'), [
        'name' => 'Alimentação',
        'color' => '#ff0000',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categories.index'));

    expect($user->categories()->where('name', 'Alimentação')->exists())->toBeTrue();
});

test('user can update their own category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->put(route('categories.update', $category), [
        'name' => 'Transporte',
        'color' => '#00ff00',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categories.index'));

    expect($category->fresh()->name)->toBe('Transporte');
});

test('user can delete their own category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(route('categories.destroy', $category));

    $response->assertRedirect(route('categories.index'));

    expect(Category::find($category->id))->toBeNull();
});

test('user cannot update another users category', function () {
    $owner = User::factory()->create();
    $category = Category::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->put(route('categories.update', $category), [
        'name' => 'Hacked',
    ]);

    $response->assertForbidden();
});

test('user cannot delete another users category', function () {
    $owner = User::factory()->create();
    $category = Category::factory()->for($owner)->create();
    $intruder = User::factory()->create();

    $response = $this->actingAs($intruder)->delete(route('categories.destroy', $category));

    $response->assertForbidden();
    expect(Category::find($category->id))->not->toBeNull();
});
