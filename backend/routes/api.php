<?php

use App\Http\Controllers\Api\CaseController;
use App\Http\Controllers\Api\InvestigationController;
use App\Http\Controllers\Api\PlannerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

    // Homepage Feed
    Route::get('/home/trending', [\App\Http\Controllers\Api\HomeController::class, 'trending']);

    // Agency Feed — danh sách vụ án public (không lộ solution)
    Route::get('/cases', [CaseController::class, 'index']);

    // Case data (filtered by discovery progress)
    Route::get('/cases/{case_id}', [InvestigationController::class, 'show']);

    // Investigation lifecycle (Public endpoints for now, except accuse)
    Route::post('/investigations/{case_id}/start',  [InvestigationController::class, 'start']);
    Route::post('/investigations/{case_id}/unlock', [InvestigationController::class, 'unlock']);

    // Creator / Publisher
    Route::post('/cases/{case_id}/publish', [\App\Http\Controllers\Api\CreatorController::class, 'publish']);

    // Case Reveal — full truth after solve/fail
    Route::get('/cases/{case_id}/reveal', [InvestigationController::class, 'reveal']);

    // Auth-only endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/cases/{case_id}/accuse', [InvestigationController::class, 'accuse']);
        Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
    });

    // Leaderboard
    Route::get('/leaderboard', [\App\Http\Controllers\Api\LeaderboardController::class, 'index']);
    Route::get('/daily-dossier', [\App\Http\Controllers\Api\DailyDossierController::class, 'show']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);

    // Post-mortem comments
    Route::get('/cases/{case_id}/comments', [\App\Http\Controllers\Api\CaseCommentController::class, 'index']);
    Route::post('/cases/{case_id}/comments', [\App\Http\Controllers\Api\CaseCommentController::class, 'store']);

    // ────────────────────────────────────────────────────────────────
    // CRIMINAL PLANNER — Blueprint Room
    // ────────────────────────────────────────────────────────────────
    Route::post('/planner',                          [PlannerController::class, 'create']);
    Route::get('/planner/{uuid}',                    [PlannerController::class, 'show']);
    Route::patch('/planner/{uuid}/save',             [PlannerController::class, 'save']);
    Route::post('/planner/{uuid}/suspects',          [PlannerController::class, 'addSuspect']);
    Route::post('/planner/{uuid}/clues',             [PlannerController::class, 'addClue']);
    Route::post('/planner/{uuid}/statements',        [PlannerController::class, 'addStatement']);
    Route::post('/planner/{uuid}/contradictions',    [PlannerController::class, 'addContradiction']);
    Route::post('/planner/{uuid}/validate',          [PlannerController::class, 'validate']);
    Route::post('/planner/{uuid}/self-solve',        [PlannerController::class, 'selfSolve']);
    Route::post('/planner/{uuid}/publish',           [PlannerController::class, 'publish']);
});
