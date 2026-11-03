<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Projecity | Management System</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

        <link rel="stylesheet" href="{{ asset('css/style.css') }}?v={{ time() }}">

        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    </head>
    <body class="antialiased bg-[#0f070b] text-[#f3e8ee] page-transition">
        <div class="min-h-screen flex flex-col">

            @include('partials.header')

            @isset($header)
                <header class="bg-[#1c0c16]/80 backdrop-blur-md border-b border-primary/20 fade-in">
                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endisset

            <main class="flex-grow">
                {{ $slot }}
            </main>

            <footer class="bg-[#1c0c16] border-t border-primary/20 py-6 mt-10">
                <div class="container mx-auto px-6 text-center text-rose-300/60 text-[10px] font-black uppercase tracking-[0.2em]">
                    &copy; 2026 <span class="text-rose-400">Projecity</span> Management Hub • {{ Auth::user()->role }} Workspace
                </div>
            </footer>
        </div>

        <script>
            // 1. Notifikasi Sukses Terintegrasi Tema Maroon
            @if(session('success'))
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: "{{ session('success') }}",
                    showConfirmButton: false,
                    timer: 2500,
                    iconColor: '#a31d36',
                    timerProgressBar: true,
                    customClass: { popup: 'rounded-[2rem] glass-card' }
                });
            @endif

            // 2. Notifikasi Error
            @if(session('error'))
                Swal.fire({
                    icon: 'error',
                    title: 'Waduh...',
                    text: "{{ session('error') }}",
                    confirmButtonColor: '#800020',
                    customClass: { popup: 'rounded-[2rem] glass-card' }
                });
            @endif

            // 3. Konfirmasi Logout Personal
            function confirmLogout() {
                Swal.fire({
                    title: 'Yakin ingin keluar?',
                    text: "Sesi Anda akan diakhiri.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#800020',
                    cancelButtonColor: '#190a12',
                    confirmButtonText: 'Ya, Logout!',
                    cancelButtonText: '<span style="color: #b397a5">Batal</span>',
                    reverseButtons: true,
                    customClass: {
                        popup: 'rounded-[2rem] glass-card',
                        title: 'font-black text-[#f3e8ee]',
                        confirmButton: 'rounded-xl font-bold px-6 py-3',
                        cancelButton: 'rounded-xl font-bold px-6 py-3'
                    },
                    showClass: {
                        popup: 'animate__animated animate__fadeInUp animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutDown animate__faster'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Sampai Jumpa!',
                            text: 'Sedang memproses...',
                            showConfirmButton: false,
                            iconColor: '#a31d36',
                            didOpen: () => {
                                Swal.showLoading()
                                document.getElementById('logout-form').submit();
                            }
                        })
                    }
                })
            }

            // 4. Loading Effect Transition
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', function() {
                    document.querySelector('main').style.opacity = '0.5';
                    document.querySelector('main').style.transition = 'opacity 0.3s ease';
                });
            });
        </script>
    </body>
</html>
