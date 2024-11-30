<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function info()
    {
        return response()->json(['info' => 'hi'], 200);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($validated)) {
            $user = User::where('username', $request->username)->first();

            $user->tokens()->delete();
            $token = $user->createToken('OnlocToken');

            return response()->json([
                'user' => $user,
                'token' => $token->plainTextToken
            ], 200);
        }

        return response()->json(['errors' => 'Could not log in.'], 400);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'unique:users', 'max:16'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('OnlocToken');

        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken,
        ], 201);
    }
}
