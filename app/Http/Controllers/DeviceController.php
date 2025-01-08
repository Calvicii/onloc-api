<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DeviceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $devices = $user->devices()->with(['locations' => function ($query) {
            $query->latest()->take(1);
        }])->get();

        $devicesWithLatestLocation = $devices->map(function ($device) {
            $latestLocation = $device->locations->first();
            return [
                'id' => $device->id,
                'name' => $device->name,
                'icon' => $device->icon,
                'latest_location' => $latestLocation,
            ];
        });

        return response()->json($devicesWithLatestLocation, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('devices')->where(function ($query) use ($request) {
                    return $query->where('user_id', $request->user()->id);
                }),
            ],
            'icon' => ['nullable', 'string', 'max:255'],
        ]);

        $data = [
            'user_id' => Auth::id(),
            'name' => $validated['name'],
        ];

        if (isset($validated['icon'])) {
            $data['icon'] = $validated['icon'];
        }

        $device = Device::create($data);

        return response()->json(['message' => 'Device created successfully.', 'device' => $device], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Device $device)
    {
        if ($device->user_id == Auth::id()) {
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
        ]);

        if ($device->user_id == Auth::id()) {
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
        if ($device->user_id == Auth::id()) {
            $device->delete();
            return response(['message' => 'Device deleted successfully.'], 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }
}
