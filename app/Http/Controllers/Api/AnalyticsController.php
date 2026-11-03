<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    // FITUR: Ambil data analitik dan grafik performa
    public function index()
    {
        $user = auth()->user();

        if (!$user->hasPermissionTo('lihat analisis') && !$user->hasPermissionTo('kelola pengguna')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat analisis data'], 403);
        }
        
        // 1. Distribusi status proposal
        $statusLabels = [
            'PENDING' => 'MENUNGGU',
            'VERIFIED' => 'TERVERIFIKASI',
            'REJECTED' => 'REVISI'
        ];

        $statusData = Proposal::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) use ($statusLabels) {
                return [
                    'name' => $statusLabels[$item->status] ?? $item->status,
                    'value' => $item->count
                ];
            });

        // 2. Tren proposal 7 hari terakhir
        $dayLabels = [
            'Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab', 'Thu' => 'Kam', 
            'Fri' => 'Jum', 'Sat' => 'Sab', 'Sun' => 'Min'
        ];

        $trendsData = collect(range(6, 0))->map(function ($daysAgo) use ($dayLabels) {
            $date = Carbon::today()->subDays($daysAgo);
            $count = Proposal::whereDate('created_at', $date)->count();
            $dayEn = $date->format('D');
            return [
                'day' => $dayLabels[$dayEn] ?? $dayEn,
                'count' => $count
            ];
        });

        // 3. Performa proposal per divisi
        $divisionData = Proposal::select('division', DB::raw('count(*) as total'))
            ->whereNotNull('division')
            ->groupBy('division')
            ->get()
            ->map(function ($item) {
                $verified = Proposal::where('division', $item->division)
                    ->where('status', 'VERIFIED')
                    ->count();
                return [
                    'division' => $item->division,
                    'total' => $item->total,
                    'verified' => $verified
                ];
            });

        return response()->json([
            'status_distribution' => $statusData,
            'weekly_trends' => $trendsData,
            'division_performance' => $divisionData
        ]);
    }
}
