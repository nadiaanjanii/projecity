<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalVersion extends Model
{
    use HasFactory;

    // FITUR: Riwayat versi / revisi proposal
    protected $fillable = [
        'proposal_id',
        'file_path',
        'version_number',
        'created_by',
        'notes',
    ];

    protected $appends = ['file_url'];

    // RELASI: Many-to-One ke Proposal (proposal induk)
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    // Link URL download file versi
    public function getFileUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    // RELASI: Many-to-One ke User (pengunggah revisi/versi)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
