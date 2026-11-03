<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'proposal_id',
        'content',
    ];

    protected static function booted()
    {
        static::created(function ($comment) {
            \App\Events\CommentCreated::dispatch($comment);
        });
    }

    
    // RELASI: Many-to-One ke User (penulis komentar)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // RELASI: Many-to-One ke Proposal (proposal yang dikomentari)
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
