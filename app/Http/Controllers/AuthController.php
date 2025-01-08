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

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return response()->json($user, 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($validated)) {
            $user = User::where('username', $request->username)->first();

            $userAgent = $request->header('User-Agent');
            $token = $user->createToken($userAgent);

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

        $userAgent = $request->header('User-Agent');
        $token = $user->createToken($userAgent);

        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken,
        ], 201);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.'], 201);
    }

    public function tokens(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $tokens = $user->tokens()->get(['id', 'name', 'last_used_at', 'created_at']);

        return response()->json($tokens, 200);
    }

    public function deleteToken(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $token = $user->tokens()->find($id);

        if (!$token) {
            return response()->json(['message' => 'Token not found.'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'Token deleted successfully.'], 200);
    }
}
