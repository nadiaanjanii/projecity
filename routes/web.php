<?php

use App\Http\Controllers\ProposalController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Projecity Management Hub
|--------------------------------------------------------------------------
*/

// Halaman Utama / Dashboard (Otomatis Redirect ke Dashboard Controller)
Route::get('/', [ProposalController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Semua fitur yang butuh login
Route::middleware('auth')->group(function () {

    // --- FITUR PROPOSAL ---
    // Simpan Proposal Baru
    Route::post('/upload', [ProposalController::class, 'store'])->name('proposal.store');

    // Edit & Update Dokumen
    Route::get('/proposal/edit/{id}', [ProposalController::class, 'edit'])->name('proposal.edit');
    Route::put('/proposal/update/{id}', [ProposalController::class, 'update'])->name('proposal.update');

    // Verifikasi & Revisi (Manager)
    Route::post('/verify/{id}', [ProposalController::class, 'toggleCheck'])->name('proposal.verify');

    // Download File PDF
    Route::get('/download/{id}', [ProposalController::class, 'download'])->name('proposal.download');

    // Hapus Proposal
    Route::delete('/delete/{id}', [ProposalController::class, 'destroy'])->name('proposal.destroy');

    // Halaman Arsip (Verified)
    Route::get('/archive', [ProposalController::class, 'archive'])->name('proposal.archive');

    // --- FITUR MANAJEMEN STAFF (BARU) ---
    // Route untuk Manager mengubah posisi divisi staff
    Route::patch('/user/{id}/position', [ProposalController::class, 'updatePosition'])->name('user.update.position');

    // --- FITUR PROFILE (Breeze) ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
