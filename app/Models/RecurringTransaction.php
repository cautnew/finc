<?php

namespace App\Models;

use App\Enums\RecurrenceFrequency;
use App\Enums\TransactionType;
use Database\Factories\RecurringTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $category_id
 * @property int|null $payment_method_id
 * @property TransactionType $type
 * @property string $amount
 * @property string|null $description
 * @property RecurrenceFrequency $frequency
 * @property Carbon $start_date
 * @property Carbon $next_run_date
 * @property Carbon|null $end_date
 * @property bool $active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'category_id', 'payment_method_id', 'type', 'amount', 'description', 'frequency', 'start_date', 'next_run_date', 'end_date', 'active'])]
class RecurringTransaction extends Model
{
    /** @use HasFactory<RecurringTransactionFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'frequency' => RecurrenceFrequency::class,
            'amount' => 'decimal:2',
            'start_date' => 'date:Y-m-d',
            'next_run_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, RecurringTransaction>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Category, RecurringTransaction>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<PaymentMethod, RecurringTransaction>
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * @return HasMany<Transaction, RecurringTransaction>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
