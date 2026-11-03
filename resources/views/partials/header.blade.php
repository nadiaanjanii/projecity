<header class="bg-[#1c0c16]/95 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 flex justify-between items-center">

        <a href="{{ route('dashboard') }}" class="logo-container group">
            <div class="logo-icon-box group-hover:scale-105 transition-transform">
                <i class="fas fa-layer-group text-white text-xl"></i>
            </div>

            <div class="flex flex-col">
                <span class="logo-text">
                    PROJE<span class="logo-text-highlight">CITY</span>
                </span>
                <span class="logo-slogan">
                    Management Hub
                </span>
            </div>
        </a>

        <nav class="hidden md:flex space-x-2 bg-[#140810] p-1.5 rounded-2xl border border-primary/20">

            <a href="{{ route('dashboard') }}"
               class="px-5 py-2.5 flex items-center text-sm font-bold rounded-xl transition-all duration-200 transform {{ request()->routeIs('dashboard') && !request()->has('filter') ? 'bg-[#800020] text-white shadow-sm scale-105' : 'text-rose-200/70 hover:text-white hover:bg-primary/20' }}">
                <i class="fas fa-th-large mr-2.5 text-xs {{ request()->routeIs('dashboard') && !request()->has('filter') ? 'animate-bounce' : '' }}"></i>
                Dashboard
            </a>

            <a href="{{ route('dashboard') }}?filter=revision"
               class="px-5 py-2.5 flex items-center text-sm font-bold rounded-xl transition-all duration-200 transform {{ request()->get('filter') == 'revision' ? 'bg-[#800020] text-amber-300 shadow-sm scale-105' : 'text-rose-200/70 hover:text-amber-300 hover:bg-primary/20' }}">
                <i class="fas fa-comment-dots mr-2.5 text-xs {{ request()->get('filter') == 'revision' ? 'animate-pulse' : '' }}"></i>
                Revision
            </a>

            <a href="{{ route('proposal.archive') }}"
               class="px-5 py-2.5 flex items-center text-sm font-bold rounded-xl transition-all duration-200 transform {{ request()->routeIs('proposal.archive') ? 'bg-[#800020] text-white shadow-sm scale-105' : 'text-rose-200/70 hover:text-white hover:bg-primary/20' }}">
                <i class="fas fa-archive mr-2.5 text-xs {{ request()->routeIs('proposal.archive') ? 'rotate-12' : '' }}"></i>
                Archive
            </a>
        </nav>

        <div class="flex items-center space-x-4">
            <div class="text-right hidden sm:block border-r border-primary/20 pr-4">
                <p class="font-bold text-[#f3e8ee] leading-tight">{{ Auth::user()->name }}</p>
                <p class="text-[10px] text-rose-300 font-bold uppercase tracking-widest mt-0.5 flex items-center justify-end">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                    {{ Auth::user()->role }}
                    @if(Auth::user()->role == 'staff' && Auth::user()->position)
                        <span class="text-rose-300/40 mx-1.5">&bull;</span> DIVISI {{ Auth::user()->position }}
                    @endif
                </p>
            </div>

            <div class="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#800020] text-white font-black text-lg shadow-inner ring-2 ring-primary/30 group cursor-pointer hover:ring-rose-400 transition-all">
                {{ strtoupper(substr(Auth::user()->name, 0, 2)) }}
            </div>

            <div class="flex items-center">
                <form id="logout-form" method="POST" action="{{ route('logout') }}" class="hidden">
                    @csrf
                </form>

                <button type="button"
                        onclick="confirmLogout()"
                        class="w-10 h-10 flex items-center justify-center rounded-xl bg-[#140810] text-rose-300/70 hover:bg-rose-600 hover:text-white transition border border-primary/20 group"
                        title="Logout">
                    <i class="fas fa-power-off text-base group-active:scale-90 transition-transform"></i>
                </button>
            </div>
        </div>
    </div>
</header>
