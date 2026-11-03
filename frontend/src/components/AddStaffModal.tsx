'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, CheckCircle2, Mail, Lock, Briefcase, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [position, setPosition] = useState('');
    const [divisions, setDivisions] = useState<any[]>([]);
    const [role, setRole] = useState('staff');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchDivisions();
        }
    }, [isOpen]);

    const fetchDivisions = async () => {
        try {
            const response = await api.get('/divisions');
            setDivisions(response.data);
            if (response.data.length > 0 && !position) {
                setPosition(response.data[0].name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/staff', { name, email, password, position, role: 'staff' });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
                setName('');
                setEmail('');
                setPassword('');
                setRole('staff');
            }, 1500);
        } catch (error) {
            console.error(error);
            showToast('Gagal menambah anggota. Pastikan email belum terdaftar.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto custom-scrollbar">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl bg-[#1c0c16] text-[#f3e8ee] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {success ? (
                            <div className="p-10 sm:p-16 text-center overflow-y-auto custom-scrollbar flex-1">
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/30 text-rose-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-primary/20 border border-primary/30"
                                >
                                    <CheckCircle2 size={44} />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl font-black text-[#f3e8ee] mb-2 tracking-tight uppercase">Staf Terdaftar!</h2>
                                <p className="text-sm text-rose-200/70 font-medium italic opacity-80">Anggota tim baru telah berhasil ditambahkan ke sistem.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                                <div className="flex justify-between items-center mb-6 sm:mb-8">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-3 sm:p-4 bg-primary/20 text-rose-300 rounded-2xl shadow-sm border border-primary/30">
                                            <UserPlus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-[#ffffff] tracking-tight uppercase">Tambah Staf</h2>
                                            <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1">Registrasi Personel</p>
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
                                            <input 
                                                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-2xl px-5 py-3.5 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 text-sm shadow-sm"
                                                placeholder="Contoh: John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all"><Mail size={16} /></div>
                                            <input 
                                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-5 py-3.5 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 text-sm shadow-sm"
                                                placeholder="john@staf.com"
                                            />
                                        </div>
                                    </div>

                                     <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Kata Sandi Awal</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all"><Lock size={16} /></div>
                                            <input 
                                                type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-11 py-3.5 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 text-sm shadow-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300/70 hover:text-white transition-colors p-1 rounded-xl"
                                                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Tugaskan Divisi</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all"><Briefcase size={16} /></div>
                                            <select 
                                                required value={position} onChange={(e) => setPosition(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-5 py-3.5 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold cursor-pointer uppercase text-sm shadow-sm appearance-none"
                                            >
                                                {divisions.map((div) => (
                                                    <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#f3e8ee]">{div.name.toUpperCase()}</option>
                                                ))}
                                                {divisions.length === 0 && <option value="" className="bg-[#1c0c16] text-[#f3e8ee]">Tidak ada divisi ditemukan</option>}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] mt-6 sm:mt-8 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                                >
                                    {loading ? 'MENDAFTARKAN...' : 'DAFTARKAN ANGGOTA'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
