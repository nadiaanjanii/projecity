<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Notification;
use App\Models\User;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    use Auditable;

    // FITUR: Login user
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak ditemukan'], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Kata sandi salah untuk email ini'], 422);
        }

        // Coding validasi status akun aktif sebelum login
        if ($user->status !== 'active') {
            $msg = $user->status === 'pending' 
                ? 'Akun Anda sedang menunggu persetujuan Super Admin.' 
                : 'Akun Anda telah dinonaktifkan.';
            return response()->json(['message' => $msg], 403);
        }

        // Jalankan login sesi
        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();
            $user->update(['last_login_at' => now()]);

            $this->logAction('LOGIN', 'USER', $user->id, ['message' => 'Pengguna masuk ke sistem']);

            return response()->json([
                'user' => $user,
                'message' => 'Login berhasil'
            ]);
        }

        return response()->json(['message' => 'Autentikasi gagal'], 422);
    }

    // FITUR: Logout user
    public function logout(Request $request)
    {
        if (Auth::user()) {
            $this->logAction('LOGOUT', 'USER', Auth::id(), ['message' => 'Pengguna keluar dari sistem']);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Berhasil keluar']);
    }

    // FITUR: Ambil data user yang sedang login
    public function user(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->touch();
        }
        return response()->json($user);
    }

    // FITUR: Ambil daftar staff
    public function listStaff()
    {
        $currentUser = Auth::user();

        if (!$currentUser->hasPermissionTo('lihat staf') && !$currentUser->hasPermissionTo('kelola pengguna')) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $query = User::withCount('proposals');

        // Selain superadmin, hanya tampilkan role staff
        if (!$currentUser->hasRole('superadmin')) {
            $query->where('role', 'staff');
        }

        $staff = $query->get();
        return response()->json(['staff' => $staff]);
    }

    // FITUR: Registrasi akun baru (Staff / Manager)
    public function register(Request $request)
    {
        // Coding validasi input registrasi
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'position' => ['required', 'string'],
            'role' => ['nullable', 'string', 'exists:roles,name'],
        ], [
            'email.unique' => 'Email ini sudah terdaftar. Gunakan email lain atau silakan login.',
            'email.email' => 'Format email tidak valid.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'position.required' => 'Divisi/jabatan wajib dipilih.',
        ]);

        // Cegah daftar mandiri sebagai superadmin
        if ($request->role === 'superadmin') {
            return response()->json(['message' => 'Tidak dapat mendaftar sebagai Super Admin.'], 422);
        }

        // Coding role & status default user baru
        $role = $request->role ?? 'staff';
        $status = 'active';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role, 
            'position' => $request->position, 
            'status' => $status,
        ]);

        $user->assignRole($role);

        // Kirim notifikasi akun baru ke Superadmin / Manager
        $superAdmins = User::role('superadmin')->get();
        
        if ($role === 'manager') {
            foreach ($superAdmins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'message' => "Permintaan akun Manajer baru dari: {$user->name} ({$user->email})",
                    'type' => 'user_request',
                    'is_read' => false,
                ]);
            }
        } else {
            $managers = User::role('manager')->get();
            $recipients = $superAdmins->merge($managers)->unique('id');
            
            foreach ($recipients as $recipient) {
                Notification::create([
                    'user_id' => $recipient->id,
                    'message' => "Pendaftaran Staf baru perlu verifikasi: {$user->name} ({$user->email})",
                    'type' => 'user_request',
                    'is_read' => false,
                ]);
            }
        }

        return response()->json([
            'user' => $user,
            'message' => 'Registrasi berhasil! Silakan masuk dengan akun Anda.'
        ], 201);
    }

    // FITUR: Tambah staff atau manager secara manual
    public function addStaff(Request $request)
    {
        $currentUser = Auth::user();

        if (!$currentUser->hasPermissionTo('tambah staf') && !$currentUser->hasPermissionTo('kelola pengguna')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menambahkan anggota tim'], 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'position' => ['nullable', 'string'],
            'role' => ['nullable', 'string', 'in:staff,manager'],
        ]);

        $role = $request->role ?? 'staff';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'position' => $request->position ?? 'Administrator',
            'status' => 'active',
        ]);

        $user->assignRole($role);

        $roleText = $user->role === 'manager' ? 'Manajer' : 'Staff';

        return response()->json([
            'user' => $user,
            'message' => "Anggota $roleText berhasil ditambahkan"
        ], 201);
    }

    // FITUR: Edit profil user oleh Admin
    public function updateUser(Request $request, $id)
    {
        if (!Auth::user()->hasPermissionTo('kelola pengguna') && !Auth::user()->hasPermissionTo('verifikasi staf')) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'status' => 'nullable|string|in:active,pending,suspended,inactive',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        // Manager tidak boleh ubah status sesama manager
        if ($request->has('status')) {
            if (!Auth::user()->hasRole('superadmin') && $user->hasRole('manager')) {
                // Diabaikan jika bukan superadmin
            } else {
                $updateData['status'] = $request->status;
            }
        }

        // Khusus Superadmin bisa ubah role
        if ($request->has('role') && Auth::user()->hasRole('superadmin')) {
            $user->syncRoles([$request->role]);
            $updateData['role'] = $request->role;
            if ($request->role === 'superadmin') {
                $updateData['position'] = 'ADMINISTRATOR SISTEM';
            }
        }

        $user->update($updateData);

        return response()->json(['message' => 'Data user diperbarui', 'user' => $user]);
    }

    // FITUR: Reset password user oleh Admin / Manager
    public function resetPassword(Request $request, $id)
    {
        $currentUser = Auth::user();

        if (!$currentUser->hasPermissionTo('atur ulang sandi')) {
            return response()->json(['message' => 'Hanya pengguna dengan izin reset password yang dapat melakukan ini'], 403);
        }

        $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => "Kata sandi untuk {$user->name} berhasil diperbarui"]);
    }

    // FITUR: Update profil saya (nama, email, foto avatar, password)
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'current_password' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        $request->validate($rules);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        // Ganti kata sandi jika diisi
        if ($request->filled('password')) {
            if (!$request->filled('current_password')) {
                return response()->json(['message' => 'Kata sandi saat ini wajib diisi untuk mengubah kata sandi baru'], 422);
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Kata sandi saat ini tidak cocok'], 422);
            }

            $data['password'] = Hash::make($request->password);
        }

        // Upload avatar jika ada file baru
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);
        
        $this->logAction('UPDATE', 'USER', $user->id, [
            'name' => $user->name,
            'updated_fields' => array_keys($data)
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user->fresh()
        ]);
    }

    // FITUR: Hapus staff
    public function deleteStaff($id)
    {
        $currentUser = auth()->user();

        if (!$currentUser->hasPermissionTo('hapus staf')) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $user = User::findOrFail($id);
        
        // Coding proteksi hapus superadmin dan sesama manager
        if ($user->hasRole('superadmin')) {
            return response()->json(['message' => 'Tidak dapat menghapus Super Admin'], 403);
        }

        if ($currentUser->hasRole('manager') && $user->hasRole('manager')) {
            return response()->json(['message' => 'Manajer tidak dapat menghapus sesama Manajer'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Anggota tim berhasil dihapus']);
    }

    // FITUR: Ambil semua data user (khusus Superadmin)
    public function listUsers()
    {
        if (!Auth::user()->hasPermissionTo('kelola pengguna')) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json(['users' => $users]);
    }

    // FITUR: Ubah status akun user (active, pending, suspended, inactive)
    public function updateStatus(Request $request, $id)
    {
        $currentUser = Auth::user();

        if (!$currentUser->hasPermissionTo('verifikasi staf')) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $request->validate([
            'status' => 'required|in:active,pending,suspended,inactive'
        ]);

        $user = User::findOrFail($id);
        
        // Manager hanya boleh ubah status staff
        if ($currentUser->hasRole('manager')) {
            if (!$user->hasRole('staff')) {
                return response()->json(['message' => 'Manajer hanya dapat mengelola status Staff'], 403);
            }
        }

        if ($user->hasRole('superadmin') && $request->status !== 'active') {
            return response()->json(['message' => 'Tidak dapat menonaktifkan Super Admin utama'], 403);
        }

        $user->update(['status' => $request->status]);

        $statusLabel = [
            'active' => 'Aktif',
            'pending' => 'Menunggu',
            'suspended' => 'Ditangguhkan',
            'inactive' => 'Tidak Aktif (Resign)'
        ][$request->status];

        return response()->json([
            'message' => "Status {$user->name} berhasil diperbarui menjadi {$statusLabel}",
            'user' => $user
        ]);
    }

    // FITUR: Ubah divisi / posisi user
    public function updatePosition(Request $request, $id)
    {
        $currentUser = Auth::user();

        if (!$currentUser->hasPermissionTo('ubah divisi staf') && !$currentUser->hasPermissionTo('kelola pengguna')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengubah divisi staf'], 403);
        }

        $request->validate([
            'position' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($id);
        
        // Manager hanya boleh ubah divisi staff
        if ($currentUser->hasRole('manager') && !$currentUser->hasRole('superadmin')) {
            if (!$user->hasRole('staff')) {
                return response()->json(['message' => 'Manajer hanya dapat mengelola divisi Staff'], 403);
            }
        }

        $oldPosition = $user->position;
        $user->update(['position' => $request->position]);

        return response()->json([
            'message' => "Divisi {$user->name} berhasil diperbarui dari {$oldPosition} ke {$request->position}",
            'user' => $user
        ]);
    }
}
