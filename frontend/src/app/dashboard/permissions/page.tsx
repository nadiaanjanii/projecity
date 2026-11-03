'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, 
    Check, 
    X, 
    Fingerprint, 
    Settings2, 
    Lock, 
    Unlock,
    Users,
    Activity,
    Save,
    Search,
    Plus,
    Trash2,
    AlertCircle,
    ChevronRight,
    Layers
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';

export default function PermissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/permissions');
            setRoles(res.data.roles);
            setPermissions(res.data.permissions);
            if (res.data.roles.length > 0 && !selectedRoleId) {
                setSelectedRoleId(res.data.roles[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    const togglePermission = (permName: string) => {
        if (!selectedRoleId) return;
        
        setRoles(prev => prev.map(role => {
            if (role.id === selectedRoleId) {
                const hasPerm = role.permissions.some((p: any) => p.name === permName);
                const newPermissions = hasPerm 
                    ? role.permissions.filter((p: any) => p.name !== permName)
                    : [...role.permissions, { name: permName }];
                return { ...role, permissions: newPermissions };
            }
            return role;
        }));
    };

    const handleSave = async () => {
        if (!selectedRoleId || !selectedRole) return;
        
        setSaving(true);
        try {
            const permNames = selectedRole.permissions.map((p: any) => p.name);
            await api.patch(`/roles/${selectedRoleId}/permissions`, { permissions: permNames });
            showToast(`Hak akses untuk peran ${selectedRole.name.toUpperCase()} berhasil disimpan`);
        } catch (err) {
            showToast('Gagal menyimpan hak akses', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        
        try {
            await api.post('/roles', { name: newRoleName });
            setNewRoleName('');
            setIsAddRoleOpen(false);
            showToast(`Role '${newRoleName}' berhasil dibuat`);
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal membuat role', 'error');
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;
        try {
            await api.delete(`/roles/${roleToDelete.id}`);
            showToast(`Role '${roleToDelete.name}' berhasil dihapus`);
            setIsDeleteConfirmOpen(false);
            setRoleToDelete(null);
            if (selectedRoleId === roleToDelete.id) {
                setSelectedRoleId(roles[0]?.id || null);
            }
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal menghapus role', 'error');
        }
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        return user?.all_permissions?.includes(permission) ?? false;
    };

    const canManagePermissions = user?.role === 'superadmin' || hasPermission('kelola hak akses');

    // Grouping and Filtering
    const categories = Array.from(new Set(permissions.map(p => p.category)));
    const filteredPermissions = permissions.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    if (!canManagePermissions) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-background rounded-[3rem] border border-primary/30 shadow-lg">
                <div className="w-20 h-20 bg-rose-500/15 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/30 shadow-sm">
                    <Shield className="text-rose-400" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#f3e8ee] mb-2">Akses Terbatas</h2>
                <p className="text-rose-200/70 max-w-md">Halaman konfigurasi hak akses sistem hanya tersedia untuk personil dengan Otoritas Keamanan.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-[#ffffff] tracking-tight flex items-center gap-4">
                        <Fingerprint className="text-rose-300" size={36} />
                        Hak Akses (Role)
                    </h2>
                    <p className="text-rose-100 font-semibold mt-2 text-lg italic">
                        Kelola wewenang dan peran personil Projecity secara terpusat.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAddRoleOpen(true)}
                    className="bg-[#800020] hover:bg-[#6b001a] text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center gap-2 text-sm uppercase tracking-widest"
                >
                    <Plus size={20} /> TAMBAH PERAN BARU
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Role List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1 mb-4">Daftar Peran</h3>
                    <div className="space-y-2">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-20 glass rounded-3xl animate-pulse bg-primary/10 border border-primary/20" />)
                        ) : (
                            roles.map((role) => {
                                const isProtected = ['superadmin', 'manager', 'staff'].includes(role.name.toLowerCase());
                                return (
                                     <div key={role.id} className="group relative">
                                        <button
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden flex items-center justify-between shadow-lg ${
                                                selectedRoleId === role.id 
                                                ? 'bg-gradient-to-r from-[#800020] to-[#a31d36] border-primary/50 shadow-primary/40 text-white' 
                                                : 'bg-[#1c0c16]/80 border-primary/30 text-rose-100 hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="relative z-10 flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${selectedRoleId === role.id ? 'bg-white/20' : 'bg-primary/20 text-rose-200'}`}>
                                                    <Shield size={16} className={selectedRoleId === role.id ? 'text-white' : 'text-rose-200'} />
                                                </div>
                                                <div>
                                                    <span className="font-black text-sm uppercase tracking-tighter block text-[#ffffff]">{role.name}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedRoleId === role.id ? 'text-white/90' : 'text-rose-200'}`}>
                                                        {role.permissions.length} Izin
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedRoleId === role.id && <ChevronRight size={18} className="text-white/50" />}
                                        </button>
                                        
                                        {!isProtected && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRoleToDelete(role);
                                                    setIsDeleteConfirmOpen(true);
                                                }}
                                                className="absolute -right-2 -top-2 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-20 border border-rose-400/30"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Permission Workspace */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Search & Action Bar */}
                     <div className="bg-[#1c0c16]/80 rounded-[2.5rem] border border-primary/30 p-4 flex flex-col md:flex-row items-center gap-4 shadow-lg">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300/50" size={18} />
                            <input 
                                type="text"
                                placeholder="Cari izin berdasarkan nama atau kategori..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#190a12] border border-primary/30 rounded-2xl pl-12 pr-4 py-3 text-[#f3e8ee] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-bold placeholder:text-rose-300/30"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedRole}
                            className="bg-[#800020] hover:bg-[#6b001a] text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm shrink-0 uppercase tracking-widest"
                        >
                            <Save size={18} />
                            {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedRole ? (
                            <motion.div 
                                key={selectedRoleId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {categories.map((category) => {
                                    const permsInCategory = filteredPermissions.filter(p => p.category === category);
                                    if (permsInCategory.length === 0) return null;
                                    
                                    return (
                                        <div key={category} className="space-y-4">
                                            <div className="flex items-center gap-3 ml-2">
                                                <Layers size={14} className="text-rose-400" />
                                                <h4 className="text-[10px] font-black text-rose-300/70 uppercase tracking-[0.3em]">{category}</h4>
                                                <div className="h-px bg-primary/20 flex-1" />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {permsInCategory.map((perm) => {
                                                    const isEnabled = selectedRole.permissions.some((p: any) => p.name === perm.name);
                                                    return (
                                                         <button
                                                            key={perm.id}
                                                            onClick={() => togglePermission(perm.name)}
                                                            className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all shadow-lg ${
                                                                isEnabled 
                                                                ? 'bg-primary/20 border-primary/50' 
                                                                : 'bg-[#1c0c16]/80 border-primary/30 hover:border-primary/50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4 text-left">
                                                                 <div className={`p-3 rounded-xl ${isEnabled ? 'bg-[#800020] text-white' : 'bg-primary/10 text-rose-300/40'}`}>
                                                                    {isEnabled ? <Unlock size={18} /> : <Lock size={18} />}
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-black text-[#f3e8ee] uppercase tracking-wide text-[11px]">{perm.name.replace(/_/g, ' ')}</h5>
                                                                    <p className="text-[8px] font-black text-rose-300/70 tracking-widest uppercase">Otoritas Akses</p>
                                                                </div>
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                                isEnabled ? 'bg-[#800020] text-white scale-110 shadow-sm' : 'bg-primary/10 text-rose-300/20'
                                                            }`}>
                                                                <Check size={14} />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Security Warning */}
                                 <div className="p-8 bg-amber-500/10 rounded-[2.5rem] border border-amber-500/20 flex items-start gap-4">
                                    <AlertCircle className="text-amber-400 shrink-0 mt-1" size={20} />
                                    <p className="text-xs text-rose-200/80 leading-relaxed italic">
                                        <strong className="text-amber-400 uppercase tracking-widest block mb-2 text-[10px] font-black">Audit Keamanan</strong>
                                        Perubahan pada peran <strong className="text-rose-300">{selectedRole.name.toUpperCase()}</strong> akan segera diberlakukan kepada seluruh personil terkait. Harap berhati-hati saat menonaktifkan izin administrasi sistem.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-96 glass rounded-[3rem] border border-primary/30 flex flex-col items-center justify-center gap-4 bg-[#1c0c16]/80 shadow-lg">
                                <Activity className="text-rose-400/30 animate-pulse" size={48} />
                                <p className="text-rose-200/70 font-bold italic text-lg">Pilih peran dari sidebar untuk memulai konfigurasi.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddRoleOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsAddRoleOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#1c0c16] border border-primary/30 w-full max-w-md rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
                        >
                            <h3 className="text-2xl font-black text-[#f3e8ee] mb-2 tracking-tight uppercase">Tambah Peran</h3>
                            <p className="text-rose-200/70 text-sm font-medium mb-6 sm:mb-8 italic">Berikan nama untuk otoritas atau jabatan baru di sistem.</p>
                            
                             <form onSubmit={handleAddRole} className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-rose-300/70 uppercase tracking-widest ml-1">Nama Peran (Role Name)</label>
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Contoh: EDITOR, SUPERVISOR..."
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        className="w-full bg-[#190a12] border border-primary/30 rounded-2xl px-6 py-4 text-[#f3e8ee] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold uppercase placeholder:text-rose-300/30"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddRoleOpen(false)}
                                        className="flex-1 py-4 bg-[#140810] hover:bg-primary/20 text-rose-300 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-primary/20"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-2 bg-[#800020] hover:bg-[#6b001a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/30 active:scale-95"
                                    >
                                        Buat Peran
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteRole}
                title="Hapus Peran?"
                message={`Apakah Anda yakin ingin menghapus peran '${roleToDelete?.name}'? Seluruh pengguna dengan peran ini akan kehilangan aksesnya.`}
                confirmText="Hapus Permanen"
                type="danger"
            />
        </div>
    );
}
