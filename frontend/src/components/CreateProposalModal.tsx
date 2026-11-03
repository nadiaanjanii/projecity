'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, CheckCircle2, FileText } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CreateProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: any;
}

export default function CreateProposalModal({ isOpen, onClose, onSuccess, user }: CreateProposalModalProps) {
    const [title, setTitle] = useState('');
    const [clientName, setClientName] = useState('');
    const [category, setCategory] = useState('Web Development');
    const [division, setDivision] = useState('');
    const [divisions, setDivisions] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchDivisions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (user?.role === 'staff') {
            setDivision(user.position || '');
        }
    }, [user]);

    const fetchDivisions = async () => {
        try {
            const response = await api.get('/divisions');
            setDivisions(response.data);
            if ((user?.role === 'manager' || user?.role === 'superadmin') && response.data.length > 0 && !division) {
                setDivision(response.data[0].name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('client_name', clientName);
        formData.append('category', category);
        formData.append('division', division);
        formData.append('file', file);

        try {
            await api.post('/proposals', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
                // Reset form
                setTitle('');
                setClientName('');
                setFile(null);
            }, 1500);
        } catch (error) {
            console.error(error);
            showToast('Gagal mengirim proposal. Silakan coba lagi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-2xl glass rounded-[2.5rem] border border-primary/30 shadow-2xl overflow-hidden bg-[#1c0c16]/95 backdrop-blur-2xl flex flex-col max-h-[90vh]"
                    >
                        {success ? (
                            <div className="p-16 text-center">
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-primary/30 text-rose-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 border border-primary/30"
                                >
                                    <CheckCircle2 size={40} />
                                </motion.div>
                                <h2 className="text-2xl font-black text-[#f3e8ee] mb-2 tracking-tight uppercase">Proposal Terkirim!</h2>
                                <p className="text-rose-200/70 text-sm font-medium italic opacity-80">Proposal Anda telah berhasil diarsipkan ke dalam sistem Projecity.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-8 border-b border-primary/20 flex justify-between items-center bg-[#190a12]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/20 text-rose-300 rounded-xl shadow-sm border border-primary/30">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-[#ffffff] tracking-tight uppercase leading-none">Buat Proposal</h2>
                                            <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1.5">Pengajuan Dokumen Proyek</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={onClose} 
                                        className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-200 hover:text-white transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Judul Proyek</label>
                                            <input 
                                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm placeholder:text-rose-200/70"
                                                placeholder="Contoh: Redesain Website 2024"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Entitas / Nama Klien</label>
                                            <input 
                                                type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm placeholder:text-rose-200/70"
                                                placeholder="Contoh: PT. Global Digital"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Kategori / Jenis Layanan</label>
                                        <select 
                                            value={category} onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold cursor-pointer text-sm shadow-sm"
                                        >
                                            <option value="Web Development" className="bg-[#1c0c16] text-[#ffffff]">🌐 Web Development (Website)</option>
                                            <option value="Aplikasi Mobile" className="bg-[#1c0c16] text-[#ffffff]">📱 Aplikasi Mobile (Apk Android/iOS)</option>
                                            <option value="Branding & Desain" className="bg-[#1c0c16] text-[#ffffff]">🎨 Branding & Desain Grafis</option>
                                            <option value="Digital Marketing" className="bg-[#1c0c16] text-[#ffffff]">🚀 Digital Marketing</option>
                                        </select>
                                    </div>

                                    {(user?.role === 'manager' || user?.role === 'superadmin') && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Tugaskan ke Divisi</label>
                                            <select 
                                                required value={division} onChange={(e) => setDivision(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold cursor-pointer uppercase text-sm shadow-sm appearance-none"
                                            >
                                                {divisions.map((div) => (
                                                    <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#ffffff]">{div.name.toUpperCase()}</option>
                                                ))}
                                                {divisions.length === 0 && <option value="" className="bg-[#1c0c16] text-[#ffffff]">Tidak ada divisi ditemukan</option>}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Berkas Dokumen</label>
                                        <div className="relative group">
                                            <input 
                                                type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full bg-[#190a12] border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-primary/60 group-hover:bg-primary/20 transition-all shadow-inner">
                                                <div className="w-10 h-10 bg-primary/20 text-rose-300 rounded-xl flex items-center justify-center shadow-sm border border-primary/30">
                                                    <Upload size={20} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[11px] font-black text-[#f3e8ee]">
                                                        {file ? file.name : 'Klik untuk unggah atau seret file'}
                                                    </p>
                                                    <p className="text-[8px] text-rose-300/60 uppercase font-black tracking-widest mt-0.5">Maks 50MB (PDF, Word, Gambar)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || !file}
                                            className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 uppercase tracking-widest text-[11px]"
                                        >
                                            {loading ? 'MEMPROSES...' : 'KIRIM PROPOSAL'}
                                            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
