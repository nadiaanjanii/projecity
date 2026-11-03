<x-app-layout>
    <main id="main-content" class="container mx-auto px-6 py-10 flex-grow transition-opacity duration-300">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {{-- ========= SIDEBAR KIRI ========= --}}
            <div class="lg:col-span-4">
                @if(Auth::user()->role == 'staff')
                {{-- Staff: Info Card --}}
                <div class="gradient-bg rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200 sticky top-28 fade-in mb-6">
                    <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <i class="fas fa-archive text-xl"></i>
                    </div>
                    <h2 class="text-xl font-bold mb-2 tracking-tight">Arsip Divisi</h2>
                    <p class="text-emerald-50 text-sm leading-relaxed font-medium">
                        Dokumen terverifikasi dari Divisi
                        <span class="font-black">{{ Auth::user()->position }}</span>.
                    </p>
                </div>

                {{-- Quick Stats untuk Staff --}}
                @if(isset($staffStats))
                <div class="glass-card rounded-[2rem] p-5 shadow-sm sticky top-[280px] fade-in">
                    <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 px-1">Ringkasan Divisi</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-emerald-50 rounded-xl p-3 text-center">
                            <p class="text-lg font-black text-emerald-600">{{ $staffStats['archived'] }}</p>
                            <p class="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Arsip</p>
                        </div>
                        <div class="bg-amber-50 rounded-xl p-3 text-center">
                            <p class="text-lg font-black text-amber-600">{{ $staffStats['proposals'] }}</p>
                            <p class="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
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
                                <i class="fas fa-archive text-lg"></i>
                            </div>
                            <div>
                                <h2 class="text-base font-bold tracking-tight leading-tight">Arsip Manager</h2>
                                <p class="text-emerald-100 text-[10px] font-semibold uppercase tracking-widest">Dokumen Verified</p>
                            </div>
                        </div>
                        <p class="text-emerald-50 text-xs leading-relaxed font-medium opacity-80">Pilih divisi untuk melihat arsip.</p>
                    </div>

                    {{-- Division List Card --}}
                    <div class="glass-card rounded-[2rem] p-5 shadow-sm">
                        <div class="flex items-center justify-between mb-4 px-1">
                            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Daftar Divisi</h3>
                            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{{ $divisions->count() }} Divisi</span>
                        </div>

                        <div class="space-y-1.5">
                            {{-- Semua Divisi (Show All) --}}
                            <a href="{{ route('proposal.archive') }}"
                               class="division-nav-item flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                      {{ !$activeDivision ? 'bg-emerald-50 border border-emerald-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent' }}">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                {{ !$activeDivision ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-500' }}">
                                        <i class="fas fa-layer-group text-xs"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold {{ !$activeDivision ? 'text-emerald-700' : 'text-gray-700' }}">Semua Divisi</p>
                                        <p class="text-[9px] text-gray-400 font-medium">Tampilkan semua arsip</p>
                                    </div>
                                </div>
                                <span class="text-[10px] font-black {{ !$activeDivision ? 'text-emerald-600' : 'text-gray-300' }}">
                                    {{ $divisionStats->sum(function($s) { return $s['archived']; }) }}
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
                            <a href="{{ route('proposal.archive', ['division' => $div]) }}"
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
                                            <i class="fas fa-file-circle-check text-[8px] mr-0.5"></i> {{ $stats['archived'] }} Arsip
                                        </p>
                                    </div>
                                </div>
                                @if($stats['archived'] > 0)
                                <span class="min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-[10px] font-black text-white {{ $color[0] }} shadow-sm">
                                    {{ $stats['archived'] }}
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
                        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 px-1">Ringkasan Arsip</h3>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-emerald-50 rounded-xl p-3 text-center">
                                <p class="text-lg font-black text-emerald-600">{{ $divisionStats->sum(function($s) { return $s['archived']; }) }}</p>
                                <p class="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Total Arsip</p>
                            </div>
                            <div class="bg-amber-50 rounded-xl p-3 text-center">
                                <p class="text-lg font-black text-amber-600">{{ $divisionStats->sum(function($s) { return $s['proposals']; }) }}</p>
                                <p class="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>
                @endif
            </div>

            {{-- ========= KONTEN KANAN ========= --}}
            <div class="lg:col-span-8">
                <div class="flex justify-between items-end mb-8 fade-in">
                    <div>
                        <h2 class="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                            Proposal Archive
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
                        <p class="text-sm text-gray-400">Daftar dokumen yang telah diverifikasi oleh Manager.</p>
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
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Dokumen & Klien</th>
                                        <th class="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50">
                                    @foreach($proposals as $p)
                                    <tr class="archive-row bg-white/40">
                                        <td class="px-8 py-6">
                                            <div class="flex items-center space-x-4">
                                                <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm">
                                                    <i class="fas fa-file-archive text-xl"></i>
                                                </div>
                                                <div>
                                                    <p class="font-bold text-gray-800 leading-tight search-target">{{ $p->title }}</p>
                                                    <p class="text-[11px] text-gray-400 font-bold uppercase mt-0.5 search-target">
                                                        {{ $p->client_name }} <span class="text-emerald-500 mx-1">&bull;</span> Divisi {{ $p->division }} <span class="text-emerald-500 mx-1">&bull;</span> {{ $p->created_at->format('d M Y') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-8 py-6 text-center">
                                            <span class="badge-verified">
                                                <i class="fas fa-check-double mr-2"></i> Verified
                                            </span>
                                        </td>
                                        <td class="px-8 py-6">
                                            <div class="flex justify-end space-x-2">
                                                <a href="{{ asset('storage/' . $p->file_path) }}" target="_blank"
                                                class="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition shadow-sm active:scale-90" title="Lihat">
                                                    <i class="fas fa-eye text-xs"></i>
                                                </a>
                                                <a href="{{ route('proposal.download', $p->id) }}"
                                                class="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm active:scale-90" title="Download">
                                                    <i class="fas fa-download text-xs"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                @empty
                    <div class="glass-card rounded-[2rem] overflow-hidden fade-in shadow-sm">
                        <div class="px-8 py-32 text-center opacity-20">
                            <i class="fas fa-box-open text-6xl mb-4 block"></i>
                            <p class="font-bold text-gray-500 uppercase tracking-widest">Belum ada arsip proposal</p>
                        </div>
                    </div>
                @endforelse
                </div>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            if(searchInput) {
                searchInput.addEventListener('keyup', function() {
                    let filter = this.value.toLowerCase();
                    document.querySelectorAll('.archive-row').forEach(row => {
                        let targets = row.querySelectorAll('.search-target');
                        let match = Array.from(targets).some(t => t.innerText.toLowerCase().includes(filter));
                        row.style.display = match ? "" : "none";
                    });
                });
            }
        });
    </script>
</x-app-layout>
