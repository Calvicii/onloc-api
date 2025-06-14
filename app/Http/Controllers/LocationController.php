<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $deviceId = $request->query('device_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $latest = $request->query('latest');

        $user = Auth::user();
        $query = Location::whereHas('device', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });

        if ($deviceId) {
            $query->where('device_id', $deviceId);
        }

        if ($startDate) {
            $startDateConverted = Carbon::parse($startDate);

            $startTimezone = $startDateConverted->getTimezone();

            $startDateConverted
                ->setTimezone($startTimezone)
                ->startOfDay()
                ->setTimezone('UTC')
                ->toDateTimeString();
            $query->where('created_at', '>=', $startDateConverted);
        }

        if ($endDate) {
            $endDateConverted = Carbon::parse($endDate);

            $endTimezone = $endDateConverted->getTimezone();

            $endDateConverted
                ->setTimezone($endTimezone)
                ->endOfDay()
                ->setTimezone('UTC')
                ->toDateTimeString();
            $query->where('created_at', '<=', $endDateConverted);
        }

        $locations = $query->orderBy('created_at')->get();

        $groupedLocations = $locations->groupBy('device_id');

        if ($latest && strtolower($latest) === 'true') {
            $latestLocations = $groupedLocations->map(function ($deviceLocations, $deviceId) {
                return [
                    'device_id' => $deviceId,
                    'locations' => [$deviceLocations->sortByDesc('created_at')->first()]
                ];
            })->values();

            return response()->json($latestLocations, 200);
        }

        $formattedLocations = $groupedLocations->map(function ($deviceLocations, $deviceId) {
            return [
                'device_id' => $deviceId,
                'locations' => $deviceLocations->values()
            ];
        })->values();

        return response()->json($formattedLocations, 200);
    }

    /**
     * Display the available dates associated with a device's locations
     */
    public function availableDates(Request $request)
    {
        $deviceId = $request->query('device_id');

        $user = Auth::user();
        $query = Location::whereHas('device', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });

        if ($deviceId) {
            $query->where('device_id', $deviceId);
        }

        $dates = $query
            ->orderBy('created_at')
            ->get()
            ->pluck('created_at')
            ->map(function ($date) {
                return $date->toDateString();
            })
            ->unique()
            ->values();

        return response()->json($dates, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => ['required', 'integer', 'exists:devices,id,user_id,' . Auth::id()],
            'accuracy' => ['nullable', 'numeric'],
            'altitude' => ['nullable', 'numeric'],
            'altitude_accuracy' => ['nullable', 'numeric'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'battery' => ['nullable', 'numeric'],
        ]);

        $location = Location::create($validated);

        return response()->json($location, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Location $location)
    {
        if ($location->device->user_id == Auth::id()) {
            return response()->json($location, 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'device_id' => ['nullable', 'integer', 'exists:devices,id,user_id,' . Auth::id()],
            'accuracy' => ['nullable', 'numeric'],
            'altitude' => ['nullable', 'numeric'],
            'altitude_accuracy' => ['nullable', 'numeric'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'battery' => ['nullable', 'numeric'],
        ]);

        if ($location->device->user_id == Auth::id()) {
            $location->update($validated);
            return response()->json($location, 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        if ($location->device->user_id == Auth::id()) {
            $location->delete();
            return response(['message' => 'Device deleted successfully.'], 200);
        } else {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
    }
}
