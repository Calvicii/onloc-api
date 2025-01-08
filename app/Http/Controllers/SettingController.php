<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $settings = Setting::get();
        return response()->json(['settings' => $settings], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'unique:settings', 'max:255'],
            'value' => ['required', 'string', 'max:255'],
        ]);

        $setting = Setting::create($validated);

        return response()->json(['message' => 'Setting created successfully.', 'setting' => $setting], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $setting = Setting::findOrFail($id);
        return response()->json(['setting' => $setting], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $setting = Setting::findOrFail($id);

        $validated = $request->validate([
            'key' => [
                'required',
                'string',
                'max:255',
                Rule::unique('settings')->ignore($setting->id)
            ],
            'value' => ['required', 'string', 'max:255'],
        ]);

        $setting->update($validated);

        return response()->json(['message' => 'Setting updated successfully.', 'setting' => $setting], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $setting = Setting::findOrFail($id);
        $setting->delete();
        return response()->json(['message' => 'Setting deleted successfully.'], 204);
    }
}
