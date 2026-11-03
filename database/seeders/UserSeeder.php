<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Membuat Akun Manager
        $manager = User::updateOrCreate(
            ['email' => 'manager@projecity.com'],
            [
                'name' => 'Manager Utama',
                'password' => Hash::make('manager123'),
                'role' => 'manager',
                'position' => 'Manajer Operasional',
                'status' => 'active',
            ]
        );
        $manager->assignRole('manager');

        // 2. Membuat Akun Super Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@projecity.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'role' => 'superadmin',
                'position' => 'Administrator Sistem',
                'status' => 'active',
            ]
        );
        $admin->assignRole('superadmin');
    }
}
