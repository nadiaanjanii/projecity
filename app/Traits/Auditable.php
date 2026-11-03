<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public function logAction($action, $targetType, $targetId = null, $details = [])
    {
        $log = AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'details' => $details,
        ]);

        \App\Events\AuditLogCreated::dispatch($log);

        return $log;
    }
}
