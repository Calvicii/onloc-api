<?php

namespace App\Http\Controllers;

use App\Models\User;

class ServerController extends Controller
{
    public function status()
    {
        $asAdmin = User::where('admin', true)->exists() ? true : false;
        if ($asAdmin) {
            return response()->json(['isSetup' => 'true', 'message' => 'The server is setup.'], 200);
        }
        return response()->json(['isSetup' => 'false', 'message' => 'The server is not setup.'], 200);
    }
}
