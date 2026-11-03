'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import echo from '@/lib/echo';
import { 
    Shield, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Users, 
    Search, 
    Mail, 
    Briefcase,
    AlertTriangle,
    Check,
    X,
    UserCheck,
    UserX,
    Fingerprint,
    Key
} from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import UserPermissionModal from '@/components/UserPermissionModal';
import UserRoleModal from '@/components/UserRoleModal';
import { useToast } from '@/context/ToastContext';
import { UserCog } from 'lucide-react';
import { getRelativeTime, formatClockTime, getRelativeTimeMinutes } from '@/lib/time';

export default function AdminManagementPage() {
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const query = searchParams?.get('search');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{id: number, status: string, name: string} | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [selectedUserForReset, setSelectedUserForReset] = useState<any>(null);

    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedUserForPermission, setSelectedUserForPermission] = useState<any>(null);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);

    useEffect(() => {
        fetchUsers();

        // Listen for user/role updates to make it real-time
        const channel = echo?.private('admin.logs')
            .listen('.AuditLogCreated', (data: any) => {
                const log = data.log;
                // If a user or role is updated, refresh the list
                if (log.target_type === 'USER' || log.action === 'CREATE' && log.target_type === 'USER') {
                    fetchUsers();
                }
            });

        return () => {
            channel?.stopListening('.AuditLogCreated');
        };
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.users);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusClick = (userId: number, status: string, name: string) => {
        if (status === 'active' && users.find(u => u.id === userId)?.status === 'pending') {
            // Instant approve for pending
            executeStatusUpdate(userId, 'active');
            return;
        }
        setConfirmAction({ id: userId, status, name });
        setIsConfirmOpen(true);
    };

    const executeStatusUpdate = async (userId: number, status: string) => {
        setActionLoading(true);
        try {
            await api.patch(`/user/${userId}/status`, { status });
            fetchUsers();
            showToast(`Status pengguna berhasil diperbarui ke ${status.toUpperCase()}`);
            setIsConfirmOpen(false);
        } catch (error) {
            showToast('Gagal memperbarui status pengguna.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || u.status === filter;
        return matchesSearch && matchesFilter;
    });

    const pendingUsers = users.filter(u => u.status === 'pending');

    const hasPermission = (permission: string) => {
        if (!user) return false;
        return user?.all_permissions?.includes(permission) ?? false;
    };

    const canManageUsers = hasPermission('kelola pengguna');

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

    if (!canManageUsers) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-background rounded-[3rem] border border-primary/30 shadow-lg">
                <div className="w-20 h-20 bg-rose-500/15 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/30 shadow-sm">
                    <Shield className="text-rose-400" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#ffffff] mb-2">Akses Terbatas</h2>
                <p className="text-rose-100 max-w-md font-medium">Halaman ini hanya dapat diakses oleh Super Admin untuk verifikasi keamanan.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#ffffff] tracking-tight flex items-center gap-3">
                        <UserCheck className="text-rose-300" size={30} />
                        Otoritas Pengguna
                    </h2>
                    <p className="text-rose-100 font-semibold mt-1 text-sm">
                        Verifikasi manajer baru dan kelola hak akses personil.
                    </p>
                </div>
                 <div className="flex items-center gap-3 p-3.5 bg-[#1c0c16]/80 border border-primary/30 rounded-2xl shadow-lg">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Status Sistem</p>
                        <p className="text-xs font-bold text-rose-300">Terproteksi</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 text-rose-200 rounded-xl flex items-center justify-center border border-primary/30">
                        <Fingerprint size={20} />
                    </div>
                </div>
            </div>

            {/* Quick Verification Section (Only if pending exists) */}
            <AnimatePresence>
                 {pendingUsers.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 sm:p-8 shadow-lg"
                    >
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl"><Clock size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-[#ffffff]">Verifikasi Tertunda</h3>
                                <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">Selesaikan permintaan akses berikut</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {pendingUsers.map((u) => (
                                 <motion.div 
                                    layout
                                    key={u.id}
                                    className="bg-[#1c0c16] border border-primary/30 rounded-2xl p-5 hover:border-primary/50 transition-all group shadow-lg"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-[#800020] to-[#a31d36] shadow-sm">
                                            {(u.name?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-[#ffffff]">{u.name}</h4>
                                            <p className="text-xs text-rose-200 font-bold">{u.email}</p>
                                        </div>
                                    </div>
                                     <div className="p-3 bg-primary/20 rounded-xl mb-4 border border-primary/30">
                                        <p className="text-[10px] font-bold text-rose-200 uppercase tracking-wider mb-0.5">Permintaan Peran</p>
                                        <p className="text-xs font-bold text-rose-300 uppercase tracking-wider">Manajer (Verifikator)</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                         <button 
                                            onClick={() => handleStatusClick(u.id, 'active', u.name)}
                                            className="flex items-center justify-center gap-2 py-2.5 bg-[#800020] hover:bg-[#6b001a] text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm uppercase tracking-wider"
                                        >
                                            <Check size={14} /> Terima
                                        </button>
                                        <button 
                                            onClick={() => handleStatusClick(u.id, 'suspended', u.name)}
                                            className="flex items-center justify-center gap-2 py-2.5 bg-[#190a12] hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95 border border-primary/30 shadow-sm uppercase tracking-wider"
                                        >
                                            <X size={14} /> Tolak
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main User List Filter & Search */}
            <div className="space-y-6">
                {searchTerm && (
                    <div className="flex items-center justify-between p-4 bg-primary/20 rounded-2xl border border-primary/30 text-rose-200">
                        <span className="text-xs font-bold flex items-center gap-2">
                            <Search size={16} className="text-rose-300" /> Kata Kunci Pencarian: <strong className="text-white">"{searchTerm}"</strong>
                        </span>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                window.history.replaceState(null, '', '/dashboard/admin');
                            }}
                            className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 hover:bg-rose-500 px-3 py-1.5 rounded-xl transition-all text-white"
                        >
                            Reset Pencarian ✕
                        </button>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#1c0c16]/80 border border-primary/30 rounded-2xl shadow-md justify-center sm:justify-start">
                        {['all', 'pending', 'active', 'suspended'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all ${
                                    filter === f ? 'bg-gradient-to-r from-[#800020] to-[#a31d36] text-white shadow-md shadow-primary/30' : 'text-rose-300/70 hover:text-white hover:bg-primary/20'
                                }`}
                            >
                                {f === 'all' ? 'Semua' : (f === 'pending' ? 'Tertunda' : (f === 'active' ? 'Aktif' : 'Blokir'))}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-20 glass rounded-2xl animate-pulse bg-primary/10 border border-primary/20" />
                        ))
                     ) : filteredUsers.length === 0 ? (
                        <div className="py-16 text-center bg-[#1c0c16]/80 rounded-3xl border border-dashed border-primary/30 shadow-md">
                            <Users size={40} className="mx-auto text-rose-300/30 mb-3" />
                            <p className="text-rose-200/60 font-medium text-sm">Personil tidak ditemukan.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {filteredUsers.map((u) => (
                                 <motion.div 
                                    layout
                                    key={u.id}
                                    className={`rounded-2xl p-4 sm:p-5 border transition-all bg-[#1c0c16]/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                                        u.status === 'pending' ? 'border-amber-500/40' : 'border-primary/30'
                                    } hover:border-primary/50`}
                                >
                                    <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-sm text-white overflow-hidden shrink-0 bg-gradient-to-br ${
                                            u.role === 'superadmin' 
                                                ? 'from-[#4a0013] to-primary' 
                                                : u.role === 'manager' 
                                                ? 'from-primary to-[#a31d36]' 
                                                : 'from-[#4d1927] to-[#800020]'
                                        }`}>
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                (u.name?.[0] || 'U').toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-base font-bold text-[#f3e8ee] truncate max-w-[150px] sm:max-w-none">{u.name}</h4>
                                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase border shrink-0 ${
                                                    u.role === 'superadmin' ? 'border-primary/40 text-rose-300 bg-primary/20' : 
                                                    (u.role === 'manager' ? 'border-primary/40 text-rose-300 bg-primary/20' : 'border-rose-900/30 text-rose-300/70 bg-[#140810]')
                                                }`}>
                                                    {u.role === 'superadmin' ? 'Super Admin' : (u.role === 'manager' ? 'Manajer' : 'Staf')}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                                                <span className="text-xs text-rose-200/70 font-medium truncate max-w-[180px] sm:max-w-none" title={u.email}>{u.email}</span>
                                                <span className="text-xs text-rose-200/70 font-semibold uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">{u.position}</span>
                                                {u.is_online ? (
                                                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-rose-300/60 font-medium">
                                                        Offline {getRelativeTimeMinutes(u.updated_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t border-primary/20 md:border-none pt-3 md:pt-0">
                                        <div className={`px-3 py-1.5 rounded-xl border font-semibold text-[9px] uppercase tracking-wider flex items-center shrink-0 ${
                                            u.status === 'active' ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' :
                                            (u.status === 'pending' ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' : 'border-rose-500/40 text-rose-300 bg-rose-500/10')
                                        }`}>
                                            {u.status === 'active' ? 'Aktif' : (u.status === 'pending' ? 'Menunggu' : 'Diblokir')}
                                        </div>
                                        {u.id !== user.id && (
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUserForRole(u);
                                                        setIsRoleModalOpen(true);
                                                    }}
                                                    className="p-2.5 bg-primary/20 text-rose-300 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-primary/30"
                                                    title="Ubah Peran (Role)"
                                                >
                                                    <UserCog size={15} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUserForReset(u);
                                                        setIsResetModalOpen(true);
                                                    }}
                                                    className="p-2.5 bg-primary/20 text-rose-300 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-primary/30"
                                                    title="Ganti Kata Sandi"
                                                >
                                                    <Key size={15} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUserForPermission(u);
                                                        setIsPermissionModalOpen(true);
                                                    }}
                                                    className="p-2.5 bg-primary/20 text-rose-300 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-primary/30"
                                                    title="Atur Hak Akses Khusus"
                                                >
                                                    <Fingerprint size={15} />
                                                </button>
                                                 {u.status !== 'active' && (
                                                    <button 
                                                        onClick={() => handleStatusClick(u.id, 'active', u.name)}
                                                        className="p-2.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-emerald-500/30"
                                                        title="Aktifkan"
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                )}
                                                 {u.status === 'active' && (
                                                    <button 
                                                        onClick={() => handleStatusClick(u.id, 'suspended', u.name)}
                                                        className="p-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-rose-500/30"
                                                        title="Blokir"
                                                    >
                                                        <UserX size={15} />
                                                    </button>
                                                )}
                                                 {u.status === 'suspended' && (
                                                    <button 
                                                        onClick={() => handleStatusClick(u.id, 'active', u.name)}
                                                        className="p-2.5 bg-primary/20 text-rose-300 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-primary/30"
                                                        title="Buka Blokir"
                                                    >
                                                        <UserCheck size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Alert */}
            <div className="glass rounded-3xl border border-primary/30 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 bg-[#1c0c16]/80 relative overflow-hidden shadow-lg">
                <div className="w-14 h-14 bg-primary/20 text-rose-300 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-primary/30">
                    <Shield className="w-7 h-7" />
                </div>
                <div className="text-center md:text-left">
                    <h4 className="text-lg font-bold text-[#f3e8ee] mb-1 tracking-tight">Keamanan & Otoritas Sistem</h4>
                    <p className="text-rose-200/70 text-xs sm:text-sm font-medium leading-relaxed max-w-3xl">
                        Sebagai Super Admin, Anda memegang otoritas penuh untuk memverifikasi dan mengelola hak akses seluruh personel demi menjaga integritas data perusahaan.
                    </p>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => confirmAction && executeStatusUpdate(confirmAction.id, confirmAction.status)}
                title={confirmAction?.status === 'suspended' ? 'Blokir Pengguna?' : 'Aktifkan Pengguna?'}
                message={confirmAction?.status === 'suspended' 
                    ? `Apakah Anda yakin ingin memblokir akses ${confirmAction?.name}? Pengguna ini tidak akan bisa masuk ke sistem.` 
                    : `Berikan akses kembali kepada ${confirmAction?.name}?`}
                confirmText={confirmAction?.status === 'suspended' ? 'Ya, Blokir' : 'Ya, Aktifkan'}
                loading={actionLoading}
                type={confirmAction?.status === 'suspended' ? 'danger' : 'success'}
            />
            <ResetPasswordModal 
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                user={selectedUserForReset}
            />
            <UserPermissionModal 
                isOpen={isPermissionModalOpen}
                onClose={() => setIsPermissionModalOpen(false)}
                user={selectedUserForPermission}
            />
            <UserRoleModal 
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                user={selectedUserForRole}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
