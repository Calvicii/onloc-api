<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function validateAuth()
    {
        return response()->json(['valid' => true], 200);
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

        return response()->json(['message' => 'Invalid credentials.'], 400);
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

    public function logout(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::find($validated['id']);

        if (!$user) {
            return  response()->json(['message' => 'User not found.'], 404);
        }

        $user->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }
}
