<x-guest-layout>
    <div class="mb-8 fade-in">
        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Registrasi Staff</h2>
        <p class="text-sm text-gray-400 font-medium">Buat akun untuk akses sistem manajemen.</p>
    </div>

    <form method="POST" action="{{ route('register') }}" class="space-y-5 fade-in">
        @csrf

        <div>
            <x-input-label for="name" :value="__('Nama Lengkap')" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1" />
            <x-text-input id="name" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border-none shadow-sm transition-all" type="text" name="name" :value="old('name')" required autofocus placeholder="Contoh: Ni Made Nadia" />
            <x-input-error :messages="$errors->get('name')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="email" :value="__('Email Instansi')" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1" />
            <x-text-input id="email" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border-none shadow-sm transition-all" type="email" name="email" :value="old('email')" required placeholder="email@kampus.com" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="position" :value="__('Nama Divisi Kerja')" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1" />
            <x-text-input id="position" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border-none shadow-sm transition-all" type="text" name="position" :value="old('position')" required placeholder="Contoh: IT, Marketing, dll" />
            <x-input-error :messages="$errors->get('position')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="password" :value="__('Password')" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1" />
            <x-text-input id="password" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border-none shadow-sm transition-all" type="password" name="password" required placeholder="••••••••" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="password_confirmation" :value="__('Ulangi Password')" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1" />
            <x-text-input id="password_confirmation" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border-none shadow-sm transition-all" type="password" name="password_confirmation" required placeholder="••••••••" />
            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
        </div>

        <div class="pt-4">
            <button type="submit" class="w-full gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition transform active:scale-95 flex items-center justify-center border-none uppercase tracking-widest text-sm">
                DAFTAR AKUN <i class="fas fa-user-plus ml-2"></i>
            </button>
        </div>

        <div class="text-center pt-2">
            <a class="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition" href="{{ route('login') }}">
                Sudah terdaftar? <span class="underline text-emerald-600">Klik Login</span>
            </a>
        </div>
    </form>
</x-guest-layout>
