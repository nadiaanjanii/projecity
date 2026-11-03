<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withBroadcasting('/api/broadcasting/auth', [])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->validateCsrfTokens(except: [
            'api/login',
            'api/*', // Bypass CSRF for all API routes in dev
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), 'Connection refused') || str_contains($e->getMessage(), '10061')) {
                return response()->json([
                    'message' => 'Sistem tidak dapat terhubung ke Database. Pastikan MySQL di Laragon sudah dalam status "Started" (Aktif).',
                    'error' => 'DATABASE_CONNECTION_REFUSED'
                ], 500);
            }
        });
    })->create();
