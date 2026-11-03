<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // FITUR: Ambil daftar notifikasi user
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->latest()
            ->take(15)
            ->get();
            
        return response()->json(['notifications' => $notifications]);
    }

    // FITUR: Tandai satu notifikasi sudah dibaca
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Marked as read']);
    }

    // FITUR: Tandai semua notifikasi sudah dibaca
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);
            
        return response()->json(['message' => 'All marked as read']);
    }
}
