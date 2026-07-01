<?php

namespace App\Http\Requests\Finance;

use App\Enums\RecurrenceFrequency;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecurringTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('recurring_transaction'));
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
            'amount' => ['required', 'numeric', 'min:0.01'],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'payment_method_id' => [
                'nullable',
                Rule::exists('payment_methods', 'id')->where('user_id', $userId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'frequency' => ['required', Rule::enum(RecurrenceFrequency::class)],
            'end_date' => ['nullable', 'date'],
            'active' => ['required', 'boolean'],
        ];
    }
}
