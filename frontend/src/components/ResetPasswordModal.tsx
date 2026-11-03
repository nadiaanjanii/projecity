'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, CheckCircle2, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        try {
            await api.patch(`/users/${user.id}/reset-password`, { password });
            setSuccess(true);
            showToast('Kata sandi berhasil diperbarui!', 'success');
            setTimeout(() => {
                setSuccess(false);
                setPassword('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error(error);
            showToast('Gagal mereset kata sandi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 overflow-y-auto">
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
                        className="relative w-full max-w-md glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl bg-[#1c0c16] text-[#f3e8ee] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {success ? (
                            <div className="p-10 sm:p-16 text-center overflow-y-auto custom-scrollbar flex-1">
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/30 text-rose-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-primary/20 border border-primary/30"
                                >
                                    <CheckCircle2 size={44} />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl font-black text-[#f3e8ee] mb-2 tracking-tight uppercase">Sandi Diperbarui!</h2>
                                <p className="text-sm text-rose-200/70 font-medium italic opacity-80">Akses keamanan pengguna telah diperbarui.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                                <div className="flex justify-between items-center mb-6 sm:mb-8">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-3 sm:p-4 bg-primary/20 text-rose-300 rounded-2xl shadow-sm border border-primary/30">
                                            <Key size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-[#ffffff] tracking-tight uppercase">Reset Sandi</h2>
                                            <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1">Keamanan Kontrol</p>
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

                                <div className="p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6 flex items-start gap-3">
                                    <ShieldAlert className="text-amber-300 shrink-0 mt-1" size={16} />
                                    <p className="text-xs text-rose-100 font-semibold leading-relaxed italic">
                                        Anda sedang mereset kata sandi untuk <strong className="text-rose-200">{user?.name}</strong>. Pastikan Anda memberikan sandi baru ini secara aman.
                                    </p>
                                </div>

                                <div className="space-y-4 sm:space-y-5">
                                     <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Kata Sandi Baru</label>
                                        <div className="relative group">
                                            <input 
                                                autoFocus
                                                type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-5 pr-11 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 shadow-sm text-sm"
                                                placeholder="Sandi baru pengguna"
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
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] mt-6 sm:mt-8 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                                >
                                    {loading ? 'MEMPROSES...' : 'GANTI KATA SANDI'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
