'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, AlertCircle, ArrowRight, Clock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import api, { getCsrfCookie } from '@/lib/api';


export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [role, setRole] = useState('staff');
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [divisions, setDivisions] = useState<any[]>([]);
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const divRes = await api.get('/divisions/public');
            const roleRes = await api.get('/roles/public');
            setDivisions(divRes.data);
            setAvailableRoles(roleRes.data);
            if (roleRes.data.length > 0) {
                // Set default role to 'staff' if exists, otherwise first one
                const staffRole = roleRes.data.find((r: any) => r.name === 'staff');
                setRole(staffRole ? 'staff' : roleRes.data[0].name);
            }
        } catch (err) {
            console.error('Failed to fetch initial data:', err);
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        if (password !== password_confirmation) {
            setError('Kata sandi tidak cocok');
            setIsSubmitting(false);
            return;
        }

        if (role !== 'manager' && !position) {
            setError('Silakan pilih divisi Anda');
            setIsSubmitting(false);
            return;
        }

        try {
            await getCsrfCookie();
            
            await api.post('/register', {
                name,
                email,
                position: role === 'manager' ? 'Administrator' : position,
                password,
                password_confirmation,
                role
            });

            window.location.href = '/login?registered=true';
        } catch (err: any) {
            if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                if (errors) {
                    const firstError = Object.values(errors)[0] as string[];
                    setError(firstError[0]);
                } else {
                    setError(err.response.data.message || 'Data tidak valid.');
                }
            } else {
                setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[3rem] p-10 md:p-14 border border-primary/30 text-center max-w-md bg-[#1c0c16]/90 shadow-2xl">
                    <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/30">
                        <Clock className="text-rose-300" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-[#f3e8ee] mb-4">Menunggu Verifikasi</h2>
                    <p className="text-rose-200/70 font-medium mb-10 leading-relaxed">{successMessage}</p>
                    <Link href="/login" className="inline-block bg-[#800020] hover:bg-[#6b001a] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-primary/30">
                        Kembali ke Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 py-20">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/15 rounded-full filter blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full filter blur-[120px] animate-pulse animation-delay-2000"></div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[500px] relative z-10">
                <div className="glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-2xl border border-primary/30 bg-[#1c0c16]/80 backdrop-blur-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#800020] to-[#a31d36] rounded-3xl shadow-lg shadow-primary/30 mb-8">
                            <span className="text-white text-4xl font-black">P</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#ffffff] tracking-tight mb-3">Gabung Projecity</h1>
                        <p className="text-rose-100 font-semibold italic">Mulai perjalanan manajemen Anda hari ini.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-rose-500/15 border border-rose-500/40 text-rose-200 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <AlertCircle size={18} /> {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-[#ffffff] ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-14 pr-5 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 shadow-sm"
                                    placeholder="Nama lengkap Anda"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-[#ffffff] ml-1">Alamat Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-14 pr-5 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 shadow-sm"
                                    placeholder="nama@perusahaan.com"
                                />
                            </div>
                        </div>

                        <div className={`grid gap-4 ${role !== 'manager' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-[#ffffff] ml-1">Peran Akun</label>
                                <select 
                                    value={role} onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-[#190a12] border border-primary/40 rounded-2xl px-5 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold cursor-pointer uppercase shadow-sm"
                                >
                                    {loadingRoles ? (
                                        <option className="bg-[#1c0c16] text-[#ffffff]">Memuat...</option>
                                    ) : (
                                        availableRoles.map(r => (
                                            <option key={r.id} value={r.name} className="bg-[#1c0c16] text-[#ffffff]">
                                                {r.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {role !== 'manager' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[#ffffff] ml-1">Divisi</label>
                                    <select 
                                        required value={position} onChange={(e) => setPosition(e.target.value)}
                                        className="w-full bg-[#190a12] border border-primary/40 rounded-2xl px-5 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold cursor-pointer uppercase shadow-sm"
                                    >
                                        <option value="" disabled className="bg-[#1c0c16] text-rose-200 normal-case">Pilih Divisi</option>
                                        {divisions.map(div => <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#ffffff] uppercase">{div.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-[#ffffff] ml-1">Kata Sandi</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-11 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 shadow-sm"
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
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-[#ffffff] ml-1">Konfirmasi</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        type={showPasswordConfirm ? 'text' : 'password'} required value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full bg-[#190a12] border border-primary/40 rounded-2xl pl-12 pr-11 py-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold placeholder:text-rose-200/70 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300/70 hover:text-white transition-colors p-1 rounded-xl"
                                        title={showPasswordConfirm ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                                    >
                                        {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 group disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                            {isSubmitting ? 'Memproses...' : 'Buat Akun'}
                            {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 text-center border-t border-primary/20 pt-8">
                        <p className="text-rose-100 font-bold">
                            Sudah punya akun? <Link href="/login" className="text-rose-300 font-bold hover:text-white underline underline-offset-4">Masuk di sini</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
