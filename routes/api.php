<?php

use App\Http\Controllers\DeviceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ServerController;
use Illuminate\Support\Facades\Route;

Route::get('/status', [ServerController::class, 'status']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Route where an authorization is required
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/validate-auth', [AuthController::class, 'validateAuth']);
    Route::get('/user', [AuthController::class, 'index']);
    Route::get('/user/tokens', [AuthController::class, 'tokens']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/user/tokens/{id}', [AuthController::class, 'deleteToken']);

    Route::apiResource('devices', DeviceController::class);
    Route::apiResource('locations', LocationController::class);
});
