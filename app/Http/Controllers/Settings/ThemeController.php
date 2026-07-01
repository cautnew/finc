<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ThemeUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ThemeController extends Controller
{
    public function update(ThemeUpdateRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Theme updated.')]);

        return back();
    }
}
