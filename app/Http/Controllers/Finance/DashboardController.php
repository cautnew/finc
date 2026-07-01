<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinancialSummaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly FinancialSummaryService $summary) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $from = $request->filled('from') ? Carbon::parse($request->string('from')) : Carbon::now()->startOfMonth();
        $to = $request->filled('to') ? Carbon::parse($request->string('to')) : Carbon::now()->endOfMonth();

        return Inertia::render('dashboard', [
            'totals' => $this->summary->totals($user, $from, $to),
            'expensesByCategory' => $this->summary->byCategory($user, $from, $to),
            'monthlyEvolution' => $this->summary->monthlyEvolution($user, 6),
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }
}
