<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    // FITUR: Ambil daftar role publik (untuk form registrasi)
    public function publicRoles()
    {
        $roles = Role::where('name', '!=', 'superadmin')->orderBy('name')->get();
        return response()->json($roles);
    }

    // FITUR: Ambil daftar semua role dan hak akses (permissions)
    public function index()
    {
        $permissions = Permission::all();
        
        // Kelompokkan hak akses ke dalam kategori fitur
        $grouped = $permissions->map(function($p) {
            $name = strtolower($p->name);
            $category = 'SISTEM';
            
            if (str_contains($name, 'proposal') || str_contains($name, 'arsip') || str_contains($name, 'revisi')) {
                $category = 'DOKUMEN & PROPOSAL';
            } elseif (str_contains($name, 'user') || str_contains($name, 'staf') || str_contains($name, 'pengguna') || str_contains($name, 'password')) {
                $category = 'MANAJEMEN PERSONIL';
            } elseif (str_contains($name, 'divisi')) {
                $category = 'STRUKTUR ORGANISASI';
            } elseif (str_contains($name, 'permission') || str_contains($name, 'log') || str_contains($name, 'audit')) {
                $category = 'KEAMANAN & AUDIT';
            }
            
            $p->category = $category;
            return $p;
        });

        return response()->json([
            'roles' => Role::with('permissions')->orderBy('name')->get(),
            'permissions' => $grouped,
        ]);
    }

    // FITUR: Buat role baru (Superadmin)
    public function storeRole(Request $request)
    {
        if (!Auth::user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name'
        ]);

        $role = Role::create(['name' => strtolower($request->name), 'guard_name' => 'web']);

        return response()->json([
            'message' => "Peran baru '{$role->name}' berhasil dibuat",
            'role' => $role->load('permissions')
        ], 201);
    }

    // FITUR: Hapus role (Superadmin)
    public function deleteRole($id)
    {
        if (!Auth::user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $role = Role::findOrFail($id);

        // Role bawaan sistem tidak boleh dihapus
        $protectedRoles = ['superadmin', 'manager', 'staff'];
        if (in_array(strtolower($role->name), $protectedRoles)) {
            return response()->json(['message' => 'Peran bawaan sistem tidak dapat dihapus untuk menjaga integritas.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Peran berhasil dihapus dari sistem']);
    }

    // FITUR: Atur hak akses (permissions) untuk suatu role
    public function updateRolePermissions(Request $request, $roleId)
    {
        if (!Auth::user()->hasRole('superadmin') && !Auth::user()->hasPermissionTo('kelola hak akses')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $role = Role::findOrFail($roleId);
        $role->syncPermissions($request->permissions);

        // Hapus cache Spatie agar perubahan langsung aktif
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json(['message' => 'Hak akses peran berhasil diperbarui', 'role' => $role->load('permissions')]);
    }

    // FITUR: Atur izin langsung ke user (Direct Permissions)
    public function syncUserDirectPermissions(Request $request, $userId)
    {
        if (!Auth::user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);
        $user->syncPermissions($request->permissions);

        return response()->json(['message' => 'Hak akses langsung pengguna berhasil diperbarui']);
    }

    // FITUR: Atur role pengguna (Superadmin)
    public function assignUserRole(Request $request, $userId)
    {
        if (!Auth::user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);
        $user->syncRoles($request->roles);

        if (count($request->roles) > 0) {
            $updateData = ['role' => $request->roles[0]];
            
            if ($request->roles[0] === 'superadmin') {
                $updateData['position'] = 'ADMINISTRATOR SISTEM';
            } elseif ($request->has('position')) {
                $updateData['position'] = $request->position;
            }
            
            $user->update($updateData);
        }

        return response()->json(['message' => 'Peran pengguna berhasil diperbarui', 'user' => $user->fresh()]);
    }

    // FITUR: Ambil hak akses dan role dari user tertentu
    public function getUserPermissions($userId)
    {
        $user = User::findOrFail($userId);

        return response()->json([
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }
}
