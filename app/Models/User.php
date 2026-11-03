<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    // FITUR: Data akun pengguna
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'position',
        'status',
        'avatar',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url', 'all_permissions', 'role_names', 'is_online', 'last_login_formatted'];

    // Link URL avatar foto profil
    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    // Daftar semua hak akses yang dimiliki user
    public function getAllPermissionsAttribute()
    {
        return $this->getAllPermissions()->pluck('name');
    }

    // Daftar role yang dimiliki user
    public function getRoleNamesAttribute()
    {
        return $this->getRoleNames();
    }

    // Status online user (aktif dalam 5 menit terakhir)
    public function getIsOnlineAttribute()
    {
        if (!$this->updated_at) return false;
        return $this->updated_at->gt(now()->subMinutes(5));
    }

    // Format jam login terakhir
    public function getLastLoginFormattedAttribute()
    {
        if (!$this->last_login_at) return null;
        return $this->last_login_at->format('H.i') . ' WIB';
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }



    // RELASI: One-to-Many ke Proposal (user punya banyak proposal)
    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }

    // RELASI: One-to-Many ke Notification (user punya banyak notifikasi)
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // RELASI: One-to-Many ke Comment (user punya banyak komentar)
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // RELASI: One-to-Many ke AuditLog (user punya banyak log aktivitas)
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    // RELASI: Many-to-Many ke Role & Permission
    // Menggunakan trait HasRoles (Spatie), method bawaan: $user->roles() & $user->permissions()
    // Tabel Pivot: 'model_has_roles' & 'model_has_permissions'
}
