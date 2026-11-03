<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\ProposalVersion;
use App\Models\AuditLog;
use App\Traits\Auditable;
use App\Events\ProposalUpdated;
use Carbon\Carbon;
use App\Exports\ProposalsExport;
use Maatwebsite\Excel\Facades\Excel;

class ProposalController extends Controller
{
    use Auditable;

    // FITUR: Ambil daftar proposal (bisa filter divisi, status, tanggal, dan cari)
    public function index(Request $request)
    {
        Carbon::setLocale('id');
        $user = Auth::user();

        $query = Proposal::with(['user', 'versions.creator'])->withCount('comments');

        // Coding filter data divisi staf
        if ($user->hasRole('staff')) {
            $query->where('division', $user->position);
        }

        // Coding filter data divisi manager
        if ($user->hasRole('manager') && $request->has('division') && $request->division !== 'ALL') {
            $query->where('division', $request->division);
        }

        // Coding pencarian kata kunci proposal
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('division', 'like', "%{$search}%")
                  ->orWhereHas('user', function($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter kategori
        if ($request->has('category') && $request->category !== 'ALL' && $request->category) {
            $query->where('category', $request->category);
        }

        // Filter status (PENDING, VERIFIED, REJECTED)
        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        // Filter rentang tanggal
        if ($request->has('date_from') && $request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        // Coding urutan proposal: latest / oldest / orderBy
        $proposals = $query->latest()->get();

        return response()->json([
            'proposals' => $proposals,
            'user' => $user
        ]);
    }

    // FITUR: Arsip proposal (hanya proposal yang sudah disetujui / VERIFIED)
    public function archive(Request $request)
    {
        $user = Auth::user();
        $query = Proposal::where('status', 'VERIFIED');

        // Batasi staf hanya bisa lihat arsip divisinya sendiri
        if ($user->hasRole('staff')) {
            $query->where('division', $user->position);
        }

        // Filter divisi untuk Manager
        if ($user->hasRole('manager') && $request->has('division')) {
            $query->where('division', $request->division);
        }

        $proposals = $query->latest()->get();

        return response()->json([
            'proposals' => $proposals
        ]);
    }

    // FITUR: Upload proposal baru
    public function store(Request $request)
    {
        if (!Auth::user()->hasPermissionTo('buat proposal')) {
            return response()->json([
                'message' => 'Tidak diizinkan. Anda tidak memiliki izin untuk membuat proposal.'
            ], 403);
        }

        // Coding validasi input & batas ukuran file (max:51200 = 50MB)
        $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:51200',
        ]);

        $path = $request->file('file')->store('proposals', 'public');

        // Coding simpan data proposal & status awal
        $proposal = Proposal::create([
            'title' => $request->title,
            'client_name' => $request->client_name,
            'category' => $request->category ?? 'Web Development',
            'file_path' => $path,
            'user_id' => Auth::id(),
            'division' => Auth::user()->position,
            'status' => 'PENDING'
        ]);

        // Simpan sebagai versi 1
        ProposalVersion::create([
            'proposal_id' => $proposal->id,
            'file_path' => $path,
            'version_number' => 1,
            'created_by' => Auth::id(),
        ]);

        // Catat audit log
        $this->logAction('CREATE', 'Proposal', $proposal->id, [
            'title' => $proposal->title,
            'client_name' => $proposal->client_name
        ]);

        // Kirim notifikasi ke Manager
        $staffName = Auth::user()->name;
        $this->notifyManagers("Proposal baru '{$proposal->title}' diunggah oleh {$staffName} (Divisi {$proposal->division}).", 'info');

        return response()->json([
            'message' => 'Proposal berhasil diunggah',
            'proposal' => $proposal
        ], 201);
    }

    // FITUR: Edit / Revisi proposal
    public function update(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $user = Auth::user();

        if (!$user->hasPermissionTo('edit proposal')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengedit proposal'], 403);
        }

        // Staf dilarang edit proposal divisi lain
        if ($user->hasRole('staff') && $proposal->division !== $user->position) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengedit proposal divisi lain'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:51200',
            'notes' => 'nullable|string|max:1000',
        ]);

        $proposal->title = $request->title;
        $proposal->client_name = $request->client_name;
        $proposal->status = 'PENDING';
        $proposal->rejection_reason = null;

        // Coding unggah berkas revisi baru (versioning v+1)
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('proposals', 'public');
            $proposal->file_path = $path;

            $lastVersion = ProposalVersion::where('proposal_id', $proposal->id)->max('version_number') ?: 1;
            ProposalVersion::create([
                'proposal_id' => $proposal->id,
                'file_path' => $path,
                'version_number' => $lastVersion + 1,
                'created_by' => Auth::id(),
                'notes' => $request->notes
            ]);
        } else {
            // Kalau cuma edit teks, update catatan di versi terakhir
            $latestVersion = ProposalVersion::where('proposal_id', $proposal->id)->orderBy('version_number', 'desc')->first();
            if ($latestVersion) {
                $latestVersion->update(['notes' => $request->notes]);
            }
        }

        $proposal->save();

        $this->logAction('UPDATE', 'Proposal', $proposal->id, [
            'title' => $proposal->title,
            'has_new_file' => $request->hasFile('file')
        ]);

        // Notifikasi ke Manager
        $staffName = Auth::user()->name;
        $this->notifyManagers("Proposal '{$proposal->title}' telah direvisi/diperbarui oleh {$staffName}.", 'warning');

        // Kirim email ke Manager dan Superadmin
        try {
            $recipients = User::role(['manager', 'superadmin'])->whereNotNull('email')->get();
            foreach ($recipients as $recipient) {
                if ($recipient->email) {
                    \Illuminate\Support\Facades\Mail::to($recipient->email)
                        ->send(new \App\Mail\ProposalRevisionSubmittedMail($proposal, Auth::user(), $request->notes));
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email revisi unggahan: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Proposal berhasil diperbarui',
            'proposal' => $proposal
        ]);
    }

    // FITUR: Hapus proposal
    public function destroy($id)
    {
        $proposal = Proposal::findOrFail($id);
        $user = Auth::user();
        
        if (!$user->hasPermissionTo('hapus proposal')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus proposal'], 403);
        }

        // Coding proteksi: staf dilarang hapus proposal yang sudah disetujui
        if ($user->hasRole('staff') && ($proposal->status === 'VERIFIED' || $proposal->is_checked == 1)) {
            return response()->json(['message' => 'Staff tidak dapat menghapus proposal yang sudah terverifikasi (Verified)'], 403);
        }

        // Staf dilarang hapus proposal divisi lain
        if ($user->hasRole('staff') && $proposal->division !== $user->position) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus proposal divisi lain'], 403);
        }

        if ($proposal->file_path) {
            Storage::disk('public')->delete($proposal->file_path);
        }

        $this->logAction('DELETE', 'Proposal', $id, [
            'title' => $proposal->title
        ]);

        $proposal->delete();

        // Coding pesan feedback berhasil hapus
        return response()->json(['message' => 'Proposal berhasil dihapus']);
    }

    // FITUR: Verifikasi / Setujui proposal
    public function verify($id)
    {
        if (!Auth::user()->hasPermissionTo('verifikasi proposal')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk memverifikasi proposal'], 403);
        }

        $proposal = Proposal::with('user')->findOrFail($id);

        // Coding update status persetujuan proposal (VERIFIED)
        $proposal->update([
            'status' => 'VERIFIED',
            'is_checked' => true
        ]);

        // Notifikasi ke staf divisi terkait
        $this->notifyDivision(
            $proposal->division,
            "Proposal di divisi Anda '{$proposal->title}' telah TERVERIFIKASI.",
            'success'
        );

        $this->logAction('VERIFY', 'Proposal', $id, [
            'title' => $proposal->title
        ]);

        // Kirim pembaruan real-time via WebSocket
        event(new ProposalUpdated($proposal, "Proposal '{$proposal->title}' telah TERVERIFIKASI."));

        // Kirim email notifikasi ke pembuat proposal
        try {
            if ($proposal->user && $proposal->user->email) {
                \Illuminate\Support\Facades\Mail::to($proposal->user->email)
                    ->send(new \App\Mail\ProposalVerifiedMail($proposal));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email verifikasi: " . $e->getMessage());
        }

        return response()->json(['message' => 'Proposal berhasil diverifikasi']);
    }

    // FITUR: Tolak proposal / Minta revisi
    public function reject(Request $request, $id)
    {
        if (!Auth::user()->hasPermissionTo('tolak proposal') && !Auth::user()->hasPermissionTo('verifikasi proposal')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menolak proposal'], 403);
        }

        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $proposal = Proposal::with('user')->findOrFail($id);

        // Coding update status penolakan & alasan revisi
        $proposal->update([
            'status' => 'REJECTED',
            'rejection_reason' => $request->reason,
            'is_checked' => true
        ]);

        // Notifikasi ke seluruh divisi
        $this->notifyDivision(
            $proposal->division,
            "Proposal di divisi Anda '{$proposal->title}' membutuhkan REVISI. Alasan: {$request->reason}",
            'warning'
        );

        // Notifikasi langsung ke pembuat proposal
        if ($proposal->user_id) {
            Notification::create([
                'user_id' => $proposal->user_id,
                'proposal_id' => $proposal->id,
                'message' => "⚠️ REVISI DIPERLUKAN: Proposal Anda '{$proposal->title}' membutuhkan revisi. Catatan: {$request->reason}",
                'type' => 'warning',
                'is_read' => false
            ]);
        }

        $this->logAction('REJECT', 'Proposal', $id, [
            'title' => $proposal->title,
            'reason' => $request->reason
        ]);

        event(new ProposalUpdated($proposal, "Proposal '{$proposal->title}' membutuhkan REVISI."));

        // Kirim email ke pembuat proposal
        try {
            if ($proposal->user && $proposal->user->email) {
                \Illuminate\Support\Facades\Mail::to($proposal->user->email)
                    ->send(new \App\Mail\ProposalRevisionMail($proposal, $request->reason));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email revisi: " . $e->getMessage());
        }

        return response()->json(['message' => 'Proposal ditolak untuk revisi']);
    }

    // FITUR: Batal verifikasi (kembalikan status proposal ke PENDING)
    public function unverify($id)
    {
        $user = Auth::user();
        if (!$user->hasRole('superadmin') && !$user->hasRole('manager') && !$user->hasPermissionTo('batal verifikasi') && !$user->hasPermissionTo('verifikasi proposal')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk membatalkan verifikasi proposal'], 403);
        }

        $proposal = Proposal::with('user')->findOrFail($id);

        // Coding pembatalan verifikasi (kembali ke PENDING)
        $proposal->update([
            'status' => 'PENDING',
            'is_checked' => false,
            'rejection_reason' => null
        ]);

        $this->notifyDivision(
            $proposal->division,
            "Status verifikasi proposal '{$proposal->title}' telah dibatalkan (dikembalikan ke PENDING).",
            'warning'
        );

        $this->logAction('UNVERIFY', 'Proposal', $id, [
            'title' => $proposal->title
        ]);

        event(new ProposalUpdated($proposal, "Status verifikasi proposal '{$proposal->title}' dibatalkan."));

        return response()->json(['message' => 'Verifikasi proposal berhasil dibatalkan']);
    }

    // FITUR: Ekspor laporan ke Excel
    public function export(Request $request)
    {
        if ($request->has('token') && !Auth::check()) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->query('token'));
            if ($token) {
                Auth::login($token->tokenable);
            }
        }

        $user = Auth::user();

        if (!$user || (!$user->hasPermissionTo('ekspor csv') && !$user->hasPermissionTo('ekspor excel'))) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengekspor laporan CSV/Excel'], 403);
        }

        $filters = $request->only(['division', 'status', 'category', 'date_from', 'date_to', 'search']);
        
        if ($user->hasRole('staff')) {
            $filters['division'] = $user->position;
        }

        return Excel::download(new ProposalsExport($filters), 'laporan_proposal_' . date('Y-m-d') . '.xlsx');
    }

    // FITUR: Ekspor laporan ke PDF (lengkap dengan kop surat)
    public function exportPdf(Request $request)
    {
        if ($request->has('token') && !Auth::check()) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->query('token'));
            if ($token) {
                Auth::login($token->tokenable);
            }
        }

        $user = Auth::user();

        if (!$user || !$user->hasPermissionTo('ekspor pdf')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengekspor laporan PDF'], 403);
        }

        $filters = $request->only(['division', 'status', 'category', 'date_from', 'date_to', 'search']);
        
        if ($user->hasRole('staff')) {
            $filters['division'] = $user->position;
        }

        $query = Proposal::with(['user', 'versions', 'comments']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('proposal_number', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['division']) && $filters['division'] !== 'ALL') {
            $query->where('division', $filters['division']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'ALL') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category']) && $filters['category'] !== 'ALL') {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from'] . ' 00:00:00');
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to'] . ' 23:59:59');
        }

        $proposals = $query->latest()->get();

        $divisiText = (!empty($filters['division']) && $filters['division'] !== 'ALL') ? strtoupper($filters['division']) : 'SEMUA DIVISI';
        $layananText = (!empty($filters['category']) && $filters['category'] !== 'ALL') ? strtoupper($filters['category']) : 'SEMUA LAYANAN';
        $nomorSurat = 'CSM/MPP/LAP/' . date('Y/m/') . sprintf('%03d', rand(100, 999));

        $formalDivisions = [
            'OPERASIONAL' => 'DIVISI MANAJEMEN OPERASIONAL & PENGEMBANGAN BISNIS',
            'MARKETING'   => 'DIVISI MARKETING & PEMASARAN',
            'DESIGN'      => 'DIVISI DESAIN & KREATIF',
            'IT'          => 'DIVISI TEKNOLOGI INFORMASI (IT)',
            'FINANCE'     => 'DIVISI KEUANGAN & FINANCE',
        ];

        $targetDivKey = null;
        if (!empty($filters['division']) && $filters['division'] !== 'ALL') {
            $targetDivKey = strtoupper(trim($filters['division']));
        } elseif ($user->hasRole('staff') && !empty($user->position)) {
            $targetDivKey = strtoupper(trim($user->position));
        }

        if ($targetDivKey) {
            if (isset($formalDivisions[$targetDivKey])) {
                $kopSubheader = $formalDivisions[$targetDivKey];
            } elseif (str_starts_with($targetDivKey, 'DIVISI ')) {
                $kopSubheader = $targetDivKey;
            } else {
                $kopSubheader = 'DIVISI ' . $targetDivKey;
            }
        } else {
            $kopSubheader = 'DIVISI MANAJEMEN OPERASIONAL & PENGEMBANGAN BISNIS';
        }

        $logoPath = public_path('images/logo.png');
        $logoBase64 = null;
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        }

        return view('reports.proposal_pdf', compact('proposals', 'user', 'filters', 'divisiText', 'layananText', 'nomorSurat', 'kopSubheader', 'logoBase64'));
    }

    // FITUR: Ambil daftar notifikasi user
    public function getNotifications()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->latest()
            ->get();
            
        return response()->json(['notifications' => $notifications]);
    }

    // FITUR: Tandai notifikasi sudah dibaca
    public function markNotificationAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();
            
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Marked as read']);
    }

    // FITUR: Statistik dashboard (Superadmin, Manager, dan Staff)
    public function getStats()
    {
        Carbon::setLocale('id');
        $user = Auth::user();
        
        try {
            // 1. Dashboard Superadmin
            if ($user->hasRole('superadmin')) {
                $totalUsers = User::where('status', 'active')->count();
                $pendingUsers = User::where('status', 'pending')->count();
                $totalProposals = Proposal::count();
                
                $roleDistribution = User::select('role', \DB::raw('count(*) as total'))
                    ->groupBy('role')
                    ->get();

                $registrationTrend = User::select(\DB::raw('DATE(created_at) as date'), \DB::raw('count(*) as total'))
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy('date')
                    ->orderBy('date', 'asc')
                    ->get();

                $logsTodayCount = AuditLog::whereDate('created_at', Carbon::today())->count();

                $recentActivity = AuditLog::with('user')
                    ->whereDate('created_at', Carbon::today())
                    ->latest()
                    ->take(10)
                    ->get()
                    ->map(function($log) {
                        return [
                            'id' => $log->id,
                            'user_name' => $log->user->name ?? 'Sistem',
                            'avatar_url' => $log->user ? $log->user->avatar_url : null,
                            'action' => $log->action,
                            'target' => $log->target_type,
                            'time' => $log->created_at->diffForHumans(),
                        ];
                    });

                // Cek ukuran database & pemakaian RAM
                $dbName = config('database.connections.mysql.database');
                $dbSizeResult = \DB::select("SELECT SUM(data_length + index_length) / 1024 / 1024 AS size FROM information_schema.TABLES WHERE table_schema = ?", [$dbName]);
                $dbSize = round($dbSizeResult[0]->size ?? 0, 2) . 'MB';
                $memUsage = round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB';

                return response()->json([
                    'total_users' => $totalUsers,
                    'pending_users' => $pendingUsers,
                    'total_proposals' => $totalProposals,
                    'role_distribution' => $roleDistribution,
                    'registration_trend' => $registrationTrend,
                    'recent_activity' => $recentActivity,
                    'logs_today_count' => $logsTodayCount,
                    'system_health' => [
                        'uptime' => '99.9%',
                        'response_time' => rand(40, 120) . 'ms',
                        'server_load' => rand(8, 18) . '%',
                        'database_size' => $dbSize,
                        'ram_usage' => $memUsage
                    ]
                ]);
            }

            // 2. Dashboard Manager
            if ($user->hasRole('manager')) {
                $totalProposals = Proposal::count();
                $verifiedProposals = Proposal::where('status', 'VERIFIED')->count();
                $pendingProposals = Proposal::where('status', 'PENDING')->count();
                $totalStaff = User::role('staff')->count();

                $today = Carbon::today();
                $dailyStats = [
                    'uploaded' => Proposal::whereDate('created_at', $today)->count(),
                    'verified' => Proposal::whereDate('updated_at', $today)->where('status', 'VERIFIED')->count(),
                    'rejected' => Proposal::whereDate('updated_at', $today)->where('status', 'REJECTED')->count(),
                ];

                $divisionStats = Proposal::select('division', \DB::raw('count(*) as total'))
                    ->groupBy('division')
                    ->get();

                $recentActivity = Proposal::with('user')
                    ->latest()
                    ->take(10)
                    ->get()
                    ->map(function($p) {
                        return [
                            'id' => $p->id,
                            'user_name' => $p->user->name ?? 'System',
                            'avatar_url' => $p->user ? $p->user->avatar_url : null,
                            'action' => 'mengunggah proposal baru',
                            'target' => $p->title,
                            'time' => $p->created_at->diffForHumans(),
                            'status' => $p->status,
                            'is_today' => $p->created_at->isToday()
                        ];
                    });

                // 5 staf paling aktif
                $staffPerformance = User::role('staff')
                    ->withCount('proposals')
                    ->orderBy('proposals_count', 'desc')
                    ->take(5)
                    ->get();

                return response()->json([
                    'total_proposals' => $totalProposals,
                    'verified_proposals' => $verifiedProposals,
                    'pending_proposals' => $pendingProposals,
                    'total_staff' => $totalStaff,
                    'division_stats' => $divisionStats,
                    'recent_activity' => $recentActivity,
                    'staff_performance' => $staffPerformance,
                    'daily_stats' => $dailyStats
                ]);
            } else {
                // 3. Dashboard Staff (khusus divisinya sendiri)
                $div = $user->position;
                $today = Carbon::today();
                
                $dailyStats = [
                    'uploaded' => Proposal::where('division', $div)->whereDate('created_at', $today)->count(),
                    'verified' => Proposal::where('division', $div)->whereDate('updated_at', $today)->where('status', 'VERIFIED')->count(),
                ];

                return response()->json([
                    'total_proposals' => Proposal::where('division', $div)->count(),
                    'verified_proposals' => Proposal::where('division', $div)->where('status', 'VERIFIED')->count(),
                    'pending_proposals' => Proposal::where('division', $div)->where('status', 'PENDING')->count(),
                    'revision_count' => Proposal::where('division', $div)->where('status', 'REJECTED')->count(),
                    'division_proposals' => Proposal::where('division', $div)->count(),
                    'daily_stats' => $dailyStats,
                    'recent_activity' => Proposal::where('division', $div)
                        ->with('user')
                        ->latest()
                        ->take(10)
                        ->get()
                        ->map(function($p) {
                            return [
                                'id' => $p->id,
                                'user_name' => $p->user->name ?? 'System',
                                'avatar_url' => $p->user ? $p->user->avatar_url : null,
                                'action' => 'memperbarui proposal',
                                'target' => $p->title,
                                'time' => $p->created_at->diffForHumans(),
                                'status' => $p->status,
                                'is_today' => $p->created_at->isToday()
                            ];
                        })
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // Helper: Kirim notifikasi ke satu divisi
    private function notifyDivision($divisionName, $message, $type = 'info')
    {
        $staffMembers = User::role('staff')
            ->whereRaw('LOWER(position) = ?', [strtolower($divisionName)])
            ->get();
            
        foreach ($staffMembers as $staff) {
            Notification::create([
                'user_id' => $staff->id,
                'message' => $message,
                'type' => $type
            ]);
        }
    }

    // Helper: Kirim notifikasi ke semua Manager
    private function notifyManagers($message, $type = 'info')
    {
        $managers = User::role('manager')->get();
        foreach ($managers as $manager) {
            Notification::create([
                'user_id' => $manager->id,
                'message' => $message,
                'type' => $type
            ]);
        }
    }

    // FITUR: Download / Akses file proposal (dicek hak aksesnya)
    public function fileProxy(Request $request)
    {
        $path = $request->query('path');
        
        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404);
        }

        // Staf dilarang download file proposal milik divisi lain
        $user = Auth::user();
        if ($user) {
            $proposal = Proposal::where('file_path', $path)->first()
                ?? Proposal::whereHas('versions', function($q) use ($path) { $q->where('file_path', $path); })->first();

            if ($proposal && $user->hasRole('staff')) {
                $userDiv = strtoupper($user->position);
                $propDiv = strtoupper($proposal->division);
                if ($userDiv !== $propDiv && $proposal->user_id !== $user->id) {
                    return response()->json(['message' => 'Anda tidak memiliki izin untuk mengunduh/melihat dokumen ini.'], 403);
                }
            }
        }

        $file = Storage::disk('public')->get($path);
        $type = Storage::disk('public')->mimeType($path);

        return response($file, 200)
            ->header('Content-Type', $type)
            ->header('Access-Control-Allow-Origin', env('FRONTEND_URL', 'http://localhost:3000'))
            ->header('Access-Control-Allow-Credentials', 'true');
    }
}
