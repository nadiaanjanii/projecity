<x-guest-layout>
    <div class="mb-8 fade-in">
        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Selamat Datang Kembali</h2>
        <p class="text-sm text-gray-400 font-medium mt-1">Silakan masuk untuk mengelola proposal Anda.</p>
    </div>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="fade-in">
        @csrf

        <div class="space-y-1">
            <x-input-label for="email" :value="__('Email Address')" class="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 mb-2" />
            <x-text-input id="email"
                class="custom-input block mt-1 w-full bg-gray-50/50 border-gray-100 rounded-2xl py-3.5 px-5 shadow-sm"
                type="email"
                name="email"
                :value="old('email')"
                required autofocus
                autocomplete="username"
                placeholder="nama@email.com" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div class="mt-5 space-y-1">
            <x-input-label for="password" :value="__('Password')" class="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 mb-2" />
            <x-text-input id="password"
                class="custom-input block mt-1 w-full bg-gray-50/50 border-gray-100 rounded-2xl py-3.5 px-5 shadow-sm"
                type="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <div class="flex items-center justify-between mt-6">
            <label for="remember_me" class="inline-flex items-center cursor-pointer group">
                <input id="remember_me" type="checkbox"
                    class="rounded-lg border-gray-200 text-emerald-600 shadow-sm focus:ring-emerald-500 w-5 h-5 transition cursor-pointer"
                    name="remember">
                <span class="ms-3 text-sm font-bold text-gray-400 group-hover:text-emerald-600 transition">{{ __('Ingat saya') }}</span>
            </label>
        </div>

        <div class="flex flex-col space-y-4 mt-8 pt-6 border-t border-gray-50">
            <button type="submit" class="w-full gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition transform active:scale-95 flex items-center justify-center border-none uppercase tracking-widest text-sm">
                MASUK SEKARANG <i class="fas fa-sign-in-alt ml-2"></i>
            </button>

            <a class="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-[0.2em] transition duration-300 text-center" href="{{ route('register') }}">
                Belum punya akun? <span class="underline text-emerald-600 ml-1">Daftar Akun Baru</span>
            </a>
        </div>
    </form>
</x-guest-layout>
