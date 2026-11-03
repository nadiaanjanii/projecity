<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    // Coding daftar kolom tabel proposals (fillable)
    protected $fillable = [
        'title', 
        'client_name', 
        'category',
        'file_path', 
        'user_id', 
        'division', 
        'is_checked', 
        'notes',
        'status',
        'rejection_reason'
    ];

    // RELASI: Many-to-One ke User (pembuat proposal)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // RELASI: One-to-Many ke Comment (komentar pada proposal)
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // RELASI: One-to-Many ke ProposalVersion (riwayat revisi file)
    public function versions()
    {
        return $this->hasMany(ProposalVersion::class)->orderBy('version_number', 'desc');
    }
}
