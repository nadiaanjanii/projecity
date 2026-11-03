<x-guest-layout>
    <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900">Edit Proposal</h2>
        <p class="text-sm text-gray-500">Perbaiki kesalahan input atau ganti file dokumen Anda.</p>
    </div>

    <form method="POST" action="{{ route('proposal.update', $proposal->id) }}" enctype="multipart/form-data">
        @csrf
        @method('PUT')

        <div class="space-y-5">
            <div>
                <x-input-label :value="__('Judul Proyek')" class="text-xs font-bold uppercase tracking-widest text-gray-400" />
                <x-text-input name="title" class="block mt-1 w-full bg-gray-50 border-gray-100 rounded-xl" :value="$proposal->title" required />
            </div>

            <div>
                <x-input-label :value="__('Nama Klien')" class="text-xs font-bold uppercase tracking-widest text-gray-400" />
                <x-text-input name="client_name" class="block mt-1 w-full bg-gray-50 border-gray-100 rounded-xl" :value="$proposal->client_name" required />
            </div>

            <div>
                <x-input-label :value="__('Ganti File (Biarkan kosong jika tidak ingin mengganti)')" class="text-xs font-bold uppercase tracking-widest text-gray-400" />
                <input type="file" name="file" class="block mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700">
            </div>
        </div>

        <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-50">
            <a href="{{ route('dashboard') }}" class="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-[0.15em] transition">
                Batal
            </a>
            <x-primary-button class="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 rounded-xl px-8 py-3.5">
                Simpan Perubahan
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
