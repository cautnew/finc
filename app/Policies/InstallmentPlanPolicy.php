<?php

namespace App\Policies;

use App\Models\InstallmentPlan;
use App\Models\User;

class InstallmentPlanPolicy
{
    public function view(User $user, InstallmentPlan $installmentPlan): bool
    {
        return $user->id === $installmentPlan->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, InstallmentPlan $installmentPlan): bool
    {
        return $user->id === $installmentPlan->user_id;
    }

    public function delete(User $user, InstallmentPlan $installmentPlan): bool
    {
        return $user->id === $installmentPlan->user_id;
    }
}
