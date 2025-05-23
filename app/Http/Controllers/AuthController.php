<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return response()->json($user, 201);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'username' => ['sometimes', 'string', 'unique:users', 'max:16'],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed']
        ]);

        $user = User::where('id', $request->id)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);
        return response()->json($user, 200);

        if ($user->id == Auth::id()) {
            $user->update($validated);
            return response()->json($user, 200);
        } else {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
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

        if (!ServerController::isSetup() || ServerController::hasRegistration()) {
            $isAdmin = User::where('admin', true)->exists() ? false : true;

            $user = User::create([
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'admin' => $isAdmin,
            ]);

            $userAgent = $request->header('User-Agent');
            $token = $user->createToken($userAgent);

            return response()->json([
                'user' => $user,
                'token' => $token->plainTextToken,
            ], 201);
        }
        return response()->json(['message' => 'Registration is disabled.'], 403);
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
