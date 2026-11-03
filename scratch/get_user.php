<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('name', 'like', '%sunghoon%')->first();
if ($user) {
    echo json_encode($user) . "\n";
} else {
    echo "User not found\n";
}
