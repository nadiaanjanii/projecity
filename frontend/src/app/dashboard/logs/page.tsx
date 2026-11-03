'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
    History, 
    User, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Search,
    Clock,
    UserPlus,
    UserCheck,
    Settings
} from 'lucide-react';
import echo from '@/lib/echo';
import { getRelativeTime, formatClockTime, parseDate, getRelativeTimeMinutes } from '@/lib/time';

export default function AuditLogsPage() {
    const { user, loading: authLoading } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const hasPermission = (permission: string) => {
        if (!user) return false;
        return user?.all_permissions?.includes(permission) ?? false;
    };

    const canViewLogs = hasPermission('lihat log audit');

    useEffect(() => {
        if (canViewLogs) {
            fetchLogs();

            // Real-time listener (table update only)
            const channel = echo?.private('admin.logs')
                .listen('.AuditLogCreated', (data: any) => {
                    setLogs(prev => [data.log, ...prev].slice(0, 100)); // Keep only last 100
                });

            return () => {
                channel?.stopListening('.AuditLogCreated');
            };
        }
    }, [user, canViewLogs]);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            setLogs(response.data.logs);
        } catch (error: any) {
            // Silently handle errors, maybe set an error state if needed
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        const a = action.toUpperCase();
        switch (a) {
            case 'CREATE': return <UserPlus className="text-emerald-500" size={18} />;
            case 'VERIFY':
            case 'APPROVE': return <UserCheck className="text-primary" size={18} />;
            case 'REJECT': return <XCircle className="text-rose-500" size={18} />;
            case 'UPDATE': return <Settings className="text-amber-500" size={18} />;
            default: return <History className="text-slate-400" size={18} />;
        }
    };

    const getActionLabel = (action: string) => {
        const a = action.toUpperCase();
        switch (a) {
            case 'CREATE': return 'BUAT';
            case 'VERIFY': return 'VERIFIKASI';
            case 'APPROVE': return 'SETUJUI';
            case 'REJECT': return 'TOLAK';
            case 'UPDATE': return 'PERBARUI';
            case 'DELETE': return 'HAPUS';
            default: return a;
        }
    };

    const filteredLogs = logs.filter(l => 
        l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.target_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const getTargetBadgeStyle = (type: string) => {
        const t = type.toUpperCase();
        if (t.includes('PROPOSAL')) return 'bg-primary/10 text-primary border-primary/20';
        if (t.includes('USER')) return 'bg-primary/10 text-primary border-primary/20';
        if (t.includes('DIVISION')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const translateTarget = (type: string) => {
        const t = type.toUpperCase();
        if (t === 'PROPOSAL') return 'PROPOSAL'; // Tetap proposal atau 'USULAN'
        if (t === 'USER') return 'PENGGUNA';
        if (t === 'DIVISION') return 'DIVISI';
        return t;
    };

    const translateRole = (role: string) => {
        const r = role.toLowerCase();
        if (r === 'superadmin') return 'SUPER ADMIN';
        if (r === 'manager') return 'MANAJER';
        if (r === 'staff') return 'STAF';
        return role.toUpperCase();
    };

    if (authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-12 h-12 bg-primary rounded-2xl shadow-[0_0_30px_rgba(128,0,32,0.6)] mb-4"
                />
                <span className="text-rose-200/70 italic font-black uppercase tracking-widest text-[10px]">Memverifikasi Otoritas Akses...</span>
            </div>
        );
    }

    if (!canViewLogs) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-background rounded-[3rem] border border-primary/30 shadow-lg">
                <div className="w-24 h-24 bg-rose-500/15 rounded-full flex items-center justify-center text-rose-400 mb-6 border border-rose-500/30 shadow-sm">
                    <XCircle size={48} />
                </div>
                <h2 className="text-4xl font-black text-[#f3e8ee] mb-3 tracking-tight">Akses Terbatas</h2>
                <p className="text-rose-200/70 max-w-md mx-auto text-lg leading-relaxed">
                    Halaman ini dikunci secara kriptografis. Hanya personil dengan level <span className="text-rose-400 font-bold">Otoritas Audit</span> yang diizinkan untuk melihat log audit sistem.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header Area */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/20 rounded-2xl border border-primary/30 shadow-sm">
                        <History className="text-rose-300" size={20} />
                        <span className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em]">Protokol Keamanan Aktif</span>
                    </div>
                    <h2 className="text-6xl font-black text-[#ffffff] tracking-tighter leading-none">
                        Intelijen <span className="text-rose-300">Audit</span>
                    </h2>
                    <p className="text-rose-100 font-semibold text-xl max-w-2xl leading-relaxed italic">
                        Memantau aliran data dan aktivitas keamanan sistem Projecity dalam waktu nyata.
                    </p>
                </div>
            </motion.div>

            {/* Smart Filter Area */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative group"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#800020] to-[#a31d36] rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative glass rounded-[3rem] p-5 border border-primary/30 flex items-center shadow-lg bg-[#1c0c16]/90">
                    <Search className="ml-6 text-rose-300 group-focus-within:text-white transition-colors" size={24} />
                    <input 
                        type="text"
                        placeholder="Cari jejak digital berdasarkan pengguna, aksi, atau target..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none px-6 py-4 text-[#ffffff] text-lg focus:outline-none placeholder:text-rose-200/70 font-bold"
                    />
                    <div className="hidden md:flex items-center gap-3 pr-4">
                        <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider bg-primary/20 px-4 py-2 rounded-xl border border-primary/30">Aliran Langsung</span>
                    </div>
                </div>
            </motion.div>

            {/* Premium Logs Table */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-[3.5rem] overflow-hidden border border-primary/30 shadow-lg relative bg-[#1c0c16]/80"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-[#190a12] border-b border-primary/20">
                                <th className="px-10 py-6 text-xs font-semibold uppercase tracking-wider text-rose-300/70">Waktu Kejadian</th>
                                <th className="px-10 py-6 text-xs font-semibold uppercase tracking-wider text-rose-300/70">Pengguna</th>
                                <th className="px-10 py-6 text-xs font-semibold uppercase tracking-wider text-rose-300/70">Aksi</th>
                                <th className="px-10 py-6 text-xs font-semibold uppercase tracking-wider text-rose-300/70">Target</th>
                                <th className="px-10 py-6 text-xs font-semibold uppercase tracking-wider text-rose-300/70">Rincian Aktivitas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            <span className="text-rose-200/70 italic font-black uppercase tracking-widest text-xs">Mendekripsi data log...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                 <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center text-rose-200/70 font-bold text-lg">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-primary/20 rounded-3xl mb-4 border border-primary/30">
                                                <Search size={48} className="text-rose-300/40" />
                                            </div>
                                            Tidak ada catatan aktivitas ditemukan.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <motion.tr 
                                        key={log.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.03 }}
                                        className="hover:bg-primary/20 transition-all group cursor-default"
                                    >
                                         <td className="px-10 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 text-[#f3e8ee] font-bold text-sm">
                                                    <Clock size={14} className="text-rose-400 shrink-0" />
                                                    <span className={log.user?.is_online ? 'text-emerald-400 font-bold' : ''}>
                                                        {log.user?.is_online ? 'Online' : getRelativeTimeMinutes(log.created_at)}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-rose-300/70 font-medium ml-5 tracking-wider">
                                                    {parseDate(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                         <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/50 to-primary/20 p-[1px]">
                                                        <div className={`w-full h-full rounded-[15px] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-95 transition-transform overflow-hidden bg-gradient-to-br ${
                                                            log.user?.role === 'superadmin' 
                                                                ? 'from-[#4a0013] to-primary' 
                                                                : log.user?.role === 'manager' 
                                                                ? 'from-primary to-[#a31d36]' 
                                                                : 'from-[#4d1927] to-[#800020]'
                                                        }`}>
                                                            {log.user?.avatar_url ? (
                                                                <img src={log.user.avatar_url} alt={log.user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (log.user?.name?.[0] || 'S').toUpperCase()
                                                            )}
                                                        </div>
                                                    </div>
                                                    {log.user && (
                                                        <div 
                                                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-[#1c0c16] rounded-full ${
                                                                log.user.is_online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'
                                                            }`} 
                                                            title={log.user.is_online ? 'Online' : 'Offline'}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[#f3e8ee] font-bold text-sm group-hover:text-rose-300 transition-colors truncate">
                                                        {log.user?.name || 'Sistem Otomatis'}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-rose-300/70 uppercase tracking-wider mt-0.5">
                                                        {translateRole(log.user?.role || 'Service')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                         <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30 text-rose-300 shadow-sm group-hover:bg-[#800020] group-hover:text-white transition-all duration-300">
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <span className="text-[#f3e8ee] font-black text-xs uppercase tracking-[0.2em]">{getActionLabel(log.action)}</span>
                                            </div>
                                        </td>
                                         <td className="px-10 py-8">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm font-semibold text-[10px] uppercase tracking-wider ${getTargetBadgeStyle(log.target_type)}`}>
                                                <span className="opacity-50">#</span>{log.target_id} {translateTarget(log.target_type)}
                                            </div>
                                        </td>
                                         <td className="px-10 py-8">
                                            <div className="max-w-[400px]">
                                                <TelemetryDetails details={log.details} />
                                            </div>
                                         </td>
                                     </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] pointer-events-none rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full"></div>
            </motion.div>
        </div>
    );
}

function TelemetryDetails({ details }: { details: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!details) return <span className="text-rose-300/40 italic text-xs">Tidak ada detail tersedia</span>;
    
    let data = details;
    if (typeof details === 'string') {
        try {
            data = JSON.parse(details);
        } catch (e) {
            return <span className="text-rose-200 font-medium text-xs bg-[#190a12] px-2.5 py-1 rounded border border-primary/30">{details}</span>;
        }
    }

    const translateKey = (key: string) => {
        const k = key.toLowerCase();
        if (k === 'title') return 'JUDUL';
        if (k === 'client_name') return 'NAMA KLIEN';
        if (k === 'status') return 'STATUS';
        if (k === 'reason') return 'ALASAN';
        if (k === 'division') return 'DIVISI';
        return key.replace('_', ' ').toUpperCase();
    };

    const entries = Object.entries(data);
    const hasMore = entries.length > 3;
    const visibleEntries = isExpanded ? entries : entries.slice(0, 3);

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {visibleEntries.map(([key, value]: [string, any], idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#190a12] rounded-lg border border-primary/30 shadow-sm">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{translateKey(key)}:</span>
                    <span className="text-xs font-bold text-rose-200 truncate max-w-[200px]" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                </div>
            ))}
            {hasMore && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-primary/20 text-rose-300 hover:bg-primary hover:text-white transition-all active:scale-95 cursor-pointer border border-primary/30 shadow-sm"
                >
                    {isExpanded ? 'Sembunyikan' : `+${entries.length - 3} Detail`}
                </button>
            )}
        </div>
    );
}
