<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('admin.logs', function ($user) {
    return $user->hasRole('superadmin') || $user->hasRole('manager');
});
