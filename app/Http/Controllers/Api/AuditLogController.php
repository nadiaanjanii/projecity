<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    // FITUR: Ambil riwayat aktivitas pengguna (Audit Log)
    public function index()
    {
        if (!Auth::user()->hasPermissionTo('lihat log audit')) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $logs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json(['logs' => $logs]);
    }
}
