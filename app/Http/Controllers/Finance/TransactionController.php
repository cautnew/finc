<?php

namespace App\Http\Controllers\Finance;

use App\Actions\Transactions\CreateTransaction;
use App\Actions\Transactions\UpdateTransaction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\TransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = $user->transactions()
            ->with(['category', 'paymentMethod'])
            ->when($request->string('type')->isNotEmpty(), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->integer('category_id')))
            ->when($request->filled('payment_method_id'), fn ($query) => $query->where('payment_method_id', $request->integer('payment_method_id')))
            ->when($request->filled('from'), fn ($query) => $query->where('transaction_date', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->where('transaction_date', '<=', $request->date('to')))
            ->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('description', 'like', '%'.$request->string('search').'%'))
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'categories' => $user->categories()->orderBy('name')->get(),
            'paymentMethods' => $user->paymentMethods()->orderBy('name')->get(),
            'filters' => $request->only(['type', 'category_id', 'payment_method_id', 'from', 'to', 'search']),
        ]);
    }

    public function store(TransactionRequest $request, CreateTransaction $createTransaction): RedirectResponse
    {
        $createTransaction->handle($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction created.')]);

        return to_route('transactions.index');
    }

    public function update(TransactionRequest $request, Transaction $transaction, UpdateTransaction $updateTransaction): RedirectResponse
    {
        $updateTransaction->handle($transaction, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction updated.')]);

        return to_route('transactions.index');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        Gate::authorize('delete', $transaction);

        $transaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction deleted.')]);

        return to_route('transactions.index');
    }
}
