<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinancialSummaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    private const MONTHS = 6;

    public function __construct(private readonly FinancialSummaryService $summary) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $from = Carbon::now()->subMonthsNoOverflow(self::MONTHS - 1)->startOfMonth();
        $to = Carbon::now()->endOfMonth();

        $categoryTrend = collect(range(0, self::MONTHS - 1))->map(function (int $offset, int $index) use ($user) {
            $month = Carbon::now()->subMonthsNoOverflow(self::MONTHS - 1 - $offset)->startOfMonth();

            return [
                'month' => $month->format('Y-m'),
                'categories' => $this->summary->byCategory($user, $month->copy()->startOfMonth(), $month->copy()->endOfMonth()),
            ];
        });

        return Inertia::render('analytics/index', [
            'expensesByCategory' => $this->summary->byCategory($user, $from, $to),
            'expensesByPaymentMethod' => $this->summary->byPaymentMethod($user, $from, $to),
            'monthlyEvolution' => $this->summary->monthlyEvolution($user, self::MONTHS),
            'categoryTrend' => $categoryTrend,
        ]);
    }
}
