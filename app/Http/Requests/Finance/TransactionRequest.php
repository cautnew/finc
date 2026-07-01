<?php

namespace App\Http\Requests\Finance;

use App\Enums\RecurrenceFrequency;
use App\Enums\TransactionType;
use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()->can('create', Transaction::class)
            : $this->user()->can('update', $this->route('transaction'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'type' => ['required', Rule::enum(TransactionType::class)],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date'],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'payment_method_id' => [
                'nullable',
                Rule::exists('payment_methods', 'id')->where('user_id', $userId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_recurring' => ['boolean'],
            'frequency' => ['required_if:is_recurring,true', Rule::enum(RecurrenceFrequency::class)],
            'end_date' => ['nullable', 'date', 'after_or_equal:transaction_date'],
        ];
    }
}
