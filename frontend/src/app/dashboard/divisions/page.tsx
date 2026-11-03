'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
    Layers, 
    Plus, 
    Trash2, 
    Edit2, 
    Search, 
    Users, 
    FileText,
    AlertCircle
} from 'lucide-react';

import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/context/ToastContext';

export default function DivisionsPage() {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [divisions, setDivisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDivisionName, setNewDivisionName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDivisions();
    }, []);

    const fetchDivisions = async () => {
        try {
            const res = await api.get('/divisions');
            setDivisions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDivision = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDivisionName.trim()) return;

        setIsAdding(true);
        try {
            await api.post('/divisions', { name: newDivisionName });
            setNewDivisionName('');
            fetchDivisions();
            showToast('Divisi baru berhasil ditambahkan');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal menambah divisi', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDivisionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteDivision = async () => {
        if (!divisionToDelete) return;
        
        setActionLoading(true);
        try {
            await api.delete(`/divisions/${divisionToDelete}`);
            fetchDivisions();
            showToast('Divisi berhasil dihapus dari sistem');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal menghapus divisi', 'error');
        } finally {
            setActionLoading(false);
            setDivisionToDelete(null);
        }
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return user.all_permissions?.includes(permission) ?? false;
    };

    const canAddDivision = hasPermission('tambah divisi') || 
                           hasPermission('kelola divisi');

    const canDeleteDivision = hasPermission('hapus divisi') || 
                              hasPermission('kelola divisi');

    const canViewDivisions = hasPermission('lihat divisi') || 
                             hasPermission('kelola divisi');

    if (authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
                />
                <p className="text-rose-100 font-bold italic">Memuat unit kerja...</p>
            </div>
        );
    }

    if (!canViewDivisions) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#1c0c16]/80 rounded-[3rem] border border-primary/30 shadow-lg">
                <AlertCircle size={48} className="text-rose-300 mb-4" />
                <h3 className="text-2xl font-black text-[#ffffff] uppercase">Akses Terbatas</h3>
                <p className="text-rose-100 font-bold mt-2">Anda tidak memiliki hak akses untuk melihat data divisi.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black text-[#ffffff] tracking-tight uppercase">Manajemen Divisi</h2>
                <p className="text-rose-100 font-semibold mt-2 text-lg italic">
                    Atur struktur organisasi dan unit kerja Projecity.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Tambah Divisi */}
                {canAddDivision ? (
                    <div className="lg:col-span-1">
                        <div className="glass rounded-[3rem] p-8 border border-primary/30 bg-[#1c0c16]/80 shadow-lg sticky top-8">
                            <h3 className="text-xl font-black text-[#ffffff] mb-6 flex items-center gap-2">
                                <Plus className="text-rose-300" size={24} />
                                Tambah Unit Baru
                            </h3>
                            
                            <form onSubmit={handleAddDivision} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-rose-200 uppercase tracking-widest ml-1">Nama Divisi</label>
                                    <input 
                                        type="text" 
                                        value={newDivisionName}
                                        onChange={(e) => setNewDivisionName(e.target.value)}
                                        placeholder="Contoh: Research & Development"
                                        className="w-full bg-[#190a12] border border-primary/40 rounded-2xl px-6 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isAdding || !newDivisionName.trim()}
                                    className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-xs"
                                >
                                    {isAdding ? 'PROSES...' : 'BUAT DIVISI SEKARANG'}
                                </button>
                            </form>

                            <div className="mt-10 p-6 bg-primary/20 rounded-[2rem] border border-primary/30">
                                <p className="text-xs text-rose-100 leading-relaxed italic">
                                    <strong className="text-rose-200">Info:</strong> Divisi yang baru dibuat akan langsung tersedia sebagai pilihan saat Staff mendaftar atau saat Manajer melakukan penugasan personel.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-3 p-6 bg-[#1c0c16]/80 rounded-[2rem] border border-primary/30 mb-2">
                        <p className="text-xs font-bold text-rose-200 flex items-center gap-2">
                            <AlertCircle size={16} /> Mode Lihat Divisi: Anda memiliki hak akses untuk melihat unit kerja divisi.
                        </p>
                    </div>
                )}

                {/* Daftar Divisi */}
                <div className={canAddDivision ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-40 bg-[#1c0c16] rounded-[2.5rem] animate-pulse border border-primary/20" />
                            ))
                        ) : divisions.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-[#1c0c16]/80 rounded-[3rem] border border-primary/30 shadow-lg">
                                <Layers size={48} className="mx-auto text-rose-300 mb-4 opacity-40" />
                                <p className="text-rose-100 font-bold italic">Belum ada divisi yang dibuat.</p>
                            </div>
                        ) : (
                            divisions.map((div) => (
                                 <motion.div 
                                    key={div.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass rounded-[2.5rem] p-8 border border-primary/30 bg-[#1c0c16]/80 hover:border-primary/50 transition-all group relative overflow-hidden shadow-lg"
                                >
                                    {canDeleteDivision && (
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => handleDeleteClick(div.id)}
                                                className="p-3 bg-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-500/30"
                                                title="Hapus Divisi"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-rose-300 group-hover:bg-[#800020] group-hover:text-white transition-all">
                                                <Layers size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[#f3e8ee] group-hover:text-rose-300 transition-colors uppercase">{div.name}</h4>
                                                <p className="text-[10px] font-black text-rose-300/70 uppercase tracking-widest mt-0.5">Unit Kerja Aktif</p>
                                            </div>
                                        </div>

                                         <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-primary/20">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-rose-300/70 uppercase tracking-widest mb-1">Personel</span>
                                                <div className="flex items-center gap-2 text-[#f3e8ee]">
                                                    <Users size={14} className="text-rose-400" />
                                                    <span className="font-black">{div.staff_count || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] font-black text-rose-300/70 uppercase tracking-widest mb-1">Total Dokumen</span>
                                                <div className="flex items-center gap-2 text-[#f3e8ee] justify-end">
                                                    <span className="font-black">{div.proposals_count || 0}</span>
                                                    <FileText size={14} className="text-rose-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteDivision}
                title="Hapus Divisi?"
                message="Staff di dalam divisi ini tidak akan terhapus, namun posisi mereka akan menjadi kosong dalam sistem. Lanjutkan?"
                confirmText="Hapus Divisi"
                loading={actionLoading}
                type="danger"
            />
        </div>
    );
}
