<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\PaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('payment-methods/index', [
            'paymentMethods' => $request->user()->paymentMethods()->orderBy('name')->get(),
        ]);
    }

    public function store(PaymentMethodRequest $request): RedirectResponse
    {
        $request->user()->paymentMethods()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Payment method created.')]);

        return to_route('payment-methods.index');
    }

    public function update(PaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Payment method updated.')]);

        return to_route('payment-methods.index');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        Gate::authorize('delete', $paymentMethod);

        $paymentMethod->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Payment method deleted.')]);

        return to_route('payment-methods.index');
    }
}
