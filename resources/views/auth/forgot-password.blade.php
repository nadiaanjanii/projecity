<x-guest-layout>
    <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-900">Lupa Password?</h2>
        <p class="mt-2 text-sm text-gray-500 leading-relaxed">
            Jangan khawatir! Masukkan alamat email Anda dan kami akan mengirimkan tautan pemulihan. Atau jika Anda belum memiliki akses, silakan hubungi Manager.
        </p>
    </div>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('password.email') }}">
        @csrf

        <div>
            <x-input-label for="email" :value="__('Email Perusahaan / Kampus')" />
            <x-text-input id="email" class="block mt-1 w-full bg-gray-50 border-gray-200 focus:ring-indigo-500 rounded-xl" type="email" name="email" :value="old('email')" required autofocus />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div class="flex flex-col space-y-4 mt-8">
            <x-primary-button class="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl">
                {{ __('Kirim Link Pemulihan') }}
            </x-primary-button>

            <div class="flex items-center justify-between mt-4">
                <a class="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition" href="{{ route('login') }}">
                    <i class="fas fa-arrow-left mr-1"></i> Kembali Login
                </a>

                <a class="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition" href="{{ route('register') }}">
                    Daftar Akun Baru <i class="fas fa-user-plus ml-1"></i>
                </a>
            </div>
        </div>
    </form>
</x-guest-layout>
