<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Memanggil seeder Spatie & Divisi terlebih dahulu sebelum UserSeeder
        $this->call([
            PermissionSeeder::class,
            DivisionSeeder::class,
            UserSeeder::class,
        ]);

        // Kode bawaan Test User di bawah ini bisa kamu hapus atau biarkan
        // jika ingin punya akun tambahan untuk testing.
        /*
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        */
    }
}
