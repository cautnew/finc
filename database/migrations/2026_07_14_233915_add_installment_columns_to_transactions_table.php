<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('installment_plan_id')
                ->nullable()
                ->after('recurring_transaction_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedInteger('installment_number')->nullable()->after('installment_plan_id');
            $table->unsignedInteger('installments_total')->nullable()->after('installment_number');
            $table->boolean('is_installment')->default(false)->after('is_recurring');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('installment_plan_id');
            $table->dropColumn(['installment_number', 'installments_total', 'is_installment']);
        });
    }
};
