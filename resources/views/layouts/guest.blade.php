<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Projecity | Authentication</title>

    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}?v={{ time() }}">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="antialiased bg-[#F8FAF8] flex items-center justify-center min-h-screen p-6 overflow-x-hidden">

    <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px] -z-10"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px] -z-10"></div>

    <div class="w-full max-w-md">
        <div class="flex flex-col items-center mb-10 fade-in">
            <div class="logo-icon-box mb-4 scale-125 shadow-xl shadow-emerald-200">
                <i class="fas fa-layer-group text-white text-2xl"></i>
            </div>
            <h1 class="logo-text text-3xl">PROJE<span class="logo-text-highlight">CITY</span></h1>
            <p class="logo-slogan mt-2 tracking-[0.3em]">Management Hub</p>
        </div>

        <div class="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 fade-in border border-white/60">
            {{ $slot }}
        </div>

        <div class="text-center mt-10 opacity-30">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900">
                &copy; 2026 Projecity HUB
            </p>
        </div>
    </div>
</body>
</html>
