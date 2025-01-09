<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;

class ServerController extends Controller
{
    public static function isSetup()
    {
        $isSetup = true;
        $asAdmin = User::where('admin', true)->exists() ? true : false;
        if (!$asAdmin) {
            $isSetup = false;
        }
        return $isSetup;
    }

    public function status()
    {
        $registrationSetting = Setting::where('key', 'registration')->first();
        $registration = $registrationSetting ? filter_var($registrationSetting->value, FILTER_VALIDATE_BOOLEAN) : false;

        $isSetup = false;
        if ($this::isSetup()) {
            $isSetup = true;
        }

        return response()->json([
            'isSetup' => $isSetup,
            'registration' => $registration,
        ], 200);
    }
}
