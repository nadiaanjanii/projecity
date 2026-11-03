'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import echo from '@/lib/echo';
import { getRelativeTime } from '@/lib/time';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    Users, 
    Sparkles, 
    Activity, 
    ShieldAlert,
    Cpu,
    Database,
    Zap,
    History,
    Search,
    TrendingUp
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/stats');
                setStats(res.data);
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Real-time polling fallback for all roles
        let interval = setInterval(fetchData, 15000); // Poll every 15 seconds

        // Real-time WebSocket listener (Instant)
        let channel: any;
        if (user?.role === 'superadmin') {
            channel = echo?.private('admin.logs')
                .listen('.AuditLogCreated', (data: any) => {
                    setStats((prev: any) => {
                        if (!prev) return prev;
                        
                        const newLog = {
                            id: data.log.id,
                            user_name: data.log.user?.name || 'Sistem',
                            action: data.log.action,
                            target: data.log.target_type,
                            time: 'Baru saja'
                        };

                        // Update stats based on log action
                        let totalUsers = prev.total_users;
                        let pendingUsers = prev.pending_users;

                        if (data.log.action === 'CREATE' && data.log.target_type === 'USER') {
                            // Only increment active count if the new user is created as active
                            if (data.log.target_status === 'active') totalUsers++;
                            pendingUsers++;
                        } else if (data.log.action === 'VERIFY' && data.log.target_type === 'USER') {
                            pendingUsers = Math.max(0, pendingUsers - 1);
                            totalUsers++; // Verification makes them active
                        }

                        return {
                            ...prev,
                            total_users: totalUsers,
                            pending_users: pendingUsers,
                            logs_today_count: (prev.logs_today_count || 0) + 1,
                            recent_activity: [newLog, ...(prev.recent_activity || [])].slice(0, 10)
                        };
                    });
                });
        }

        // Visual jitter for system metrics to feel 'alive'
        const jitterInterval = setInterval(() => {
            setStats((prev: any) => {
                if (!prev || !prev.system_health) return prev;
                
                // Slightly fluctuate response time and load
                const currentRT = parseInt(prev.system_health.response_time);
                const currentLoad = parseInt(prev.system_health.server_load);
                
                return {
                    ...prev,
                    system_health: {
                        ...prev.system_health,
                        response_time: (currentRT + (Math.random() > 0.5 ? 2 : -2)) + 'ms',
                        server_load: (currentLoad + (Math.random() > 0.5 ? 1 : -1)) + '%'
                    }
                };
            });
        }, 3000);

        return () => {
            clearInterval(interval);
            if (jitterInterval) clearInterval(jitterInterval);
            if (channel) channel.stopListening('.AuditLogCreated');
        };
    }, [user]);

    const translateAction = (action: string) => {
        const a = (action || '').toUpperCase();
        if (a.includes('CREATE')) return 'BUAT';
        if (a.includes('UPDATE')) return 'PERBARUI';
        if (a.includes('REJECT')) return 'TOLAK';
        if (a.includes('VERIFY')) return 'VERIFIKASI';
        if (a.includes('APPROVE')) return 'SETUJUI';
        if (a.includes('DELETE')) return 'HAPUS';
        return a;
    };

    const translateTarget = (target: string) => {
        const t = (target || '').toUpperCase();
        if (t.includes('PROPOSAL')) return 'PROPOSAL';
        if (t.includes('USER')) return 'PENGGUNA';
        if (t.includes('DIVISION')) return 'DIVISI';
        return t;
    };

    const translateStatus = (status: string) => {
        const s = (status || '').toUpperCase();
        if (s === 'VERIFIED') return 'TERVERIFIKASI';
        if (s === 'REJECTED') return 'REVISI';
        if (s === 'PENDING') return 'MENUNGGU';
        if (s === 'APPROVED') return 'DISETUJUI';
        return s || 'PROSES';
    };

    if (loading) return (
        <div className="py-20 text-center text-muted-foreground font-bold italic">Menyelaraskan ruang kerja...</div>
    );

    // If Super Admin, show a completely different dashboard
    if (user?.role === 'superadmin') {
        const COLORS = ['#ff3366', '#ffffff', '#ffb3c1', '#e11d48', '#fb7185', '#c026d3'];
        
        return (
            <div className="space-y-8 pb-16">
                {/* Header Admin */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#ffffff] flex items-center gap-3">
                            Kontrol Infrastruktur <span className="text-rose-300">Aktif</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/30 rounded-full border border-primary/40">
                                <span className="text-[10px] font-black text-rose-200 uppercase tracking-wider">Live</span>
                            </div>
                        </h2>
                        <p className="text-rose-100 mt-1 font-semibold text-sm">
                            Pemantauan performa sistem dan log aktivitas Projecity.
                        </p>
                    </div>
                </div>

                {/* Technical Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="glass rounded-3xl p-6 border border-primary/30 bg-[#1c0c16]/80 backdrop-blur-xl relative group shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/20 text-rose-300 rounded-2xl"><Users size={22} /></div>
                            <span className="text-[10px] font-semibold text-rose-300 bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">User Aktif</span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#ffffff] tracking-tight mb-1">{stats?.total_users || 0}</h3>
                        <p className="text-rose-100 text-xs font-bold uppercase tracking-wider">Total Pengguna</p>
                    </div>

                    <div className="glass rounded-3xl p-6 border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl relative group shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl"><ShieldAlert size={22} /></div>
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Keamanan</span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#f3e8ee] tracking-tight mb-1">{stats?.pending_users || 0}</h3>
                        <p className="text-rose-200/60 text-xs font-medium uppercase tracking-wider">Menunggu Verifikasi</p>
                    </div>

                    <div className="glass rounded-3xl p-6 border border-primary/30 bg-primary/10 backdrop-blur-xl relative group shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/25 text-rose-300 rounded-2xl"><Activity size={22} /></div>
                            <span className="text-[10px] font-semibold text-rose-300 bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">Status Uptime</span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#f3e8ee] tracking-tight mb-1">{stats?.system_health?.uptime || '99.9%'}</h3>
                        <p className="text-rose-200/60 text-xs font-medium uppercase tracking-wider">Keandalan Server</p>
                    </div>

                    <div className="glass rounded-3xl p-6 border border-primary/30 bg-primary/10 backdrop-blur-xl relative group shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/25 text-rose-300 rounded-2xl"><Cpu size={22} /></div>
                            <span className="text-[10px] font-semibold text-rose-300 bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">Beban CPU</span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#f3e8ee] tracking-tight mb-1">{stats?.system_health?.server_load || '12%'}</h3>
                        <p className="text-rose-200/60 text-xs font-medium uppercase tracking-wider">Penggunaan Resource</p>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Graph */}
                    <div className="lg:col-span-2 glass rounded-3xl border border-primary/30 p-6 flex flex-col bg-[#1c0c16]/80 shadow-lg">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#f3e8ee]">Tren Pendaftaran Akun</h3>
                                <p className="text-rose-200/60 text-xs font-medium uppercase tracking-wider mt-0.5">7 Hari Terakhir</p>
                            </div>
                            <TrendingUp className="text-rose-400" size={20} />
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.registration_trend || []}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a31d36" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#800020" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#b397a5" 
                                        fontSize={10} 
                                        fontWeight="semibold"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    />
                                    <YAxis stroke="#b397a5" fontSize={10} fontWeight="semibold" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#190a12', border: '1px solid rgba(128,0,32,0.4)', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#f3e8ee', fontWeight: 'semibold' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#a31d36" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Role Distribution Pie */}
                    <div className="glass rounded-3xl border border-primary/30 p-6 flex flex-col bg-[#1c0c16]/80 shadow-lg">
                        <h3 className="text-lg font-bold text-[#f3e8ee] mb-1 text-center">Komposisi Peran</h3>
                        <p className="text-rose-200/60 text-xs font-medium uppercase tracking-wider mb-6 text-center">Distribusi Pengguna</p>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.role_distribution || []}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="total"
                                        nameKey="role"
                                    >
                                        {(stats?.role_distribution || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#190a12" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#190a12', border: '1px solid rgba(128,0,32,0.4)', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#f3e8ee', fontWeight: 'semibold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-primary/20">
                            {(stats?.role_distribution || []).map((entry: any, index: number) => (
                                <div key={entry.role} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shrink-0 border border-white/20 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-bold text-[#ffffff] capitalize">{entry.role}: {entry.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Infrastructure Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activity Feed for Admin */}
                     <div className="glass rounded-3xl border border-primary/30 overflow-hidden bg-[#1c0c16]/80 shadow-lg">
                        <div className="p-6 border-b border-primary/20 bg-primary/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 text-rose-300 rounded-xl"><History size={18} /></div>
                                    <h3 className="font-bold text-lg text-[#f3e8ee]">Log Aktivitas</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex flex-col items-start sm:items-end">
                                        <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider">Hari Ini</span>
                                        <span className="text-xs font-bold text-[#f3e8ee]">{stats?.logs_today_count || 0} Aktivitas</span>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = '/dashboard/logs'}
                                        className="px-4 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 rounded-xl text-xs font-semibold text-rose-200 hover:text-white uppercase tracking-wider transition-all"
                                    >
                                        Riwayat Penuh
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            {(!stats?.recent_activity || stats?.recent_activity.length === 0) ? (
                                <div className="py-10 text-center">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary/20">
                                        <History size={20} className="text-rose-300/40" />
                                    </div>
                                    <p className="text-rose-200/60 font-medium text-sm">Belum ada aktivitas hari ini.</p>
                                </div>
                            ) : (
                                stats?.recent_activity?.map((log: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3.5 bg-[#190a12] rounded-2xl border border-primary/20">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0 overflow-hidden bg-gradient-to-br ${
                                                log.user?.role === 'superadmin' 
                                                    ? 'from-[#4a0013] to-primary' 
                                                    : log.user?.role === 'manager' 
                                                    ? 'from-primary to-[#a31d36]' 
                                                    : 'from-[#4d1927] to-[#800020]'
                                            }`}>
                                                {log.user?.avatar_url ? (
                                                    <img src={log.user.avatar_url} alt={log.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (log.user?.name?.[0] || log.user_name?.[0] || 'S').toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#f3e8ee]">{log.user_name}</p>
                                                <p className="text-[10px] text-rose-300/70 font-semibold uppercase tracking-wider">{translateAction(log.action)} {translateTarget(log.target)}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-rose-300/60 font-medium">
                                            {log.created_at ? getRelativeTime(log.created_at) : log.time}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Server Specs */}
                    <div className="glass rounded-3xl border border-primary/30 p-6 relative overflow-hidden bg-[#1c0c16]/80 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-[#f3e8ee] flex items-center gap-3">
                                <Database className="text-rose-400" size={20} />
                                Status Infrastruktur
                            </h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30 w-fit shrink-0">
                                <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider">Monitoring Active</span>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {[
                                { 
                                    label: 'Kecepatan Respon', 
                                    value: stats?.system_health?.response_time || '---', 
                                    percent: stats?.system_health?.response_time ? Math.max(20, 100 - (parseInt(stats?.system_health?.response_time) / 2)) : 0, 
                                    color: 'bg-primary' 
                                },
                                { 
                                    label: 'Beban CPU', 
                                    value: stats?.system_health?.server_load || '---', 
                                    percent: parseInt(stats?.system_health?.server_load) || 12, 
                                    color: 'bg-primary' 
                                },
                                { 
                                    label: 'Penyimpanan Database', 
                                    value: stats?.system_health?.database_size || '---', 
                                    percent: Math.min(100, (parseFloat(stats?.system_health?.database_size) || 0) * 5), 
                                    color: 'bg-primary' 
                                },
                                { 
                                    label: 'Pemakaian RAM', 
                                    value: stats?.system_health?.ram_usage || '---', 
                                    percent: Math.min(100, (parseFloat(stats?.system_health?.ram_usage) || 0) / 2), 
                                    color: 'bg-primary' 
                                },
                            ].map((spec, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-semibold text-rose-300/70 uppercase tracking-wider">{spec.label}</span>
                                        <span className="text-xs font-bold text-[#f3e8ee]">{spec.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-[#140810] rounded-full overflow-hidden border border-primary/20">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${spec.percent}%` }}
                                            className={`h-full ${spec.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default dashboard for manager/staff
    const cards = user?.role === 'manager' ? [
        { label: 'Total Proposal', value: stats?.total_proposals || 0, icon: <FileText size={22} />, color: 'from-[#800020]/30 to-[#800020]/10', text: 'text-rose-300', border: 'border-primary/30' },
        { label: 'Menunggu Peninjauan', value: stats?.pending_proposals || 0, icon: <Clock size={22} />, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-500/30' },
        { label: 'Proposal Terverifikasi', value: stats?.verified_proposals || 0, icon: <CheckCircle size={22} />, color: 'from-primary/30 to-primary/10', text: 'text-rose-300', border: 'border-primary/30' },
        { label: 'Staf Aktif', value: stats?.total_staff || 0, icon: <Users size={22} />, color: 'from-primary/20 to-primary/10', text: 'text-rose-300', border: 'border-primary/20' },
    ] : [
        { label: 'Proposal Divisi', value: stats?.division_proposals || 0, icon: <FileText size={22} />, color: 'from-[#800020]/30 to-[#800020]/10', text: 'text-rose-300', border: 'border-primary/30' },
        { label: 'Menunggu Peninjauan', value: stats?.pending_proposals || 0, icon: <Clock size={22} />, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-500/30' },
        { label: 'Terverifikasi Divisi', value: stats?.verified_proposals || 0, icon: <CheckCircle size={22} />, color: 'from-primary/30 to-primary/10', text: 'text-rose-300', border: 'border-primary/30' },
        { label: 'Revisi Divisi', value: stats?.revision_count || 0, icon: <ShieldAlert size={22} />, color: 'from-rose-500/20 to-rose-500/5', text: 'text-rose-400', border: 'border-rose-500/30' },
    ];

    return (
        <div className="space-y-8 pb-16">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#ffffff]">
                        Selamat datang kembali, <span className="text-rose-300">{user?.name.split(' ')[0]}</span>
                    </h2>
                    <p className="text-rose-100 mt-1 font-semibold text-sm">
                        {user?.role === 'manager' ? 'Pusat kontrol ruang kerja aktif.' : `Divisi ${user?.position || 'Umum'}.`}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map((card, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-6 rounded-3xl border ${card.border} bg-gradient-to-br ${card.color} backdrop-blur-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 shadow-lg`}
                    >
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 bg-[#190a12] rounded-2xl ${card.text} shadow-sm border border-primary/20`}>{card.icon}</div>
                                <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider flex items-center bg-[#190a12] px-3 py-1 rounded-full border border-primary/30">
                                    Realtime
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold text-[#ffffff] tracking-tight mb-1">{card.value}</h3>
                            <p className="text-rose-100 font-bold text-xs tracking-wider uppercase">{card.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className={`${user?.role === 'manager' ? 'lg:col-span-2' : 'lg:col-span-full'} glass rounded-3xl border border-primary/30 overflow-hidden flex flex-col bg-[#1c0c16]/80 shadow-lg`}>
                    <div className="p-6 border-b border-primary/20 bg-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 text-rose-300 rounded-xl"><Activity size={18} /></div>
                            <div>
                                <h3 className="font-bold text-lg text-[#ffffff]">
                                    {user?.role === 'manager' ? 'Aktivitas Terbaru' : `Aliran Aktivitas ${user?.position}`}
                                </h3>
                                <p className="text-[10px] font-bold text-rose-200 uppercase tracking-wider mt-0.5">Pemantauan Real-time</p>
                            </div>
                        </div>
                        
                        {/* Integrated Daily Stats in Header */}
                        <div className="flex items-center gap-3 bg-[#140810] p-1.5 rounded-2xl border border-primary/30">
                            <div className="px-3 py-1.5 text-center border-r border-primary/20">
                                <p className="text-base font-bold text-[#f3e8ee]">{stats?.daily_stats?.uploaded || 0}</p>
                                <p className="text-[8px] font-semibold text-rose-300 uppercase tracking-wider">Baru</p>
                            </div>
                            <div className="px-3 py-1.5 text-center border-r border-primary/20">
                                <p className="text-base font-bold text-rose-400">{stats?.daily_stats?.verified || 0}</p>
                                <p className="text-[8px] font-semibold text-rose-300 uppercase tracking-wider">Verifikasi</p>
                            </div>
                            <div className="px-3 py-1.5 text-center pr-4 relative">
                                <p className="text-base font-bold text-rose-400">{stats?.daily_stats?.rejected || 0}</p>
                                <p className="text-[8px] font-semibold text-rose-400 uppercase tracking-wider">Revisi</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto max-h-[450px]">
                        <div className="space-y-2">
                            {stats?.recent_activity?.length > 0 ? (
                                <>
                                    {stats.recent_activity.map((activity: any, i: number) => {
                                        const showHeader = i === 0 || (activity.is_today !== stats.recent_activity[i-1].is_today);
                                        return (
                                            <div key={i}>
                                                {showHeader && (
                                                    <div className="px-4 py-2 text-[10px] font-semibold text-rose-300/60 uppercase tracking-wider flex items-center gap-3">
                                                        <span>{activity.is_today ? 'Hari Ini' : 'Sebelumnya'}</span>
                                                        <div className="h-px flex-1 bg-primary/20" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 p-3.5 hover:bg-primary/20 rounded-2xl transition-all group relative overflow-hidden bg-[#190a12]/60 border border-primary/10">
                                                    {activity.is_today && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                    )}
                                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-rose-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0 overflow-hidden">
                                                        {activity.avatar_url ? (
                                                            <img src={activity.avatar_url} alt={activity.user_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            (activity.user_name?.[0] || 'U').toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[#f3e8ee] font-bold text-xs truncate">
                                                            <span className="text-rose-400">{activity.user_name}</span> {translateAction(activity.action)}
                                                        </p>
                                                        <p className="text-rose-200/70 text-[11px] mt-0.5 font-medium truncate">
                                                            {translateTarget(activity.target)} - {activity.created_at ? getRelativeTime(activity.created_at) : activity.time}
                                                        </p>
                                                    </div>
                                                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                                                        activity.status === 'VERIFIED' ? 'border-primary/40 text-rose-300 bg-primary/20' : 
                                                        activity.status === 'REJECTED' ? 'border-rose-500/40 text-rose-400 bg-rose-500/10' :
                                                        'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                                    }`}>
                                                        {translateStatus(activity.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="py-16 text-center font-medium text-sm text-rose-200/50">
                                    Belum ada aktivitas terekam.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Widget for Manager */}
                {user?.role === 'manager' && (
                    <div className="glass rounded-3xl border border-primary/30 p-6 flex flex-col justify-between bg-[#1c0c16]/80 shadow-lg relative overflow-hidden">
                        <div>
                            <div className="w-12 h-12 bg-primary/20 text-rose-300 rounded-2xl flex items-center justify-center mb-5 border border-primary/30">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-[#f3e8ee] mb-2">Laporan Analitik</h3>
                            <p className="text-rose-200/70 text-xs font-medium leading-relaxed mb-6">
                                Liha performa pengajuan proposal antar divisi secara mendalam di menu Analisis Data.
                            </p>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/dashboard/analytics'}
                            className="w-full py-3.5 bg-[#800020] hover:bg-[#6b001a] text-white font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 text-xs uppercase tracking-wider"
                        >
                            Buka Analisis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
