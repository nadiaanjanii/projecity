'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

interface EditProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    proposal: any;
}

export default function EditProposalModal({ isOpen, onClose, onSuccess, proposal }: EditProposalModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [clientName, setClientName] = useState('');
    const [category, setCategory] = useState('Web Development');
    const [division, setDivision] = useState('');
    const [divisions, setDivisions] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && proposal) {
            setTitle(proposal.title);
            setClientName(proposal.client_name);
            setCategory(proposal.category || 'Web Development');
            setDivision(proposal.division);
            // Notes should always be empty for the new version when the modal opens
            setNotes('');
            setFile(null);
        }
    }, [isOpen, proposal]);

    useEffect(() => {
        if (isOpen) {
            fetchDivisions();
        }
    }, [isOpen]);

    const fetchDivisions = async () => {
        try {
            const response = await api.get('/divisions');
            setDivisions(response.data.divisions || response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('client_name', clientName);
        formData.append('category', category);
        formData.append('division', division);
        formData.append('notes', notes);
        if (file) {
            formData.append('file', file);
        }

        try {
            await api.post(`/proposals/${proposal.id}/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
                setFile(null);
            }, 1500);
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Gagal memperbarui proposal.', 'error');
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
                        animate={{ opacity: 1, scale: 1, y: 0 }}
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
                                <h2 className="text-2xl font-black text-[#f3e8ee] mb-2 tracking-tight uppercase">Update Berhasil!</h2>
                                <p className="text-rose-200/70 text-sm font-medium italic opacity-80">Versi terbaru proposal telah disimpan ke dalam arsip sistem.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-8 border-b border-primary/20 flex justify-between items-center bg-[#190a12]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/20 text-rose-300 rounded-xl shadow-sm border border-primary/30">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-[#ffffff] tracking-tight uppercase leading-none">Edit & Revisi</h2>
                                            <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1.5">Pembaruan Berkas Projecity</p>
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
                                    {/* Rejection Reason - Read Only */}
                                    {proposal.rejection_reason && (
                                        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle size={14} className="text-rose-300" />
                                                <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Catatan Revisi Manager</span>
                                            </div>
                                            <p className="text-sm text-rose-100 font-bold italic leading-relaxed">
                                                "{proposal.rejection_reason}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Judul Proyek</label>
                                            <input 
                                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Entitas Klien</label>
                                            <input 
                                                type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                                                className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm shadow-sm"
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

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Divisi Pengelola</label>
                                        <select 
                                            required 
                                            value={division} 
                                            onChange={(e) => setDivision(e.target.value)}
                                            disabled={user?.role === 'staff'}
                                            className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold cursor-pointer uppercase text-sm shadow-sm appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {divisions.map((div) => (
                                                <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#ffffff]">{div.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        {user?.role === 'staff' && (
                                            <p className="text-[9px] font-bold text-rose-200 italic ml-1 mt-1">
                                                * Divisi terkunci sesuai otoritas akun Anda.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Catatan Perubahan Versi Baru</label>
                                            <span className="text-[8px] font-bold text-rose-100 bg-primary/30 px-2 py-0.5 rounded-full uppercase border border-primary/40">Opsional</span>
                                        </div>
                                        <textarea 
                                            rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Apa yang Anda perbaiki di versi ini? (Contoh: Menambahkan lampiran anggaran)"
                                            className="w-full bg-[#190a12] border border-primary/40 rounded-xl px-5 py-3 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold shadow-sm resize-none text-sm placeholder:text-rose-200/70"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Unggah Versi Baru</label>
                                        <div className="relative group">
                                            <input 
                                                type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full bg-[#190a12] border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-primary/60 group-hover:bg-primary/20 transition-all shadow-inner">
                                                <div className="w-10 h-10 bg-primary/20 text-rose-300 rounded-xl flex items-center justify-center shadow-sm border border-primary/30">
                                                    <Upload size={20} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[11px] font-black text-[#f3e8ee]">
                                                        {file ? file.name : 'Pilih file baru untuk mengganti yang lama'}
                                                    </p>
                                                    <p className="text-[8px] text-rose-300/60 uppercase font-black tracking-widest mt-0.5">Maks 50MB (PDF, Word, Gambar)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[#800020] hover:bg-[#6b001a] text-white font-black py-4 rounded-xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 uppercase tracking-widest text-[11px]"
                                        >
                                            {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                                            <Save size={16} />
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
