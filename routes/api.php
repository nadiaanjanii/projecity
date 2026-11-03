<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProposalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE PUBLIK (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/
// FITUR: Login & Registrasi
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Data publik untuk dropdown form registrasi
Route::get('/roles/public', [PermissionController::class, 'publicRoles']);
Route::get('/divisions/public', [DivisionController::class, 'index']);

/*
|--------------------------------------------------------------------------
| ROUTE PRIVATE (Wajib login / Auth Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // FITUR: Data user yang login & Profil
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    // FITUR: Proposal (Daftar, Arsip, Upload, Revisi, Hapus, Verifikasi, Ekspor)
    Route::get('/proposals', [ProposalController::class, 'index']);
    Route::get('/archive', [ProposalController::class, 'archive']);
    Route::get('/proposals/file-proxy', [ProposalController::class, 'fileProxy']);
    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::post('/proposals/{id}/update', [ProposalController::class, 'update']);
    Route::delete('/proposals/{id}', [ProposalController::class, 'destroy']);
    Route::post('/proposals/{id}/verify', [ProposalController::class, 'verify']);
    Route::post('/proposals/{id}/reject', [ProposalController::class, 'reject']);
    Route::post('/proposals/{id}/unverify', [ProposalController::class, 'unverify']);
    Route::get('/proposals/export', [ProposalController::class, 'export']);
    Route::get('/proposals/export-pdf', [ProposalController::class, 'exportPdf']);

    // FITUR: Statistik & Analitik Dashboard
    Route::get('/stats', [ProposalController::class, 'getStats']);
    Route::get('/analytics', [AnalyticsController::class, 'index']);

    // FITUR: Manajemen Staf & Pengguna
    Route::get('/staff', [AuthController::class, 'listStaff']);
    Route::post('/staff', [AuthController::class, 'addStaff']);
    Route::delete('/staff/{id}', [AuthController::class, 'deleteStaff']);
    Route::patch('/user/{id}/position', [AuthController::class, 'updatePosition']);
    Route::patch('/user/{id}/update', [AuthController::class, 'updateUser']);
    Route::post('/user/{id}/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/users', [AuthController::class, 'listUsers']);
    Route::patch('/user/{id}/status', [AuthController::class, 'updateStatus']);

    // FITUR: Riwayat Log Aktivitas (Audit Log)
    Route::get('/logs', [AuditLogController::class, 'index']);

    // FITUR: Notifikasi
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // FITUR: Kelola Divisi
    Route::get('/divisions', [DivisionController::class, 'index']);
    Route::post('/divisions', [DivisionController::class, 'store']);
    Route::delete('/divisions/{id}', [DivisionController::class, 'destroy']);

    // FITUR: Kelola Peran & Hak Akses (Spatie RBAC)
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/roles', [PermissionController::class, 'storeRole']);
    Route::delete('/roles/{id}', [PermissionController::class, 'deleteRole']);
    Route::patch('/roles/{id}/permissions', [PermissionController::class, 'updateRolePermissions']);
    Route::post('/users/{id}/roles', [PermissionController::class, 'assignUserRole']);
    Route::post('/users/{id}/permissions', [PermissionController::class, 'syncUserDirectPermissions']);
    Route::get('/users/{id}/permissions', [PermissionController::class, 'getUserPermissions']);

    // FITUR: Komentar & Diskusi Proposal
    Route::get('/proposals/{id}/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
});