<?php

namespace Database\Factories;

use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\InstallmentPlan;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InstallmentPlan>
 */
class InstallmentPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'payment_method_id' => PaymentMethod::factory(),
            'type' => fake()->randomElement(TransactionType::cases()),
            'total_amount' => fake()->randomFloat(2, 100, 5000),
            'installments_total' => fake()->numberBetween(2, 12),
            'installments_paid' => 0,
            'description' => fake()->sentence(),
            'start_date' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
