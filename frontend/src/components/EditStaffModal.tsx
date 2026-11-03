'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Key, User, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

interface EditStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    staffMember: any;
}

export default function EditStaffModal({ isOpen, onClose, onSuccess, staffMember }: EditStaffModalProps) {
    const { user: currentUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('active');
    const [role, setRole] = useState('staff');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (staffMember) {
            setName(staffMember.name);
            setEmail(staffMember.email);
            setStatus(staffMember.status || 'active');
            setRole(staffMember.role || 'staff');
        }
    }, [staffMember]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/user/${staffMember.id}/update`, { name, email, status, role });
            showToast('Detail anggota berhasil diperbarui!', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Gagal memperbarui data staf.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!confirm('Atur ulang kata sandi ke "password123"?')) return;
        setLoading(true);
        try {
            await api.post(`/user/${staffMember.id}/reset-password`);
            showToast('Kata sandi berhasil diatur ulang ke: password123', 'success');
        } catch (error) {
            console.error(error);
            showToast('Gagal mengatur ulang kata sandi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto custom-scrollbar">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl bg-[#1c0c16] text-[#ffffff] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex justify-between items-center mb-6 sm:mb-8">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-3 sm:p-4 bg-primary/20 text-rose-300 rounded-2xl shadow-sm border border-primary/30">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-[#ffffff] tracking-tight uppercase">Edit Anggota</h2>
                                        <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1">Modifikasi Profil</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="p-2 hover:bg-rose-500/20 rounded-2xl text-rose-200 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 sm:space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all"><User size={16} /></div>
                                        <input 
                                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all"><Mail size={16} /></div>
                                        <input 
                                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Status Keanggotaan</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-[#190a12] border border-primary/40 rounded-2xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm appearance-none cursor-pointer uppercase"
                                    >
                                        <option value="active" className="bg-[#1c0c16] text-[#ffffff]">Aktif</option>
                                        <option value="pending" className="bg-[#1c0c16] text-[#ffffff]">Menunggu Verifikasi</option>
                                        <option value="inactive" className="bg-[#1c0c16] text-[#ffffff]">Tidak Aktif (Resign)</option>
                                        <option value="suspended" className="bg-[#1c0c16] text-[#ffffff]">Ditangguhkan</option>
                                    </select>
                                </div>

                                {currentUser?.role === 'superadmin' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Peran Sistem (Otoritas)</label>
                                        <select 
                                            value={role} 
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full bg-[#190a12] border border-primary/40 rounded-2xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm appearance-none cursor-pointer uppercase"
                                        >
                                            <option value="superadmin" className="bg-[#1c0c16] text-[#ffffff]">Super Admin</option>
                                            <option value="manager" className="bg-[#1c0c16] text-[#ffffff]">Manajer</option>
                                            <option value="staff" className="bg-[#1c0c16] text-[#ffffff]">Staf</option>
                                        </select>
                                    </div>
                                )}

                                {currentUser?.role === 'superadmin' && (
                                    <div className="pt-2 flex justify-center">
                                        <button 
                                            type="button" 
                                            onClick={resetPassword}
                                            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-[9px] font-black uppercase tracking-[0.2em] transition-all bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20"
                                        >
                                            <Key size={12} /> Atur Ulang Kata Sandi Paksa
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] mt-6 sm:mt-8 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                            >
                                {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                                <Save size={16} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
