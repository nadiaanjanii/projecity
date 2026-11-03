'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Users, Briefcase, Check, Loader2, Layers } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface UserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

export default function UserRoleModal({ isOpen, onClose, user, onSuccess }: UserRoleModalProps) {
    const { showToast } = useToast();
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [divisions, setDivisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role || 'staff');
            setSelectedDivision(user.position || '');
        }
        if (isOpen) {
            fetchDivisions();
        }
    }, [user, isOpen]);

    const fetchDivisions = async () => {
        try {
            const response = await api.get('/divisions');
            setDivisions(response.data);
        } catch (error) {
            console.error('Gagal mengambil data divisi', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post(`/users/${user.id}/roles`, { 
                roles: [selectedRole],
                position: selectedRole === 'superadmin' ? 'ADMINISTRATOR SISTEM' : selectedDivision
            });
            showToast(`Peran & Divisi ${user.name} berhasil diperbarui.`);
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Gagal mengubah peran', 'error');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'superadmin', label: 'SUPER ADMIN', icon: Shield, color: 'indigo', desc: 'Akses penuh ke seluruh sistem dan keamanan.' },
        { id: 'manager', label: 'MANAJER', icon: Briefcase, color: 'emerald', desc: 'Verifikasi proposal dan manajemen tim divisi.' },
        { id: 'staff', label: 'STAF', icon: Users, color: 'slate', desc: 'Mengajukan proposal dan melihat data internal.' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl overflow-hidden bg-[#1c0c16] text-[#f3e8ee] backdrop-blur-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 sm:p-8 border-b border-primary/20 flex justify-between items-center bg-[#190a12]">
                            <h2 className="text-xl font-black text-[#ffffff] uppercase tracking-tight italic">Ubah Peran & Divisi</h2>
                            <button onClick={onClose} className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-200 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex items-center gap-4 p-5 bg-[#190a12] rounded-2xl border border-primary/30">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black shadow-lg text-white shrink-0 bg-gradient-to-br ${
                                    user?.role === 'superadmin' 
                                        ? 'from-[#4a0013] to-primary shadow-primary/30' 
                                        : user?.role === 'manager' 
                                        ? 'from-primary to-[#a31d36] shadow-rose-950/30' 
                                        : 'from-[#4d1927] to-[#800020] shadow-rose-950/30'
                                }`}>
                                    {(user?.name?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-[#ffffff]">{user?.name}</p>
                                    <p className="text-xs text-rose-200 font-bold">{user?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] px-2">Pilih Peran Baru</p>
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`w-full flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden shadow-md ${
                                            selectedRole === role.id 
                                            ? `bg-primary/20 border-primary/50 text-[#ffffff] shadow-primary/20` 
                                            : 'bg-[#190a12] border-primary/30 hover:border-primary/50 text-rose-100'
                                        }`}
                                    >
                                        <div className={`p-3 rounded-xl transition-colors ${
                                            selectedRole === role.id ? `bg-[#800020] text-white shadow-lg shadow-primary/30` : 'bg-primary/20 text-rose-200 group-hover:bg-[#800020] group-hover:text-white'
                                        }`}>
                                            <role.icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-black tracking-widest uppercase ${
                                                selectedRole === role.id ? `text-rose-200` : 'text-[#ffffff]'
                                            }`}>
                                                {role.label}
                                            </p>
                                            <p className="text-[10px] font-bold text-rose-200/90 leading-relaxed mt-1">
                                                {role.desc}
                                            </p>
                                        </div>
                                        {selectedRole === role.id && (
                                            <div className="w-6 h-6 rounded-full bg-[#800020] flex items-center justify-center text-white shadow-lg shadow-primary/30 border border-primary/40">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {selectedRole !== 'superadmin' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <p className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] px-2">Tentukan Penempatan Divisi</p>
                                    <div className="relative">
                                        <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                                        <select 
                                            value={selectedDivision}
                                            onChange={(e) => setSelectedDivision(e.target.value)}
                                            className="w-full bg-[#190a12] border border-primary/30 rounded-2xl py-4 pl-16 pr-6 text-[#f3e8ee] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer uppercase shadow-sm"
                                        >
                                            <option value="" disabled className="bg-[#1c0c16] text-[#f3e8ee]">Pilih Divisi...</option>
                                            {divisions.map((div) => (
                                                <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#f3e8ee]">
                                                    DIVISI {div.name.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-6 sm:p-8 bg-[#140810] border-t border-primary/20">
                            <button 
                                onClick={handleSave}
                                disabled={loading || (selectedRole !== 'superadmin' && !selectedDivision)}
                                className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-xs"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'TERAPKAN PERUBAHAN'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
