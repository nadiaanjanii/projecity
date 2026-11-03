'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Check, Fingerprint, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface UserPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function UserPermissionModal({ isOpen, onClose, user }: UserPermissionModalProps) {
    const { showToast } = useToast();
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchData();
        }
    }, [isOpen, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resAll = await api.get('/permissions');
            setAllPermissions(resAll.data.permissions);

            const resUser = await api.get(`/users/${user.id}/permissions`);
            setUserPermissions(resUser.data.permissions);
        } catch (error) {
            console.error(error);
            showToast('Gagal memuat data hak akses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (permissionName: string) => {
        if (userPermissions.includes(permissionName)) {
            setUserPermissions(userPermissions.filter(p => p !== permissionName));
        } else {
            setUserPermissions([...userPermissions, permissionName]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/users/${user.id}/permissions`, {
                permissions: userPermissions
            });
            showToast('Hak akses khusus berhasil diperbarui!', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan hak akses', 'error');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { 
            name: 'Manajemen Proposal', 
            perms: ['lihat proposal', 'buat proposal', 'edit proposal', 'hapus proposal', 'download proposal', 'verifikasi proposal', 'tolak proposal', 'ekspor pdf', 'ekspor csv'] 
        },
        { 
            name: 'Struktur Organisasi', 
            perms: ['lihat divisi', 'kelola divisi', 'tambah divisi', 'edit divisi', 'hapus divisi'] 
        },
        { 
            name: 'Manajemen Tim', 
            perms: ['kelola pengguna', 'lihat staf', 'verifikasi staf', 'edit staf', 'hapus staf', 'atur ulang sandi'] 
        },
        { 
            name: 'Keamanan & Sistem', 
            perms: ['kelola hak akses', 'lihat log audit', 'lihat analisis', 'lihat arsip', 'kelola komentar'] 
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-[#1c0c16] text-[#ffffff] backdrop-blur-2xl"
                    >
                        <div className="p-6 sm:p-8 border-b border-primary/20 bg-[#190a12] flex justify-between items-center">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary/20 text-rose-300 rounded-2xl shadow-sm border border-primary/30">
                                    <Fingerprint size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#ffffff] tracking-tight uppercase">Otoritas Akses: {user?.name}</h2>
                                    <p className="text-rose-200 text-[10px] font-black uppercase tracking-widest mt-1">Konfigurasi Hak Akses Langsung Detail</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-rose-500/20 rounded-2xl text-rose-200 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-rose-100 gap-6">
                                    <Loader2 size={48} className="animate-spin text-rose-300" />
                                    <p className="font-bold italic text-lg">Memindai database izin...</p>
                                </div>
                            ) : (
                                categories.map((cat, catIdx) => (
                                    <div key={catIdx} className="space-y-6">
                                        <div className="flex items-center gap-5">
                                            <h3 className="text-xs font-black text-rose-300 uppercase tracking-[0.25em]">{cat.name}</h3>
                                            <div className="h-px flex-1 bg-primary/20" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {allPermissions.filter(p => cat.perms.includes(p.name)).map((permission) => {
                                                const isChecked = userPermissions.includes(permission.name);
                                                return (
                                                    <button 
                                                        key={permission.id}
                                                        onClick={() => handleToggle(permission.name)}
                                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left group shadow-md ${
                                                            isChecked 
                                                            ? 'bg-primary/20 border-primary/50 text-[#ffffff] shadow-primary/20' 
                                                            : 'bg-[#190a12] border-primary/30 text-rose-100 hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isChecked ? 'text-rose-200' : 'text-rose-100'}`}>
                                                                {permission.name}
                                                            </span>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shadow-sm ${
                                                            isChecked 
                                                            ? 'bg-[#800020] border-primary/50 text-white' 
                                                            : 'border-primary/30 text-transparent group-hover:border-primary/50'
                                                        }`}>
                                                            <Check size={14} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 sm:p-8 border-t border-primary/20 bg-[#140810] flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-[10px] text-rose-200 font-bold max-w-md leading-relaxed uppercase tracking-tight">
                                Perubahan akan langsung berdampak pada sesi aktif pengguna setelah mereka menyegarkan halaman.
                            </p>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-4 text-rose-200 font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="bg-[#800020] hover:bg-[#6b001a] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                    Simpan Akses
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
