<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class RoleAssignmentSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        foreach ($users as $user) {
            if ($user->role) {
                $user->syncRoles([$user->role]);
            }
        }
    }
}
