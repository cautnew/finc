<?php

namespace App\Http\Requests\Finance;

use App\Models\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentMethodRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()->can('create', PaymentMethod::class)
            : $this->user()->can('update', $this->route('payment_method'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('payment_methods', 'name')
                    ->where('user_id', $this->user()->id)
                    ->ignore($this->route('payment_method')),
            ],
        ];
    }
}
