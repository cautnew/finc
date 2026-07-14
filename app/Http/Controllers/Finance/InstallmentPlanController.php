<?php

namespace App\Http\Controllers\Finance;

use App\Actions\Transactions\UpdateInstallmentPlan;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\InstallmentPlanRequest;
use App\Models\InstallmentPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InstallmentPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('installment-plans/index', [
            'installmentPlans' => $user->installmentPlans()
                ->with(['category', 'paymentMethod'])
                ->orderByDesc('start_date')
                ->get(),
            'categories' => $user->categories()->orderBy('name')->get(),
            'paymentMethods' => $user->paymentMethods()->orderBy('name')->get(),
        ]);
    }

    public function update(InstallmentPlanRequest $request, InstallmentPlan $installmentPlan, UpdateInstallmentPlan $updateInstallmentPlan): RedirectResponse
    {
        $updateInstallmentPlan->handle($installmentPlan, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Installment plan updated.')]);

        return to_route('installment-plans.index');
    }

    public function destroy(InstallmentPlan $installmentPlan): RedirectResponse
    {
        Gate::authorize('delete', $installmentPlan);

        $installmentPlan->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Installment plan deleted.')]);

        return to_route('installment-plans.index');
    }
}
