<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'proposal_id',
        'message',
        'type',
        'is_read',
    ];

    protected static function booted()
    {
        static::created(function ($notification) {
            \App\Events\NotificationCreated::dispatch($notification);
        });
    }


    // RELASI: Many-to-One ke User (penerima notifikasi)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // RELASI: Many-to-One ke Proposal (proposal terkait)
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
