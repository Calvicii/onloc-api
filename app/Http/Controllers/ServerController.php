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

    public static function hasRegistration()
    {
        $registrationSetting = Setting::where('key', 'registration')->first();
        return $registrationSetting ? filter_var($registrationSetting->value, FILTER_VALIDATE_BOOLEAN) : false;
    }

    public function status()
    {
        $isSetup = false;
        if ($this::isSetup()) {
            $isSetup = true;
        }

        return response()->json([
            'isSetup' => $isSetup,
            'registration' => $this::hasRegistration(),
        ], 200);
    }
}
