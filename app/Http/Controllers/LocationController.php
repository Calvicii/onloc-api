<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $locations = $query->orderBy('created_at')->get();

        $groupedLocations = $locations->groupBy('device_id');

        if ($latest && strtolower($latest) === 'true') {
            $latestLocations = $groupedLocations->map(function ($deviceLocations) {
                return $deviceLocations->sortByDesc('created_at')->first();
            });

            return response()->json($latestLocations, 200);
        }

        return response()->json($groupedLocations, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Location $location)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        //
    }
}
