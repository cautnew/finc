<?php

namespace Database\Factories;

use App\Enums\RecurrenceFrequency;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringTransaction>
 */
class RecurringTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', 'now');

        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'payment_method_id' => PaymentMethod::factory(),
            'type' => fake()->randomElement(TransactionType::cases()),
            'amount' => fake()->randomFloat(2, 10, 2000),
            'description' => fake()->sentence(),
            'frequency' => fake()->randomElement(RecurrenceFrequency::cases()),
            'start_date' => $startDate,
            'next_run_date' => $startDate,
            'end_date' => null,
            'active' => true,
        ];
    }
}
