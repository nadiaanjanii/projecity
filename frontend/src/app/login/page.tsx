'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { showToast } = useToast();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Refresh security token on mount and handle registration redirect notice
    useEffect(() => {
        const prepare = async () => {
            try {
                const { getCsrfCookie } = await import('@/lib/api');
                await getCsrfCookie();
            } catch (e) {
                // CSRF might already be set or handled by interceptor
            }
        };
        prepare();

        if (typeof window !== 'undefined' && window.location.search.includes('registered=true')) {
            showToast('Akun berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.', 'success');
        }
    }, [showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setError('');
        
        try {
            await login({ email, password });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Email atau kata sandi salah. Silakan coba lagi.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        showToast('Silakan hubungi Administrator IT untuk mereset kata sandi Anda.', 'info');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full filter blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="glass rounded-[3rem] p-10 md:p-12 shadow-2xl bg-[#1c0c16]/80 backdrop-blur-2xl border border-primary/30">
                    <div className="text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#800020] to-[#a31d36] rounded-3xl shadow-lg shadow-primary/30 mb-8"
                        >
                            <span className="text-white text-4xl font-black">P</span>
                        </motion.div>
                        <h1 className="text-4xl font-black text-[#ffffff] tracking-tight mb-3">
                            Selamat Datang
                        </h1>
                        <p className="text-rose-100 font-semibold italic">Masuk ke ruang kerja Projecity Anda</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-rose-500/15 border border-rose-500/40 text-rose-200 rounded-2xl text-sm font-bold flex items-center gap-3"
                            >
                                <AlertCircle size={18} /> {error}
                            </motion.div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-[#ffffff] ml-1">Alamat Email</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-[#ffffff] placeholder:text-rose-200/70 shadow-sm"
                                    placeholder="nama@perusahaan.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-sm font-bold text-[#ffffff]">Kata Sandi</label>
                                <button 
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-bold text-rose-300 hover:text-white transition-colors"
                                >
                                    Lupa Kata Sandi?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-14 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-[#ffffff] placeholder:text-rose-200/70 shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300/70 hover:text-white transition-colors p-1 rounded-xl"
                                    title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                        >
                            {isSubmitting ? 'Mengautentikasi...' : 'Masuk'}
                            {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-primary/20 text-center">
                        <p className="text-rose-100 text-sm font-semibold">
                            Belum punya akses? <Link href="/register" className="text-rose-300 font-bold hover:text-white underline underline-offset-4">Ajukan akun baru</Link>
                        </p>
                    </div>
                </div>
                
                {/* Branding Footer */}
                <div className="text-center mt-8">
                    <p className="text-rose-200 text-[10px] font-black uppercase tracking-[0.2em]">Dilindungi oleh Infrastruktur Lanjutan Projecity</p>
                </div>
            </motion.div>
        </div>
    );
}

