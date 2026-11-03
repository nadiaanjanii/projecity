<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Clean up legacy/obsolete export permissions from DB
        Permission::whereIn('name', ['ekspor laporan', 'ekspor excel'])->delete();

        $permissions = [
            // Proposal
            'lihat proposal',
            'buat proposal',
            'edit proposal',
            'hapus proposal',
            'download proposal',
            'verifikasi proposal',
            'tolak proposal',
            'batal verifikasi',
            'ekspor pdf',
            'ekspor csv',
            
            // Divisi
            'lihat divisi',
            'kelola divisi',
            'tambah divisi',
            'edit divisi',
            'hapus divisi',
            
            // Pengguna / Staf
            'kelola pengguna',
            'lihat staf',
            'tambah staf',
            'verifikasi staf',
            'edit staf',
            'ubah divisi staf',
            'hapus staf',
            'atur ulang sandi',
            
            // Sistem
            'kelola hak akses',
            'lihat log audit',
            'lihat analisis',
            'lihat arsip',
            'kelola komentar',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // 🎯 [UJI: SEEDER ROLE SUPERADMIN] Superadmin mendapatkan SELURUH Hak Akses
        $superAdmin = Role::findOrCreate('superadmin', 'web');
        $superAdmin->syncPermissions($permissions);

        // 🎯 [UJI: SEEDER ROLE MANAGER] Hak akses khusus Manager
        $manager = Role::findOrCreate('manager', 'web');
        $manager->syncPermissions([
            'lihat proposal',
            'buat proposal',
            'edit proposal',
            'hapus proposal',
            'download proposal',
            'verifikasi proposal',
            'tolak proposal',
            'batal verifikasi',
            'lihat divisi',
            'lihat staf',
            'tambah staf',
            'verifikasi staf',
            'edit staf',
            'ubah divisi staf',
            'atur ulang sandi',
            'lihat log audit',
            'lihat analisis',
            'lihat arsip',
            'kelola komentar',
            'ekspor pdf',
            'ekspor csv',
        ]);

        // 🎯 [UJI: SEEDER ROLE STAF] Hak akses terbatas untuk Staf
        $staff = Role::findOrCreate('staff', 'web');
        $staff->syncPermissions([
            'lihat proposal',
            'buat proposal',
            'edit proposal',
            'download proposal',
            'ekspor csv',
            'lihat analisis',
            'lihat arsip',
            'kelola komentar',
        ]);
    }
}
