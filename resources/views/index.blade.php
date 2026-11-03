<x-app-layout>
    <main id="main-content" class="container mx-auto px-6 py-10 flex-grow transition-opacity duration-300">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div class="lg:col-span-4">
                @if(Auth::user()->role == 'staff')
                <div class="glass-card rounded-[2rem] p-8 sticky top-28 fade-in">
                    <h2 class="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                        Upload Proposal
                        @if(Auth::user()->position)
                            <span class="block text-[11px] text-emerald-600 tracking-widest mt-1">DIVISI {{ Auth::user()->position }}</span>
                        @endif
                    </h2>
                    <p class="text-gray-400 text-sm mb-8">Arsipkan dokumen baru ke sistem terstruktur.</p>

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

                {{-- Quick Stats untuk Staff --}}
                @if(isset($staffStats))
                <div class="glass-card rounded-[2rem] p-5 shadow-sm sticky top-[480px] fade-in mt-6">
                    <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 px-1">Ringkasan Divisi</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-amber-50 rounded-xl p-3 text-center">
                            <p class="text-lg font-black text-amber-600">{{ $staffStats['proposals'] }}</p>
                            <p class="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
                        </div>
                        <div class="bg-emerald-50 rounded-xl p-3 text-center">
                            <p class="text-lg font-black text-emerald-600">{{ $staffStats['archived'] }}</p>
                            <p class="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Arsip</p>
                        </div>
                        <div class="bg-blue-50 rounded-xl p-3 text-center col-span-2">
                            <p class="text-lg font-black text-blue-600">{{ $staffStats['total'] }}</p>
                            <p class="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Total Dokumen</p>
                        </div>
                    </div>
                </div>
                @endif
                @else
                {{-- === SIDEBAR DIVISI MANAGER === --}}
                <div class="sticky top-28 fade-in space-y-5">
                    {{-- Header Card --}}
                    <div class="gradient-bg rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-200">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                                <i class="fas fa-shield-halved text-lg"></i>
                            </div>
                            <div>
                                <h2 class="text-base font-bold tracking-tight leading-tight">Mode Manager</h2>
                                <p class="text-emerald-100 text-[10px] font-semibold uppercase tracking-widest">Panel Kontrol</p>
                            </div>
                        </div>
                        <p class="text-emerald-50 text-xs leading-relaxed font-medium opacity-80">Pilih divisi untuk memfilter proposal.</p>
                    </div>

                    {{-- Division List Card --}}
                    <div class="glass-card rounded-[2rem] p-5 shadow-sm">
                        <div class="flex items-center justify-between mb-4 px-1">
                            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Daftar Divisi</h3>
                            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{{ $divisions->count() }} Divisi</span>
                        </div>

                        <div class="space-y-1.5">
                            {{-- Semua Divisi (Show All) --}}
                            <a href="{{ route('dashboard') }}"
                               class="division-nav-item flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                      {{ !$activeDivision ? 'bg-emerald-50 border border-emerald-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent' }}">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                {{ !$activeDivision ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-500' }}">
                                        <i class="fas fa-layer-group text-xs"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold {{ !$activeDivision ? 'text-emerald-700' : 'text-gray-700' }}">Semua Divisi</p>
                                        <p class="text-[9px] text-gray-400 font-medium">Tampilkan semua proposal</p>
                                    </div>
                                </div>
                                <span class="text-[10px] font-black {{ !$activeDivision ? 'text-emerald-600' : 'text-gray-300' }}">
                                    {{ $divisionStats->sum(function($s) { return $s['proposals']; }) }}
                                </span>
                            </a>

                            {{-- Divisi Items --}}
                            @foreach($divisions as $div)
                            @php
                                $stats = $divisionStats[$div] ?? ['proposals' => 0, 'staff' => 0, 'archived' => 0];
                                $isActive = $activeDivision === $div;
                                $colors = [
                                    ['bg-violet-500', 'bg-violet-50', 'text-violet-600', 'border-violet-200', 'bg-violet-100'],
                                    ['bg-blue-500', 'bg-blue-50', 'text-blue-600', 'border-blue-200', 'bg-blue-100'],
                                    ['bg-rose-500', 'bg-rose-50', 'text-rose-600', 'border-rose-200', 'bg-rose-100'],
                                    ['bg-amber-500', 'bg-amber-50', 'text-amber-600', 'border-amber-200', 'bg-amber-100'],
                                    ['bg-teal-500', 'bg-teal-50', 'text-teal-600', 'border-teal-200', 'bg-teal-100'],
                                    ['bg-pink-500', 'bg-pink-50', 'text-pink-600', 'border-pink-200', 'bg-pink-100'],
                                    ['bg-cyan-500', 'bg-cyan-50', 'text-cyan-600', 'border-cyan-200', 'bg-cyan-100'],
                                    ['bg-orange-500', 'bg-orange-50', 'text-orange-600', 'border-orange-200', 'bg-orange-100'],
                                ];
                                $color = $colors[$loop->index % count($colors)];
                                $icons = ['fa-palette', 'fa-code', 'fa-bullhorn', 'fa-chart-line', 'fa-pen-nib', 'fa-camera', 'fa-headset', 'fa-cogs'];
                                $icon = $icons[$loop->index % count($icons)];
                            @endphp
                            <a href="{{ route('dashboard', ['division' => $div]) }}"
                               class="division-nav-item flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                      {{ $isActive ? $color[1] . ' border ' . $color[3] . ' shadow-sm' : 'hover:bg-gray-50 border border-transparent' }}">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                {{ $isActive ? $color[0] . ' text-white' : 'bg-gray-100 text-gray-400 group-hover:' . $color[4] . ' group-hover:' . $color[2] }}">
                                        <i class="fas {{ $icon }} text-xs"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold {{ $isActive ? $color[2] : 'text-gray-700' }}">{{ $div }}</p>
                                        <p class="text-[9px] text-gray-400 font-medium">
                                            <i class="fas fa-users text-[8px] mr-0.5"></i> {{ $stats['staff'] }} Staff
                                            <span class="mx-1 text-gray-200">•</span>
                                            <i class="fas fa-check-circle text-[8px] mr-0.5"></i> {{ $stats['archived'] }} Selesai
                                        </p>
                                    </div>
                                </div>
                                @if($stats['proposals'] > 0)
                                <span class="min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-[10px] font-black text-white {{ $color[0] }} shadow-sm">
                                    {{ $stats['proposals'] }}
                                </span>
                                @else
                                <span class="text-[10px] font-bold text-gray-300">0</span>
                                @endif
                            </a>
                            @endforeach
                        </div>

                        @if($divisions->isEmpty())
                        <div class="text-center py-8 opacity-40">
                            <i class="fas fa-building text-3xl mb-3 block text-gray-300"></i>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Belum ada divisi</p>
                            <p class="text-[9px] text-gray-400 mt-1">Staff perlu mendaftar terlebih dahulu</p>
                        </div>
                        @endif
                    </div>

                    {{-- Quick Stats --}}
                    <div class="glass-card rounded-[2rem] p-5 shadow-sm">
                        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 px-1">Ringkasan</h3>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-amber-50 rounded-xl p-3 text-center">
                                <p class="text-lg font-black text-amber-600">{{ $divisionStats->sum(function($s) { return $s['proposals']; }) }}</p>
                                <p class="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-3 text-center">
                                <p class="text-lg font-black text-emerald-600">{{ $divisionStats->sum(function($s) { return $s['archived']; }) }}</p>
                                <p class="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Selesai</p>
                            </div>
                            <div class="bg-blue-50 rounded-xl p-3 text-center">
                                <p class="text-lg font-black text-blue-600">{{ $divisions->count() }}</p>
                                <p class="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Divisi</p>
                            </div>
                            <div class="bg-violet-50 rounded-xl p-3 text-center">
                                <p class="text-lg font-black text-violet-600">{{ $users->count() }}</p>
                                <p class="text-[9px] font-bold text-violet-500 uppercase tracking-wider">Staff</p>
                            </div>
                        </div>
                    </div>
                </div>
                @endif
            </div>

            <div class="lg:col-span-8">
                <div class="flex justify-between items-end mb-8 fade-in">
                    <div>
                        <h2 class="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                            Proposal Terkini
                            @if(Auth::user()->role == 'staff' && Auth::user()->position)
                                <span class="text-[14px] text-emerald-600 ml-2 align-middle px-3 py-1 bg-emerald-50 rounded-lg tracking-widest font-bold">DIVISI {{ Auth::user()->position }}</span>
                            @elseif(Auth::user()->role == 'manager')
                                @if($activeDivision)
                                    <span class="text-[14px] text-emerald-600 ml-2 align-middle px-3 py-1 bg-emerald-50 rounded-lg tracking-widest font-bold">DIVISI {{ $activeDivision }}</span>
                                @else
                                    <span class="text-[14px] text-emerald-600 ml-2 align-middle px-3 py-1 bg-emerald-50 rounded-lg tracking-widest font-bold">SEMUA DIVISI</span>
                                @endif
                            @endif
                        </h2>
                        <p class="text-sm text-gray-400">Kelola dokumen dalam antrean sistem.</p>
                    </div>

                    <div class="relative group">
                        <input type="text" id="searchInput" class="custom-input bg-white border-none pl-11 pr-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm w-64 focus:ring-4 focus:ring-emerald-50" placeholder="Cari proyek atau klien...">
                        <i class="fas fa-search absolute left-4 top-3.5 text-gray-300 group-focus-within:text-emerald-500 transition"></i>
                    </div>
                </div>

                <div class="space-y-8">
                    @forelse($groupedProposals as $division => $proposals)
                        <div class="w-full fade-in">
                        @if(Auth::user()->role == 'manager')
                        <div class="mb-4 flex items-center">
                            <div class="w-2 h-6 bg-emerald-500 rounded-full mr-3"></div>
                            <h3 class="text-lg font-black text-gray-800 uppercase tracking-widest">DIVISI {{ $division ?: 'TANPA DIVISI' }}</h3>
                            <span class="ml-3 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold">{{ $proposals->count() }} Dokumen</span>
                        </div>
                        @endif

                        <div class="glass-card rounded-[2rem] overflow-hidden fade-in shadow-sm">
                            <table class="w-full">
                                <thead class="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Dokumen & Klien</th>
                                        <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan Revisi</th>
                                        <th class="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50">
                                    @foreach($proposals as $p)
                                    <tr class="proposal-row bg-white/40">
                                        <td class="px-8 py-6">
                                            <div class="flex items-center space-x-4">
                                                <div class="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-sm transition-transform">
                                                    <i class="fas fa-file-pdf text-xl"></i>
                                                </div>
                                                <div>
                                                    <p class="font-bold text-gray-800 search-target leading-tight">{{ $p->title }}</p>
                                                    <p class="text-[11px] text-gray-400 font-bold uppercase mt-0.5 search-target">
                                                        {{ $p->client_name }} <span class="text-emerald-500 mx-1">&bull;</span> Divisi {{ $p->division }}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-8 py-6">
                                            @if($p->notes)
                                            <div class="p-2.5 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl max-w-[200px]">
                                                <p class="text-[10px] text-amber-700 font-medium italic">"{{ $p->notes }}"</p>
                                            </div>
                                            @else
                                            <span class="text-[10px] text-gray-300 italic">Tidak ada catatan</span>
                                            @endif
                                        </td>
                                        <td class="px-8 py-6 text-center">
                                            <span class="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                Waiting
                                            </span>
                                        </td>
                                        <td class="px-8 py-6">
                                            <div class="flex justify-end items-center space-x-2">
                                                <a href="{{ asset('storage/' . $p->file_path) }}" target="_blank" class="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition shadow-sm active:scale-90" title="Lihat"><i class="fas fa-eye text-xs"></i></a>
                                                <a href="{{ route('proposal.download', $p->id) }}" class="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm active:scale-90" title="Unduh"><i class="fas fa-download text-xs"></i></a>

                                                @if(Auth::user()->role == 'staff')
                                                <a href="{{ route('proposal.edit', $p->id) }}" class="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition shadow-sm active:scale-90" title="Edit"><i class="fas fa-edit text-xs"></i></a>
                                                @endif

                                                @if(Auth::user()->role == 'manager')
                                                <form action="{{ route('proposal.verify', $p->id) }}" method="POST" class="flex items-center space-x-1">
                                                    @csrf
                                                    <input type="text" name="notes" placeholder="Revisi..." class="custom-input text-[10px] px-3 py-2 rounded-xl w-20 bg-gray-50/50">
                                                    <button type="submit" name="action" value="revise" class="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition shadow-sm active:scale-90"><i class="fas fa-comment-medical text-xs"></i></button>
                                                    <button type="submit" name="action" value="verify" class="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm active:scale-90"><i class="fas fa-check text-xs"></i></button>
                                                </form>
                                                @endif

                                                <button type="button" onclick="confirmDelete('{{ $p->id }}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm active:scale-90"><i class="fas fa-trash-alt text-xs"></i></button>
                                                <form id="delete-form-{{ $p->id }}" action="{{ route('proposal.destroy', $p->id) }}" method="POST" class="hidden">
                                                    @csrf @method('DELETE')
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                @empty
                    <div class="col-span-full glass-card rounded-[2rem] overflow-hidden fade-in shadow-sm">
                        <div class="px-8 py-32 text-center opacity-20">
                            <i class="fas fa-folder-open text-6xl mb-4 block"></i>
                            <p class="font-bold text-gray-500 uppercase tracking-widest">Belum ada proposal masuk</p>
                        </div>
                    </div>
                @endforelse
                </div>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Live Search
            const searchInput = document.getElementById('searchInput');
            if(searchInput) {
                searchInput.addEventListener('keyup', function() {
                    const filter = this.value.toLowerCase();
                    document.querySelectorAll('.proposal-row').forEach(row => {
                        const targets = row.querySelectorAll('.search-target');
                        const match = Array.from(targets).some(t => t.innerText.toLowerCase().includes(filter));
                        row.style.display = match ? "" : "none";
                    });
                });
            }
        });

        function confirmDelete(id) {
            Swal.fire({
                title: 'Hapus Proposal?',
                text: "Data akan hilang permanen.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal',
                reverseButtons: true,
                customClass: { popup: 'rounded-[2rem]' }
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('delete-form-' + id).submit();
                }
            });
        }
    </script>
</x-app-layout>
