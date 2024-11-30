<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DeviceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $devices = Device::where('owner_id', $user->id)->get();

        return response()->json($devices, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'unique:devices', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'battery_level' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $user = Auth::user();

        $data = [
            'owner_id' => $user->id,
            'name' => $validated['name'],
        ];

        if (isset($validated['icon'])) {
            $data['icon'] = $validated['icon'];
        }

        if (isset($validated['battery_level'])) {
            $data['battery_level'] = $validated['battery_level'];
        }

        $device = Device::create($data);

        return response()->json($device, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Device $device)
    {
        $user = Auth::user();

        if ($device->owner_id == $user->id) {
            return response()->json($device, 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Device $device)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'unique:devices,name,' . $device->id, 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'battery_level' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $user = Auth::user();

        if ($device->owner_id == $user->id) {
            $device->update($validated);
            return response()->json($device, 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Device $device)
    {
        $user = Auth::user();

        if ($device->owner_id == $user->id) {
            $device->delete();
            return response(['message' => 'Device deleted successfully.'], 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }
}
