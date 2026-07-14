<?php

namespace App\Models;

use App\Enums\TransactionType;
use Database\Factories\InstallmentPlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
 * @property string $total_amount
 * @property int $installments_total
 * @property int $installments_paid
 * @property string|null $description
 * @property Carbon $start_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read float $percentage_remaining
 */
#[Fillable(['user_id', 'category_id', 'payment_method_id', 'type', 'total_amount', 'installments_total', 'installments_paid', 'description', 'start_date'])]
class InstallmentPlan extends Model
{
    /** @use HasFactory<InstallmentPlanFactory> */
    use HasFactory;

    protected $appends = ['percentage_remaining'];

    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'total_amount' => 'decimal:2',
            'installments_total' => 'integer',
            'installments_paid' => 'integer',
            'start_date' => 'date:Y-m-d',
        ];
    }

    protected function percentageRemaining(): Attribute
    {
        return Attribute::get(function (): float {
            if ($this->installments_total === 0) {
                return 0.0;
            }

            return round((($this->installments_total - $this->installments_paid) / $this->installments_total) * 100, 2);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
