<x-app-layout>
    <main id="main-content" class="container mx-auto px-6 py-10 flex-grow transition-opacity duration-300">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div class="lg:col-span-4">
                @if(Auth::user()->role == 'staff')
                    <div class="glass-card p-8 sticky-sidebar fade-in">
                        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-2 text-emerald-600">Upload Proposal</h2>
                        <p class="text-gray-400 text-sm mb-8">Arsipkan dokumen baru ke sistem divisi <strong>{{ Auth::user()->position }}</strong>.</p>

                        <form action="{{ route('proposal.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                            @csrf
                            <div>
                                <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Judul Proyek</label>
                                <input type="text" name="title" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50" placeholder="e.g. Website E-Commerce" required>
                            </div>
                            <div>
                                <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Nama Klien</label>
                                <input type="text" name="client_name" class="custom-input w-full px-5 py-3.5 rounded-2xl bg-gray-50/50" placeholder="e.g. PT. Global Tech" required>
                            </div>
                            <div>
                                <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Pilih Dokumen (PDF)</label>
                                <input type="file" name="file" class="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 cursor-pointer transition-all" required accept=".pdf">
                            </div>
                            <button type="submit" class="w-full gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition transform active:scale-95 flex items-center justify-center border-none">
                                <i class="fas fa-plus-circle mr-2"></i> Arsipkan Sekarang
                            </button>
                        </form>
                    </div>
                @else
                    <div class="glass-card manager-sidebar p-8 sticky-sidebar fade-in">
                        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-2 text-emerald-600">Manajemen Staff</h2>
                        <p class="text-gray-400 text-sm mb-8">Atur divisi kerja tim Projecity.</p>

                        <div class="space-y-6">
                            @foreach($users as $staff)
                            <div class="staff-item">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="font-bold text-gray-800 text-sm">{{ $staff->name }}</p>
                                    <span class="badge-position">{{ $staff->position }}</span>
                                </div>
                                <form action="{{ route('user.update.position', $staff->id) }}" method="POST" class="mt-2 flex gap-2">
                                    @csrf @method('PATCH')
                                    <select name="position" class="select-division">
                                        <option value="General" {{ $staff->position == 'General' ? 'selected' : '' }}>General</option>
                                        <option value="Staff Desain" {{ $staff->position == 'Staff Desain' ? 'selected' : '' }}>Staff Desain</option>
                                        <option value="Staff Software" {{ $staff->position == 'Staff Software' ? 'selected' : '' }}>Staff Software</option>
                                        <option value="Creative" {{ $staff->position == 'Creative' ? 'selected' : '' }}>Creative</option>
                                    </select>
                                    <button type="submit" class="btn-save-position" title="Simpan Perubahan">
                                        <i class="fas fa-save text-xs"></i>
                                    </button>
                                </form>
                            </div>
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>

            <div class="lg:col-span-8">
                <div class="flex justify-between items-end mb-8 fade-in">
                    <div>
                        <h2 class="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                            {{ Auth::user()->role == 'manager' ? 'Semua Proposal' : 'Proposal Divisi ' . Auth::user()->position }}
                        </h2>
                        <p class="text-sm text-gray-400">Daftar dokumen dalam antrean sistem.</p>
                    </div>

                    <div class="relative group">
                        <input type="text" id="searchInput" class="custom-input bg-white border-none pl-11 pr-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm w-64 focus:ring-4 focus:ring-emerald-50" placeholder="Cari proyek atau klien...">
                        <i class="fas fa-search absolute left-4 top-3.5 text-gray-300 group-focus-within:text-emerald-500 transition"></i>
                    </div>
                </div>

                <div class="glass-card rounded-[2rem] overflow-hidden fade-in">
                    </div>
            </div>

        </div>
    </main>
</x-app-layout>
