<?php

use App\Http\Controllers\DeviceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);

// Route where an authorization is required
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/info', [AuthController::class, 'info']);

    Route::apiResource('devices', DeviceController::class);
    Route::apiResource('locations', LocationController::class);
});
