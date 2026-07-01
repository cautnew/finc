<?php

namespace App\Http\Controllers\Finance;

use App\Actions\Transactions\MaterializeRecurringOccurrence;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\LaunchRecurringTransactionRequest;
use App\Http\Requests\Finance\RecurringTransactionRequest;
use App\Models\RecurringTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RecurringTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('recurring-transactions/index', [
            'recurringTransactions' => $user->recurringTransactions()
                ->with(['category', 'paymentMethod'])
                ->orderByDesc('active')
                ->orderBy('next_run_date')
                ->get(),
            'categories' => $user->categories()->orderBy('name')->get(),
            'paymentMethods' => $user->paymentMethods()->orderBy('name')->get(),
        ]);
    }

    public function update(RecurringTransactionRequest $request, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        $recurringTransaction->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Recurring transaction updated.')]);

        return to_route('recurring-transactions.index');
    }

    public function launch(
        LaunchRecurringTransactionRequest $request,
        RecurringTransaction $recurringTransaction,
        MaterializeRecurringOccurrence $materialize,
    ): RedirectResponse {
        $materialize->handle($recurringTransaction, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction launched.')]);

        return to_route('recurring-transactions.index');
    }

    public function destroy(RecurringTransaction $recurringTransaction): RedirectResponse
    {
        Gate::authorize('delete', $recurringTransaction);

        $recurringTransaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Recurring transaction deleted.')]);

        return to_route('recurring-transactions.index');
    }
}
