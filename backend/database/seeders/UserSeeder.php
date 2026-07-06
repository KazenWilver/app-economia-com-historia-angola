<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@jindungo.ao'],
            [
                'name' => 'Administrador Jindungo',
                'password' => 'password',
                'role' => 'admin',
                'phone' => null,
                'avatar_url' => null,
                'email_verified_at' => now(),
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'utilizador1@jindungo.ao'],
            [
                'name' => 'Maria Santos',
                'password' => 'password',
                'role' => 'user',
                'phone' => '+244900000001',
                'avatar_url' => null,
                'email_verified_at' => now(),
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'utilizador2@jindungo.ao'],
            [
                'name' => 'João Manuel',
                'password' => 'password',
                'role' => 'user',
                'phone' => '+244900000002',
                'avatar_url' => null,
                'email_verified_at' => now(),
            ]
        );
    }
}
