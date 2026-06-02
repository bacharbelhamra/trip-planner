<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProxyController;
use App\Http\Controllers\Api\V1\TripController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware('throttle:5,1')
         ->post('/auth/firebase-login', [AuthController::class, 'firebaseLogin']);

    Route::get('/proxy/search-images', [ProxyController::class, 'searchImages']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',     [AuthController::class, 'me']);

        Route::middleware('throttle:10,1')
             ->post('/trips/generate', [TripController::class, 'generate']);

        Route::get('/trips',            [TripController::class, 'index']);
        Route::post('/trips',           [TripController::class, 'store']);
        Route::get('/trips/{trip}',     [TripController::class, 'show']);
        Route::delete('/trips/{trip}',  [TripController::class, 'destroy']);
    });
});
