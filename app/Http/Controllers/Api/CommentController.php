<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    // FITUR: Ambil semua komentar di suatu proposal
    public function index($proposalId)
    {
        $comments = Comment::with('user')
            ->where('proposal_id', $proposalId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'comments' => $comments
        ]);
    }

    // FITUR: Kirim komentar / diskusi baru
    public function store(Request $request)
    {
        $request->validate([
            'proposal_id' => 'required|exists:proposals,id',
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'proposal_id' => $request->proposal_id,
            'content' => $request->content,
        ]);

        $proposal = Proposal::with('user')->findOrFail($request->proposal_id);
        $sender = Auth::user();
        $shortContent = Str::limit($request->content, 45);

        // Kirim notifikasi ke pemilik proposal (jika bukan pengirim sendiri)
        if ($proposal->user_id && $proposal->user_id !== Auth::id()) {
            Notification::create([
                'user_id' => $proposal->user_id,
                'proposal_id' => $proposal->id,
                'message' => "💬 Diskusi Baru dari {$sender->name} di proposal '{$proposal->title}': \"{$shortContent}\"",
                'type' => 'info',
                'is_read' => false
            ]);
        }

        // Kirim notifikasi ke Manager & Superadmin
        $recipients = User::role(['manager', 'superadmin'])
            ->where('id', '!=', Auth::id())
            ->get();

        foreach ($recipients as $recipient) {
            Notification::create([
                'user_id' => $recipient->id,
                'proposal_id' => $proposal->id,
                'message' => "💬 Diskusi Baru dari {$sender->name} di proposal '{$proposal->title}': \"{$shortContent}\"",
                'type' => 'info',
                'is_read' => false
            ]);
        }

        return response()->json([
            'message' => 'Komentar berhasil dikirim',
            'comment' => $comment->load('user')
        ], 201);
    }

    // FITUR: Hapus komentar
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);

        $currentUser = Auth::user();
        $isAuthor = $comment->user_id === $currentUser->id;
        $isManager = $currentUser->role === 'manager' || $currentUser->hasRole('manager');
        $isSuperAdmin = $currentUser->hasRole('superadmin');
        $hasPermission = $currentUser->hasPermissionTo('kelola komentar');

        // Hanya pembuat komentar, manager, superadmin, atau pemegang izin yang boleh hapus
        if (!$isAuthor && !$isManager && !$isSuperAdmin && !$hasPermission) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus']);
    }
}
