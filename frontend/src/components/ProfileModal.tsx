'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Mail, Lock, ShieldCheck, Camera, CheckCircle2, Sparkles, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpdate: (updatedUser: any) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setAvatarPreview(user.avatar_url || null);
        }
        if (!isOpen) {
            setError(null);
            setPassword('');
            setCurrentPassword('');
        }
    }, [user, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (password) {
            formData.append('password', password);
            formData.append('current_password', currentPassword);
        }
        if (avatar) formData.append('avatar', avatar);

        try {
            const response = await api.post('/profile/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSuccess(true);
            
            if (response.data.user) {
                onUpdate(response.data.user);
            }

            setTimeout(() => {
                setSuccess(false);
                setPassword('');
                setCurrentPassword('');
                setAvatar(null);
                onClose();
            }, 2000);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Masalah sinkronisasi. Silakan periksa koneksi Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl bg-[#1c0c16] text-[#f3e8ee] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div 
                                    key="profile-success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-8 sm:p-16 text-center overflow-y-auto custom-scrollbar flex-1"
                                >
                                    <div className="relative inline-block mb-6 sm:mb-8">
                                        <motion.div 
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 10 }}
                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#800020] to-[#a31d36] flex items-center justify-center text-white shadow-xl shadow-primary/30 border border-primary/40"
                                        >
                                            <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14" />
                                        </motion.div>
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                            className="absolute -top-2 -right-2 text-rose-300"
                                        >
                                            <Sparkles size={28} />
                                        </motion.div>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-[#f3e8ee] tracking-tight mb-2 uppercase">Profil Tersinkron</h3>
                                    <p className="text-sm text-rose-200/70 font-medium leading-relaxed italic opacity-80">
                                        Data identitas Anda telah berhasil diperbarui di seluruh jaringan Projecity.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form 
                                    key="profile-form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit} 
                                    className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1"
                                >
                                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="p-3 bg-primary/20 text-rose-300 rounded-xl shadow-sm border border-primary/30">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-black text-[#f3e8ee] tracking-tight uppercase">Profil {user?.role === 'manager' ? 'Manajer' : 'Staf'}</h2>
                                                <p className="text-[9px] font-black text-rose-300/70 uppercase tracking-widest mt-1">Pengaturan Identitas</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={onClose} 
                                            className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-300/70 hover:text-white transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm"
                                        >
                                            <AlertCircle size={18} className="shrink-0" />
                                            <p>{error}</p>
                                        </motion.div>
                                    )}

                                    {/* Main Form Content: Side-by-Side on Tablet/Desktop, Stacks on Mobile */}
                                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start mb-6 sm:mb-8">
                                        {/* Avatar Section */}
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="relative group">
                                                <motion.div 
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl overflow-hidden border-4 border-[#140810] shrink-0 bg-gradient-to-br ${
                                                        user?.role === 'superadmin' 
                                                            ? 'from-[#4a0013] to-primary shadow-primary/30' 
                                                            : user?.role === 'manager' 
                                                            ? 'from-primary to-[#a31d36] shadow-rose-950/30' 
                                                            : 'from-[#4d1927] to-[#800020] shadow-rose-950/30'
                                                    }`}
                                                >
                                                    {avatarPreview ? (
                                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        (name?.[0] || 'U').toUpperCase()
                                                    )}
                                                </motion.div>
                                                <button 
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute -bottom-1 -right-1 p-2.5 bg-[#800020] hover:bg-[#6b001a] text-white rounded-xl shadow-xl shadow-primary/30 transition-all active:scale-90 flex items-center justify-center border-2 border-[#140810]"
                                                >
                                                    <Camera size={14} />
                                                </button>
                                                <input 
                                                    type="file" ref={fileInputRef} onChange={handleFileChange} 
                                                    className="hidden" accept="image/*"
                                                />
                                            </div>
                                            <p className="text-[10px] text-rose-200 uppercase font-black tracking-[0.2em] mt-3.5 whitespace-nowrap">Token Identitas Visual</p>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="flex-1 w-full space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all">
                                                        <User size={16} />
                                                    </div>
                                                    <input 
                                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                                        className="w-full bg-[#190a12] border border-primary/40 rounded-xl pl-12 pr-4 py-3 text-sm text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all">
                                                        <Mail size={16} />
                                                    </div>
                                                    <input 
                                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full bg-[#190a12] border border-primary/40 rounded-xl pl-12 pr-4 py-3 text-sm text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                             <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Sandi Baru (Opsional)</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all">
                                                        <Lock size={16} />
                                                    </div>
                                                    <input 
                                                        type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full bg-[#190a12] border border-primary/40 rounded-xl pl-12 pr-11 py-3 text-sm text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold shadow-sm placeholder:text-rose-200/70"
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

                                            {password && (
                                                <div className="space-y-1.5 animate-fadeIn">
                                                    <label className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] ml-1">Sandi Saat Ini (Wajib Jika Ubah Sandi)</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-all">
                                                            <Lock size={16} />
                                                        </div>
                                                        <input 
                                                            type={showCurrentPassword ? 'text' : 'password'} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                                            className="w-full bg-[#190a12] border border-rose-500/50 rounded-xl pl-12 pr-11 py-3 text-sm text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all font-bold shadow-sm placeholder:text-rose-200/70"
                                                            placeholder="Masukkan kata sandi lama Anda"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300/70 hover:text-white transition-colors p-1 rounded-xl"
                                                            title={showCurrentPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                                                        >
                                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] mt-2 sm:mt-4 flex items-center justify-center gap-3 group disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>MENYINKRONKAN...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span>SIMPAN IDENTITAS</span>
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
