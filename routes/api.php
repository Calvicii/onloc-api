<?php

use App\Http\Controllers\DeviceController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureTokenIsValid;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Route where an authorization is required
Route::middleware(['auth'])->group(function () {
    Route::get('/info', [AuthController::class, 'info']);
});
