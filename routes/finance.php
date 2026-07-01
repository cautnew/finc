<?php

use App\Http\Controllers\Finance\AnalyticsController;
use App\Http\Controllers\Finance\CategoryController;
use App\Http\Controllers\Finance\PaymentMethodController;
use App\Http\Controllers\Finance\RecurringTransactionController;
use App\Http\Controllers\Finance\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);
    Route::resource('payment-methods', PaymentMethodController::class)->except(['show', 'create', 'edit']);
    Route::resource('transactions', TransactionController::class)->except(['show', 'create', 'edit']);
    Route::resource('recurring-transactions', RecurringTransactionController::class)->only(['index', 'update', 'destroy']);
    Route::post('recurring-transactions/{recurring_transaction}/launch', [RecurringTransactionController::class, 'launch'])->name('recurring-transactions.launch');

    Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
});
