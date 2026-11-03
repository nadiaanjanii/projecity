'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard, FileText, Archive, Users, LogOut, Bell, Search, Plus, Settings, AlertCircle, Shield, History, Layers, BarChart as BarChartIcon, Fingerprint, Menu, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CreateProposalModal from '@/components/CreateProposalModal';
import ProfileModal from '@/components/ProfileModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import api from '@/lib/api';
import echo from '@/lib/echo';
import { useToast } from '@/context/ToastContext';
import { getTimeZoneLabel } from '@/lib/time';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, setUser } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [revisionCount, setRevisionCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const prevUnreadRef = useRef<number | null>(null);

    // Global Workspace Search States
    const [globalSearch, setGlobalSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleGlobalSearch = (query: string) => {
        setGlobalSearch(query);
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        setIsSearchOpen(true);
        setIsSearching(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                if (user?.role === 'superadmin') {
                    const [usersRes, divisionsRes] = await Promise.all([
                        api.get('/users').catch(() => ({ data: { users: [] } })),
                        api.get('/divisions').catch(() => ({ data: [] }))
                    ]);
                    const queryLower = query.toLowerCase();
                    const rawUsers = usersRes.data.users || [];
                    const rawDivisions = Array.isArray(divisionsRes.data) ? divisionsRes.data : (divisionsRes.data.divisions || []);

                    const matchedUsers = rawUsers
                        .filter((u: any) => 
                            u.name?.toLowerCase().includes(queryLower) || 
                            u.email?.toLowerCase().includes(queryLower) || 
                            u.position?.toLowerCase().includes(queryLower) ||
                            u.role?.toLowerCase().includes(queryLower)
                        )
                        .map((u: any) => ({ ...u, _type: 'user' }));

                    const matchedDivisions = rawDivisions
                        .filter((d: any) => d.name?.toLowerCase().includes(queryLower))
                        .map((d: any) => ({ ...d, _type: 'division' }));

                    setSearchResults([...matchedUsers, ...matchedDivisions]);
                } else {
                    const res = await api.get(`/proposals?search=${encodeURIComponent(query)}`);
                    setSearchResults(res.data.proposals || []);
                }
            } catch (e) {
                console.error('Search error:', e);
            } finally {
                setIsSearching(false);
            }
        }, 150);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (globalSearch.trim()) {
            setIsSearchOpen(false);
            if (user?.role === 'superadmin') {
                router.push(`/dashboard/admin?search=${encodeURIComponent(globalSearch.trim())}`);
            } else {
                router.push(`/dashboard/proposals?search=${encodeURIComponent(globalSearch.trim())}`);
            }
        }
    };
    
    // Live Realtime Clock States
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [sessionStartTime] = useState<Date>(new Date());

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hasPermission = (permission: string) => {
        if (!user) return false;
        return user?.all_permissions?.includes(permission) ?? false;
    };

    const playChimeSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
            gain1.gain.setValueAtTime(0.15, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.3);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.12);
            osc2.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // Ignore audio autoplay restrictions
        }
    };

    const fetchStatsAndNotifications = async () => {
        try {
            const statsRes = await api.get('/stats');
            
            // Set badge count based on role
            if (user?.role === 'staff') {
                setRevisionCount(statsRes.data.revision_count || 0);
            } else if (user?.role === 'manager') {
                setRevisionCount(statsRes.data.pending_proposals || 0);
            } else if (user?.role === 'superadmin') {
                setRevisionCount(statsRes.data.pending_users || 0);
            }
            
            // Fetch notifications for bell badge & audio alert
            const notifRes = await api.get('/notifications');
            const notifs = notifRes.data.notifications || [];
            const unread = notifs.filter((n: any) => !n.is_read).length;
            
            if (prevUnreadRef.current !== null && unread > prevUnreadRef.current) {
                playChimeSound();
                const latest = notifs.find((n: any) => !n.is_read);
                if (latest) {
                    setTimeout(() => {
                        showToast(latest.message, latest.type === 'warning' ? 'error' : 'info');
                    }, 0);
                }
            }
            prevUnreadRef.current = unread;
            setUnreadCount(unread);
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error('Auto-fetch failed:', error);
            }
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchStatsAndNotifications();
            // Poll for notifications every 6 seconds for fast live alerts
            const interval = setInterval(fetchStatsAndNotifications, 6000);

            // Global Real-time Action Listener (for Admin & Manager)
            if (user.role === 'superadmin' || user.role === 'manager') {
                const adminChannel = echo?.private('admin.logs')
                    .listen('.AuditLogCreated', (data: any) => {
                        const log = data.log;
                        const name = log.user?.name || 'Sistem';
                        const action = log.action.toUpperCase();
                        const target = log.target_type.toUpperCase();
                        
                        const translateAction = (a: string) => {
                            const action = a.toUpperCase();
                            if (action === 'CREATE') return 'membuat';
                            if (action === 'UPDATE') return 'memperbarui';
                            if (action === 'VERIFY') return 'memverifikasi';
                            if (action === 'REJECT') return 'menolak';
                            if (action === 'DELETE') return 'menghapus';
                            return action.toLowerCase();
                        };

                        const translateTarget = (t: string) => {
                            const target = t.toUpperCase();
                            if (target === 'PROPOSAL') return 'proposal';
                            if (target === 'USER') return 'pengguna';
                            if (target === 'DIVISION') return 'divisi';
                            return target.toLowerCase();
                        };
                        
                        let message = '';
                        if (action === 'CREATE' && target === 'PROPOSAL') message = `${name} baru saja mengunggah proposal baru`;
                        else if (action === 'UPDATE' && target === 'PROPOSAL') message = `${name} baru saja merevisi proposal`;
                        else if (action === 'VERIFY' && target === 'PROPOSAL') message = `${name} baru saja memverifikasi proposal`;
                        else if (action === 'REJECT' && target === 'PROPOSAL') message = `${name} menolak proposal untuk revisi`;
                        else if (action === 'DELETE' && target === 'PROPOSAL') message = `${name} menghapus sebuah proposal`;
                        else if (action === 'CREATE' && target === 'USER') message = `${name} mendaftarkan anggota baru`;
                        else message = `${name} melakukan aksi ${translateAction(action)} pada ${translateTarget(target)}`;

                        showToast(message, 'live');
                    });

                const userChannel = echo?.private(`user.${user.id}`)
                    .listen('.NotificationCreated', (data: any) => {
                        fetchStatsAndNotifications();
                    });

                return () => {
                    clearInterval(interval);
                    adminChannel?.stopListening('.AuditLogCreated');
                    userChannel?.stopListening('.NotificationCreated');
                };
            }

            const userChannel = echo?.private(`user.${user.id}`)
                .listen('.NotificationCreated', (data: any) => {
                    fetchStatsAndNotifications();
                });

            return () => {
                clearInterval(interval);
                userChannel?.stopListening('.NotificationCreated');
            };
        }
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-12 h-12 bg-primary rounded-2xl shadow-[0_0_30px_rgba(128,0,32,0.6)]"
            />
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static top-0 bottom-0 left-0 w-72 bg-[#0d040a] border-r-2 border-primary/40 shadow-[6px_0_24px_rgba(128,0,32,0.35)] flex flex-col z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="p-8 flex items-center justify-between border-b border-primary/20 bg-[#080206]">
                    <Link href="/dashboard" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#800020] to-[#a31d36] rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-xl">P</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-[#f3e8ee]">
                            Projecity
                        </h2>
                    </Link>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-xl hover:bg-primary/20 text-rose-200 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarItem href="/dashboard" icon={<LayoutDashboard size={22} />} label="Ringkasan" />
                    
                    {hasPermission('lihat proposal') && (
                        <SidebarItem 
                            href="/dashboard/proposals" 
                            icon={<FileText size={22} />} 
                            label="Semua Proposal" 
                            badge={user.role !== 'superadmin' && revisionCount > 0 ? revisionCount : undefined}
                        />
                    )}

                    {hasPermission('lihat analisis') && (
                        <SidebarItem href="/dashboard/analytics" icon={<BarChartIcon size={22} />} label="Analisis Data" />
                    )}

                    {hasPermission('lihat arsip') && (
                        <SidebarItem href="/dashboard/archive" icon={<Archive size={22} />} label="Perpustakaan Arsip" />
                    )}

                    {(hasPermission('lihat staf') || 
                      hasPermission('verifikasi staf') || 
                      hasPermission('tambah staf') || 
                      hasPermission('edit staf') || 
                      hasPermission('hapus staf') || 
                      hasPermission('kelola pengguna')) && (
                        <SidebarItem href="/dashboard/staff" icon={<Users size={22} />} label="Kontrol Personel" />
                    )}

                    {hasPermission('kelola pengguna') && (
                        <SidebarItem 
                            href="/dashboard/admin" 
                            icon={<Shield size={22} />} 
                            label="Manajemen Pengguna" 
                            badge={user.role === 'superadmin' && revisionCount > 0 ? revisionCount : undefined}
                        />
                    )}
                    
                    {(hasPermission('kelola divisi') || 
                      hasPermission('lihat divisi') || 
                      hasPermission('tambah divisi') || 
                      hasPermission('edit divisi') || 
                      hasPermission('hapus divisi')) && (
                        <SidebarItem href="/dashboard/divisions" icon={<Layers size={22} />} label="Manajemen Divisi" />
                    )}

                    {(user.role === 'superadmin' || hasPermission('kelola hak akses')) && (
                        <SidebarItem href="/dashboard/permissions" icon={<Fingerprint size={22} />} label="Hak Akses (Role)" />
                    )}

                    {hasPermission('lihat log audit') && (
                        <SidebarItem href="/dashboard/logs" icon={<History size={22} />} label="Log Aktivitas" />
                    )}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="glass rounded-[2rem] p-4 border border-primary/20 bg-[#1c0c16]/80 group relative hover:border-primary/50 transition-all shadow-lg">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg overflow-hidden text-white shrink-0 bg-gradient-to-br ${
                                user.role === 'superadmin' 
                                    ? 'from-[#4a0013] to-primary shadow-primary/30' 
                                    : user.role === 'manager' 
                                    ? 'from-primary to-[#a31d36] shadow-rose-900/30' 
                                    : 'from-[#4d1927] to-[#800020] shadow-rose-950/30'
                            }`}>
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    (user.name?.[0] || 'U').toUpperCase()
                                )}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-bold truncate text-[#f3e8ee]">{user.name}</p>
                                <p className="text-[10px] uppercase tracking-widest font-black text-rose-200 truncate">
                                    Peran: {user.role === 'superadmin' ? 'Super Admin' : (user.role === 'manager' ? 'Manajer' : 'Staf')}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsProfileModalOpen(true)}
                                className="p-2 hover:bg-primary/20 rounded-xl text-rose-200 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Settings size={16} />
                            </button>
                        </div>
                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded-xl transition-all duration-200 font-bold text-xs"
                        >
                            <LogOut size={16} />
                            <span>KELUAR SISTEM</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#170912] relative">
                {/* Background Decor */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full filter blur-[120px] pointer-events-none"></div>
                
                {/* Header / Navbar */}
                <header className="h-20 sm:h-24 border-b border-primary/30 flex items-center justify-between px-4 sm:px-6 md:px-10 relative z-30 bg-[#11050d]/80 backdrop-blur-md shadow-sm">
                    <div className="flex items-center flex-1 max-w-xl">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 bg-[#1c0c16] border border-primary/20 rounded-2xl text-rose-300 hover:text-white hover:border-primary/40 transition-all mr-3 shadow-sm flex items-center justify-center"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative group flex-1 hidden md:block">
                            <form onSubmit={handleSearchSubmit}>
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-white transition-colors" size={20} />
                                {/* ⚡ [LIVE CODING] PLACEHOLDER SEARCH BAR GLOBAL - ganti teks abu-abu di sini */}
                                <input 
                                    type="text" 
                                    value={globalSearch}
                                    onChange={(e) => handleGlobalSearch(e.target.value)}
                                    onFocus={() => globalSearch.trim() && setIsSearchOpen(true)}
                                    placeholder={user?.role === 'superadmin' ? "Cari pengguna, email, atau divisi (Tekan Enter)..." : "Cari proposal, klien, atau divisi (Tekan Enter)..."}
                                    className="w-full bg-[#190a12] border border-primary/30 rounded-2xl py-3 pl-12 pr-4 text-[#ffffff] placeholder:text-rose-200/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-semibold text-sm"
                                />
                            </form>

                            {/* Instant Live Search Results Popup */}
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSearchOpen(false)} />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute left-0 right-0 mt-3 glass border border-primary/30 rounded-[2rem] shadow-2xl z-50 overflow-hidden bg-[#1c0c16] text-[#f3e8ee]"
                                        >
                                            <div className="p-4 border-b border-primary/20 bg-[#190a12] flex items-center justify-between">
                                                <span className="text-xs font-black uppercase text-rose-300 tracking-wider">
                                                    {user?.role === 'superadmin' ? 'Hasil Pencarian Pengguna & Divisi' : 'Hasil Pencarian Proposal'}
                                                </span>
                                                {isSearching && <span className="text-[10px] text-rose-300 italic font-bold">Mencari...</span>}
                                            </div>

                                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-primary/20">
                                                {searchResults.length === 0 ? (
                                                    <div className="p-8 text-center text-xs font-bold text-rose-100 italic">
                                                        {isSearching ? 'Memindai data...' : (user?.role === 'superadmin' ? 'Tidak ditemukan pengguna atau divisi.' : 'Tidak ditemukan proposal yang sesuai.')}
                                                    </div>
                                                ) : (
                                                    searchResults.slice(0, 5).map((item, idx) => {
                                                        if (item._type === 'user') {
                                                            return (
                                                                <div 
                                                                    key={`user-${item.id}-${idx}`}
                                                                    onClick={() => {
                                                                        setIsSearchOpen(false);
                                                                        router.push(`/dashboard/admin?search=${encodeURIComponent(item.name)}`);
                                                                    }}
                                                                    className="p-4 hover:bg-primary/20 transition-all cursor-pointer flex items-center justify-between group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-rose-300 group-hover:bg-[#800020] group-hover:text-white transition-all">
                                                                            <Users size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-[#f3e8ee] group-hover:text-rose-300 transition-colors">{item.name}</p>
                                                                            <p className="text-[11px] text-rose-300/70 font-semibold">{item.email} • Posisi: {item.position || 'Pengguna'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-primary/30 text-rose-200 border border-primary/40">
                                                                        {item.role || 'User'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }

                                                        if (item._type === 'division') {
                                                            return (
                                                                <div 
                                                                    key={`div-${item.id}-${idx}`}
                                                                    onClick={() => {
                                                                        setIsSearchOpen(false);
                                                                        router.push('/dashboard/divisions');
                                                                    }}
                                                                    className="p-4 hover:bg-primary/20 transition-all cursor-pointer flex items-center justify-between group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-rose-300 group-hover:bg-[#800020] group-hover:text-white transition-all">
                                                                            <Layers size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-[#f3e8ee] group-hover:text-rose-300 transition-colors">Divisi: {item.name}</p>
                                                                            <p className="text-[11px] text-rose-300/70 font-semibold">Struktur Organisasi Projecity</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                                        Divisi
                                                                    </span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div 
                                                                key={`prop-${item.id}-${idx}`}
                                                                onClick={() => {
                                                                    setIsSearchOpen(false);
                                                                    router.push(`/dashboard/proposals?openModal=${item.id}&tab=discussion`);
                                                                }}
                                                                className="p-4 hover:bg-primary/20 transition-all cursor-pointer flex items-center justify-between group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-rose-300 group-hover:bg-[#800020] group-hover:text-white transition-all">
                                                                        <FileText size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-[#f3e8ee] group-hover:text-rose-300 transition-colors">{item.title}</p>
                                                                        <p className="text-[11px] text-rose-300/70 font-semibold">Klien: {item.client_name} • Divisi: {item.division}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-primary/30 text-rose-200 border border-primary/40">
                                                                    {item.category || 'Umum'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {searchResults.length > 5 && (
                                                <div className="p-3 border-t border-primary/20 bg-[#140810] text-center">
                                                    <button 
                                                        onClick={handleSearchSubmit}
                                                        className="text-[10px] font-black text-rose-300 hover:text-white uppercase tracking-widest"
                                                    >
                                                        Lihat Semua ({searchResults.length} {user?.role === 'superadmin' ? 'Hasil' : 'Proposal'}) →
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Live Realtime Clock Widget */}
                        {currentTime && (
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#1c0c16] border border-primary/30 rounded-2xl text-[#f3e8ee] shadow-sm">
                                <Clock size={16} className="text-rose-400 shrink-0" />
                                <div className="flex flex-col text-left leading-tight">
                                    <span className="text-xs font-bold text-[#f3e8ee]">
                                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(':', '.')} {getTimeZoneLabel()}
                                    </span>
                                    <span className="text-[9px] font-semibold text-rose-300/70">
                                        Masuk: {sessionStartTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')} {getTimeZoneLabel()}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-3 bg-[#1c0c16] border border-primary/20 rounded-2xl text-rose-300/70 hover:text-white hover:border-primary/40 transition-all relative group shadow-sm"
                            >
                                <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
                                {unreadCount > 0 && (
                                    <>
                                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary rounded-full border-2 border-[#140810] flex items-center justify-center text-[8px] font-black text-white z-10">
                                            {unreadCount}
                                        </span>
                                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
                                    </>
                                )}
                            </button>
                            <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                        </div>
                        {hasPermission('buat proposal') && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-primary hover:bg-[#6b001a] text-white p-3 sm:px-6 sm:py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary/30 flex items-center gap-2 active:scale-95"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Buat Baru</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 custom-scrollbar">
                    {children}
                </div>
            </main>

            <CreateProposalModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    window.location.reload(); 
                }}
                user={user}
            />

            <ProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                onUpdate={(updatedUser) => setUser(updatedUser)}
            />
        </div>
    );
}

function SidebarItem({ href, icon, label, badge }: { href: string, icon: React.ReactNode, label: string, badge?: number }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
            href={href} 
            className={`flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all duration-300 group ${isActive ? 'bg-gradient-to-r from-[#800020] to-[#a31d36] text-white shadow-lg shadow-primary/40' : 'text-rose-100 font-semibold hover:text-white hover:bg-primary/25'}`}
        >
            <div className="flex items-center space-x-4">
                <span className={`${isActive ? 'text-white' : 'group-hover:scale-110 text-rose-200 group-hover:text-white'} transition-all duration-300`}>{icon}</span>
                <span className="font-bold text-sm tracking-tight">{label}</span>
            </div>
            {badge !== undefined && badge > 0 && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-[#5c0e25] text-rose-100 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm border border-rose-600/50"
                >
                    {badge}
                </motion.span>
            )}
        </Link>
    );
}
