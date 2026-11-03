'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Printer, Check, X, MessageSquare, Clock, AlertCircle, FileText as FileIcon, Edit3, Trash2, CheckCircle2, Eye, Layers, Tag, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import EditProposalModal from '@/components/EditProposalModal';
import ConfirmModal from '@/components/ConfirmModal';
import ProposalComments from '@/components/ProposalComments';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export default function ProposalsPage() {
    const { user } = useAuth();

    const hasPermission = (perm: string) => {
        if (!user) return false;
        return user.all_permissions?.includes(perm) ?? false;
    };
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [divisionFilter, setDivisionFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [divisions, setDivisions] = useState<any[]>([]);
    
    // Modal states
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{type: 'delete' | 'verify' | 'unverify' | 'reject', id: number} | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'discussion' | 'history'>('discussion');

    // Document Preview States
    const [excelData, setExcelData] = useState<any[][]>([]);
    const [wordHtml, setWordHtml] = useState<string>('');
    const [isParsingDoc, setIsParsingDoc] = useState(false);

    const parseExcel = async (url: string) => {
        setIsParsingDoc(true);
        setExcelData([]);
        try {
            const response = await api.get(url, { responseType: 'arraybuffer' });
            const data = new Uint8Array(response.data);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setExcelData(jsonData as any[][]);
        } catch (error) {
            console.error('Excel parse error:', error);
        } finally {
            setIsParsingDoc(false);
        }
    };

    const parseWord = async (url: string) => {
        setIsParsingDoc(true);
        setWordHtml('');
        try {
            const response = await api.get(url, { responseType: 'arraybuffer' });
            const result = await mammoth.convertToHtml({ arrayBuffer: response.data });
            setWordHtml(result.value);
        } catch (error) {
            console.error('Word parse error:', error);
        } finally {
            setIsParsingDoc(false);
        }
    };

    useEffect(() => {
        if (isPreviewOpen && selectedProposal) {
            const path = selectedProposal.file_path.toLowerCase();
            const proxyUrl = `/proposals/file-proxy?path=${selectedProposal.file_path}`;
            if (path.match(/\.(xls|xlsx)$/)) {
                parseExcel(proxyUrl);
            } else if (path.match(/\.(doc|docx)$/)) {
                parseWord(proxyUrl);
            }
        } else {
            setExcelData([]);
            setWordHtml('');
        }
    }, [isPreviewOpen, selectedProposal]);

    const fetchProposals = async () => {
        try {
            const res = await api.get('/proposals', {
                params: {
                    search,
                    status: statusFilter,
                    division: divisionFilter,
                    category: categoryFilter,
                    date_from: dateFrom,
                    date_to: dateTo
                }
            });
            setProposals(res.data.proposals);
        } catch (error: any) {
            // Silently handle error
        } finally {
            setLoading(false);
        }
    };

    const fetchDivisions = async () => {
        try {
            const res = await api.get('/divisions');
            setDivisions(res.data.divisions || res.data);
        } catch (error: any) {
            // Silently handle error
        }
    };

    useEffect(() => {
        if (user) {
            fetchProposals();
        }
    }, [user, search, statusFilter, divisionFilter, categoryFilter, dateFrom, dateTo]);

    const searchParams = useSearchParams();

    useEffect(() => {
        if (user) {
            fetchDivisions();
        }
    }, [user]);

    useEffect(() => {
        const querySearch = searchParams?.get('search');
        if (querySearch !== null && querySearch !== undefined) {
            setSearch(querySearch);
        }
    }, [searchParams]);

    const handleClosePreviewModal = () => {
        setIsPreviewOpen(false);
        setSelectedProposal(null);
        if (typeof window !== 'undefined' && window.location.search.includes('openModal')) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    useEffect(() => {
        const openId = searchParams?.get('openModal');
        if (openId && proposals.length > 0) {
            const found = proposals.find(p => p.id === parseInt(openId));
            if (found) {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                const storageBase = process.env.NEXT_PUBLIC_STORAGE_URL || apiBase.replace('/api', '/storage');
                setPreviewUrl(`${storageBase}/${found.file_path}`);
                setSelectedProposal(found);
                setActiveTab('discussion');
                setIsPreviewOpen(true);
                if (typeof window !== 'undefined') {
                    window.history.replaceState(null, '', window.location.pathname);
                }
            }
        }
    }, [searchParams, proposals]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        setActionLoading(true);
        try {
            if (confirmAction.type === 'delete') {
                await api.delete(`/proposals/${confirmAction.id}`);
                setProposals(prev => prev.filter(p => p.id !== confirmAction.id));
                showToast('Proposal dihapus secara permanen');
            } else if (confirmAction.type === 'verify') {
                await api.post(`/proposals/${confirmAction.id}/verify`);
                setProposals(prev => prev.map(p => p.id === confirmAction.id ? { ...p, status: 'VERIFIED' } : p));
                showToast('Proposal berhasil diverifikasi');
            } else if (confirmAction.type === 'unverify') {
                await api.post(`/proposals/${confirmAction.id}/unverify`);
                setProposals(prev => prev.map(p => p.id === confirmAction.id ? { ...p, status: 'PENDING' } : p));
                showToast('Verifikasi proposal berhasil dibatalkan');
            }
            fetchProposals();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Kesalahan sistem. Silakan coba lagi.';
            showToast(message, 'error');
        } finally {
            setActionLoading(false);
            setIsConfirmOpen(false);
            setConfirmAction(null);
        }
    };

    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [revisionReason, setRevisionReason] = useState('');
    const [revisionId, setRevisionId] = useState<number | null>(null);

    const handleReject = async () => {
        if (!revisionId || !revisionReason) return;
        setActionLoading(true);
        try {
            await api.post(`/proposals/${revisionId}/reject`, { reason: revisionReason });
            showToast('Catatan revisi berhasil dikirim');
            setIsRevisionModalOpen(false);
            setRevisionReason('');
            setRevisionId(null);
            fetchProposals();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Gagal mengirim catatan', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ⚡ [NO 27] CARI NAMA PEMBUAT (FRONTEND)
    const filteredProposals = proposals.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.user?.name && p.user.name.toLowerCase().includes(search.toLowerCase()))
    );

    // ⚡ [NO 28] GANTI WARNA BADGE PENDING
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black';
            case 'REJECTED': return 'bg-rose-500/20 text-rose-200 border-rose-500/40 font-black';
            default: return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <Check size={12} />;
            case 'REJECTED': return <AlertCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'TERVERIFIKASI';
            case 'REJECTED': return 'PERLU REVISI';
            default: return 'MENUNGGU';
        }
    };

    const canViewProposals = hasPermission('lihat proposal');

    if (loading) return (
        <div className="py-20 text-center text-slate-500 font-bold italic">Memindai proposal ruang kerja...</div>
    );

    if (!canViewProposals) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-background rounded-[3rem] border border-primary/30 shadow-lg">
                <div className="w-24 h-24 bg-rose-500/15 rounded-full flex items-center justify-center text-rose-300 mb-6 border border-rose-500/30 shadow-sm">
                    <FileIcon size={48} />
                </div>
                <h2 className="text-4xl font-black text-[#ffffff] mb-3 tracking-tight">Akses Terbatas</h2>
                <p className="text-rose-100 max-w-md mx-auto text-lg leading-relaxed font-medium">
                    Halaman ini memerlukan otoritas Manajemen Proposal. Silakan hubungi Super Admin untuk mendapatkan akses melihat dokumen.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Toast System */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-10 left-1/2 z-[300] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 glass border ${toast.type === 'success' ? 'border-emerald-500/30 bg-[#1c0c16]' : 'border-rose-500/30 bg-[#1c0c16]'}`}
                    >
                        <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-[#800020] text-white' : 'bg-rose-600 text-white'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <span className="font-bold text-[#f3e8ee] text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-[#ffffff] tracking-tight">Manajemen Proposal</h2>
                    <p className="text-rose-100 font-semibold text-sm mt-1">
                        Tinjau, verifikasi, dan kelola alur pengajuan proposal proyek.
                    </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-start xl:justify-end gap-3 shrink-0">
                    {hasPermission('ekspor pdf') && (
                        <button 
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (search) params.append('search', search);
                                if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
                                const div = user?.role === 'staff' ? user.position : divisionFilter;
                                if (div && div !== 'ALL') params.append('division', div);
                                if (categoryFilter && categoryFilter !== 'ALL') params.append('category', categoryFilter);
                                if (dateFrom) params.append('date_from', dateFrom);
                                if (dateTo) params.append('date_to', dateTo);
                                const token = localStorage.getItem('token');
                                if (token) params.append('token', token);

                                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                                const queryString = params.toString();
                                window.open(`${baseUrl}/proposals/export-pdf${queryString ? '?' + queryString : ''}`, '_blank');
                            }}
                            className="flex items-center gap-2 px-4 py-3 bg-[#800020] hover:bg-[#6b001a] text-white rounded-2xl border border-primary/40 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                        >
                            <Printer size={16} />
                            <span>Ekspor PDF (Kop & Pengesahan)</span>
                        </button>
                    )}
                    {hasPermission('ekspor csv') && (
                        <button 
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (search) params.append('search', search);
                                if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
                                const div = user?.role === 'staff' ? user.position : divisionFilter;
                                if (div && div !== 'ALL') params.append('division', div);
                                if (categoryFilter && categoryFilter !== 'ALL') params.append('category', categoryFilter);
                                if (dateFrom) params.append('date_from', dateFrom);
                                if (dateTo) params.append('date_to', dateTo);
                                const token = localStorage.getItem('token');
                                if (token) params.append('token', token);

                                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                                const queryString = params.toString();
                                window.open(`${baseUrl}/proposals/export${queryString ? '?' + queryString : ''}`, '_blank');
                            }}
                            className="flex items-center gap-2 px-4 py-3 bg-[#1c0c16] hover:bg-primary/20 text-[#ffffff] rounded-2xl border border-primary/30 font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            <Download size={16} className="text-rose-300" />
                            <span>Ekspor Excel (CSV)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass rounded-[2.5rem] border border-primary/30 p-8 space-y-6 bg-[#1c0c16]/80 shadow-lg">
                {search && (
                    <div className="flex items-center justify-between p-4 bg-primary/20 rounded-2xl border border-primary/30 text-rose-200">
                        <span className="text-xs font-bold flex items-center gap-2">
                            <Search size={16} className="text-rose-300" /> Kata Kunci Pencarian: <strong className="text-white">"{search}"</strong>
                        </span>
                        <button 
                            onClick={() => {
                                setSearch('');
                                window.history.replaceState(null, '', '/dashboard/proposals');
                            }}
                            className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 hover:bg-rose-500 px-3 py-1.5 rounded-xl transition-all text-white"
                        >
                            Reset Pencarian ✕
                        </button>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4 w-full">
                        <div className="flex flex-col gap-1.5 flex-1 sm:flex-initial min-w-[140px]">
                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Status</span>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-[#190a12] border border-primary/30 rounded-2xl py-3.5 px-6 text-[#ffffff] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                            >
                                <option value="ALL" className="bg-[#1c0c16] text-[#ffffff]">Semua Status</option>
                                <option value="PENDING" className="bg-[#1c0c16] text-[#ffffff]">Menunggu</option>
                                <option value="VERIFIED" className="bg-[#1c0c16] text-[#ffffff]">Terverifikasi</option>
                                <option value="REJECTED" className="bg-[#1c0c16] text-[#ffffff]">Revisi</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 sm:flex-initial min-w-[140px]">
                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Divisi</span>
                            <select 
                                value={user?.role === 'staff' ? user.position : divisionFilter}
                                onChange={(e) => user?.role !== 'staff' && setDivisionFilter(e.target.value)}
                                disabled={user?.role === 'staff'}
                                className="w-full bg-[#190a12] border border-primary/30 rounded-2xl py-3.5 px-6 text-[#ffffff] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {user?.role !== 'staff' && <option value="ALL" className="bg-[#1c0c16] text-[#ffffff]">Semua Divisi</option>}
                                {user?.role === 'staff' ? (
                                    <option value={user.position} className="bg-[#1c0c16] text-[#ffffff]">{user.position}</option>
                                ) : (
                                    divisions?.map((div) => (
                                        <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#ffffff]">{div.name}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 sm:flex-initial min-w-[160px]">
                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Layanan</span>
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full bg-[#190a12] border border-primary/30 rounded-2xl py-3.5 px-6 text-[#f3e8ee] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                            >
                                <option value="ALL" className="bg-[#1c0c16] text-[#f3e8ee]">Semua Layanan</option>
                                <option value="Web Development" className="bg-[#1c0c16] text-[#f3e8ee]">Web Development</option>
                                <option value="Aplikasi Mobile" className="bg-[#1c0c16] text-[#f3e8ee]">Aplikasi Mobile (Apk)</option>
                                <option value="Branding & Desain" className="bg-[#1c0c16] text-[#f3e8ee]">Branding & Desain</option>
                                <option value="Digital Marketing" className="bg-[#1c0c16] text-[#f3e8ee]">Digital Marketing</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tag / Category Quick Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-primary/20">
                    <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest mr-2 flex items-center gap-1.5">
                        <Tag size={12} className="text-rose-300" /> Filter Tag / Kategori:
                    </span>
                    {[
                        { label: 'Semua', value: 'ALL' },
                        { label: '🌐 Web Development', value: 'Web Development' },
                        { label: '📱 Aplikasi Mobile', value: 'Aplikasi Mobile' },
                        { label: '🎨 Branding & Desain', value: 'Branding & Desain' },
                        { label: '🚀 Digital Marketing', value: 'Digital Marketing' }
                    ].map((tag) => (
                        <button
                            key={tag.value}
                            onClick={() => setCategoryFilter(tag.value)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border cursor-pointer ${
                                categoryFilter === tag.value 
                                    ? 'bg-[#800020] text-white border-primary shadow-md shadow-primary/30 ring-2 ring-primary/40' 
                                    : 'bg-[#190a12] text-rose-100 border-primary/30 hover:bg-primary/20 hover:text-white'
                            }`}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-primary/20">
                    <div className="flex flex-wrap items-center gap-4 w-full">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1 whitespace-nowrap">Dari:</span>
                            <input 
                                type="date" 
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-[#190a12] border border-primary/30 rounded-xl py-2 px-4 text-[#ffffff] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest whitespace-nowrap">Sampai:</span>
                            <input 
                                type="date" 
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-[#190a12] border border-primary/30 rounded-xl py-2 px-4 text-[#f3e8ee] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all [color-scheme:dark]"
                            />
                        </div>
                        {(dateFrom || dateTo || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || (user?.role !== 'staff' && divisionFilter !== 'ALL') || search) && (
                            <button 
                                onClick={() => { 
                                    setDateFrom(''); 
                                    setDateTo(''); 
                                    setStatusFilter('ALL');
                                    setCategoryFilter('ALL');
                                    setDivisionFilter('ALL');
                                    setSearch('');
                                    if (typeof window !== 'undefined') window.history.replaceState(null, '', '/dashboard/proposals');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                            >
                                <X size={12} /> Reset Semua Filter
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredProposals.map((proposal) => (
                         <motion.div 
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass border border-primary/30 p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-primary/50 transition-all group bg-[#1c0c16]/80 shadow-lg"
                        >
                            <div className="flex-1 min-w-0 flex items-center gap-4 sm:gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${
                                    proposal.file_path.toLowerCase().endsWith('.pdf') ? 'bg-rose-500/20 text-rose-400' :
                                    proposal.file_path.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'bg-primary/20 text-rose-300' :
                                    proposal.file_path.toLowerCase().endsWith('.mp4') ? 'bg-primary/20 text-rose-300' :
                                    'bg-primary/20 text-rose-300'
                                }`}>
                                    <FileIcon size={32} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-black text-xl text-[#f3e8ee] truncate max-w-[200px] sm:max-w-none">{proposal.title}</h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shrink-0 ${getStatusStyle(proposal.status)}`}>
                                            {getStatusIcon(proposal.status)}
                                            {getStatusLabel(proposal.status)}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCategoryFilter(proposal.category || 'Web Development');
                                            }}
                                            title="Klik untuk memfilter kategori ini"
                                            className="px-3 py-1 rounded-full bg-primary/20 hover:bg-primary/40 text-rose-300 border border-primary/30 text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5 group/tag"
                                        >
                                            <Tag size={10} className="text-rose-400 group-hover/tag:scale-110 transition-transform" />
                                            {proposal.category || 'Web Development'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-semibold text-rose-100">
                                        <span className="text-[#ffffff] shrink-0 font-bold">Klien: {proposal.client_name}</span>
                                        <span className="text-rose-300 font-bold truncate max-w-[120px] sm:max-w-none">Divisi: {proposal.division}</span>
                                        <span className="text-rose-200 shrink-0 font-medium">{new Date(proposal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        {proposal.user && (
                                            <span className="text-rose-200 font-bold shrink-0">Oleh: {proposal.user.name}</span>
                                        )}
                                    </div>
                                    
                                      {proposal.status === 'REJECTED' && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="mt-4 p-5 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-[2rem] max-w-2xl relative overflow-hidden group/note"
                                        >
                                            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                <p className="text-[9px] uppercase font-bold text-rose-400 tracking-wider">Alasan Penolakan Manager</p>
                                            </div>
                                            <p className="text-sm text-rose-200 font-bold italic leading-relaxed pl-3.5 relative z-10">
                                                "{proposal.rejection_reason}"
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Staff Revision Notes */}
                                    {proposal.status === 'PENDING' && proposal.versions && proposal.versions.length > 1 && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="mt-4 p-5 bg-primary/15 border-l-4 border-primary rounded-r-[2rem] max-w-2xl relative overflow-hidden group/note"
                                        >
                                            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                <p className="text-[9px] uppercase font-bold text-rose-300 tracking-wider">Catatan Perbaikan dari Staf</p>
                                            </div>
                                            <p className="text-sm text-[#f3e8ee] font-bold italic leading-relaxed pl-3.5 relative z-10">
                                                "{proposal.versions[0]?.notes || 'Telah diperbarui ke versi terbaru untuk ditinjau kembali.'}"
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 border-primary/20 pt-4 lg:pt-0 justify-between lg:justify-end">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => {
                                            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                                            const storageBase = process.env.NEXT_PUBLIC_STORAGE_URL || apiBase.replace('/api', '/storage');
                                            setPreviewUrl(`${storageBase}/${proposal.file_path}`);
                                            setSelectedProposal(proposal);
                                            setIsPreviewOpen(true);
                                        }}
                                        className="p-4 bg-primary/20 hover:bg-primary text-rose-300 hover:text-white rounded-2xl border border-primary/30 transition-all group/btn shrink-0 shadow-sm"
                                        title="Pratinjau File"
                                    >
                                        <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                                            const storageBase = process.env.NEXT_PUBLIC_STORAGE_URL || apiBase.replace('/api', '/storage');
                                            setPreviewUrl(`${storageBase}/${proposal.file_path}`);
                                            setSelectedProposal(proposal);
                                            setActiveTab('discussion');
                                            setIsPreviewOpen(true);
                                        }}
                                        className="px-4 py-3 bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white rounded-2xl border border-rose-500/30 transition-all font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm"
                                        title="Buka Ruang Diskusi File Ini"
                                    >
                                        <MessageSquare size={16} className="text-rose-300" />
                                        <span>Diskusi {proposal.comments_count ? `(${proposal.comments_count})` : ''}</span>
                                    </button>
                                    {hasPermission('download proposal') && (
                                        <a 
                                            href={`${process.env.NEXT_PUBLIC_STORAGE_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '/storage') : 'http://127.0.0.1:8000/storage')}/${proposal.file_path}`}
                                            download
                                            className="p-4 bg-[#190a12] hover:bg-primary/20 rounded-2xl text-rose-300/70 hover:text-white transition-all border border-primary/30 group/btn shrink-0 shadow-sm"
                                            title="Unduh Proposal"
                                        >
                                            <Download size={20} className="group-hover/btn:scale-110 transition-transform" />
                                        </a>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 border-l-0 lg:border-l border-primary/20 pl-0 lg:pl-4 shrink-0">
                                    {(user?.role === 'superadmin' || user?.role === 'manager' || hasPermission('verifikasi proposal')) && proposal.status === 'PENDING' && (
                                        <div className="flex items-center gap-2">
                                            {hasPermission('verifikasi proposal') && (
                                                <button 
                                                    onClick={() => {
                                                        setConfirmAction({ type: 'verify', id: proposal.id });
                                                        setIsConfirmOpen(true);
                                                    }}
                                                    className="h-12 sm:h-14 px-3 sm:px-5 bg-primary/20 hover:bg-primary text-rose-300 hover:text-white rounded-2xl border border-primary/40 font-black text-[9px] sm:text-[10px] transition-all flex items-center gap-1.5 sm:gap-2 uppercase tracking-[0.1em] sm:tracking-[0.2em] group/verify shadow-sm"
                                                >
                                                    <Check size={14} className="group-hover/verify:scale-110 transition-transform" /> 
                                                    {/* 🎯 [LIVE CODING - LABEL VERIFIKASI] Ubah teks 'Verifikasi' / 'Setujui' di sini */}
                                                    <span>Verifikasi</span>
                                                </button>
                                            )}
                                            {hasPermission('tolak proposal') && (
                                                <button 
                                                    onClick={() => {
                                                        setRevisionId(proposal.id);
                                                        setIsRevisionModalOpen(true);
                                                    }}
                                                    className="h-12 sm:h-14 px-3 sm:px-5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-2xl border border-rose-500/30 font-black text-[9px] sm:text-[10px] transition-all flex items-center gap-1.5 sm:gap-2 uppercase tracking-[0.1em] sm:tracking-[0.2em] group/reject shadow-sm"
                                                >
                                                    <X size={14} className="group-hover/reject:scale-110 transition-transform" /> 
                                                    {/* 🎯 [LIVE CODING - LABEL TOLAK] Ubah teks 'Tolak' / 'Revisi' di sini */}
                                                    <span>Tolak</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                        {/* ⚡ [LIVE CODING] WARNA TOMBOL BATAL VERIFIKASI (amber = kuning, blue = biru) */}
                                    {(user?.role === 'superadmin' || user?.role === 'manager' || hasPermission('batal verifikasi') || hasPermission('verifikasi proposal')) && proposal.status === 'VERIFIED' && (
                                        <button 
                                            onClick={() => {
                                                setConfirmAction({ type: 'unverify', id: proposal.id });
                                                setIsConfirmOpen(true);
                                            }}
                                            className="h-12 sm:h-14 px-3 sm:px-4 bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-2xl border border-amber-500/30 font-black text-[9px] sm:text-[10px] transition-all flex items-center gap-1.5 sm:gap-2 uppercase tracking-[0.1em] group/unverify shadow-sm"
                                            title="Batalkan verifikasi dan kembalikan ke status PENDING"
                                        >
                                            <RotateCcw size={14} className="group-hover/unverify:-rotate-90 transition-transform" />
                                            {/* ⚡ [LIVE CODING] LABEL BATAL VERIFIKASI */}
                                            <span>Batal Verifikasi</span>
                                        </button>
                                    )}

                                    {hasPermission('edit proposal') && (user?.role === 'superadmin' || user?.role === 'manager' || (user?.role === 'staff' && proposal.division === user.position)) && (
                                        <button 
                                            onClick={() => {
                                                setSelectedProposal(proposal);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-3 sm:p-4 bg-primary/20 hover:bg-primary text-rose-300 hover:text-white rounded-2xl border border-primary/30 transition-all group/btn shadow-sm"
                                            title="Edit Proposal"
                                        >
                                            <Edit3 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    )}

                                    {/* [NO 26 PENGINGAT] Staff tidak boleh menghapus proposal yang sudah VERIFIED */}
                                    {hasPermission('hapus proposal') && (user?.role === 'superadmin' || user?.role === 'manager' || (user?.role === 'staff' && proposal.division === user.position && proposal.status !== 'VERIFIED')) && (
                                        <button 
                                            onClick={() => {
                                                setConfirmAction({ type: 'delete', id: proposal.id });
                                                setIsConfirmOpen(true);
                                            }}
                                            className="p-3 sm:p-4 bg-[#190a12] hover:bg-rose-600 text-rose-300/70 hover:text-white rounded-2xl transition-all border border-primary/30 group/btn shadow-sm"
                                            title="Hapus Proposal"
                                        >
                                            <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <EditProposalModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    fetchProposals();
                    showToast('Proposal berhasil diperbarui');
                }}
                proposal={selectedProposal}
            />

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmAction}
                title={
                    confirmAction?.type === 'delete' ? 'Hapus Proposal?' : 
                    confirmAction?.type === 'unverify' ? 'Batalkan Verifikasi Proposal?' : 
                    'Verifikasi Proposal?'
                }
                message={
                    confirmAction?.type === 'delete' 
                        ? 'Apakah Anda yakin? Dokumen ini akan dihapus secara permanen dari ruang kerja dan tidak dapat dikembalikan.' 
                        : confirmAction?.type === 'unverify'
                        ? 'Apakah Anda yakin ingin membatalkan verifikasi proposal ini? Status akan dikembalikan menjadi PENDING.'
                        : 'Ini akan menandai proposal sebagai dokumen resmi. Lanjutkan?'
                }
                confirmText={
                    confirmAction?.type === 'delete' ? 'Hapus Permanen' : 
                    confirmAction?.type === 'unverify' ? 'Ya, Batal Verifikasi' : 
                    'Ya, Verifikasi'
                }
                type={
                    confirmAction?.type === 'delete' ? 'danger' : 
                    confirmAction?.type === 'unverify' ? 'warning' : 
                    'info'
                }
                loading={actionLoading}
            />

            {/* Revision / Reject Modal */}
            <AnimatePresence>
                {isRevisionModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsRevisionModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 bg-[#1c0c16] p-6 sm:p-8 md:p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-6 sm:mb-8 shrink-0">
                                <div className="p-3 sm:p-4 bg-primary/20 text-rose-300 rounded-2xl shadow-sm">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#f3e8ee] tracking-tight">Kecerdasan Revisi</h3>
                                    <p className="text-rose-200/70 text-xs sm:text-sm font-medium">Berikan umpan balik yang jelas untuk anggota staf.</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-3 flex-1 flex flex-col">
                                    <label className="text-[10px] font-black text-rose-300/70 uppercase tracking-[0.2em] ml-1 shrink-0">Catatan Revisi / Alasan</label>
                                    <textarea 
                                        rows={5}
                                        value={revisionReason}
                                        onChange={(e) => setRevisionReason(e.target.value)}
                                        placeholder="Contoh: Mohon perbarui bagian anggaran di halaman 3..."
                                        className="w-full flex-1 min-h-[120px] bg-[#190a12] border border-primary/30 rounded-2xl p-4 sm:p-6 text-sm font-bold text-[#f3e8ee] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none placeholder:text-rose-300/30"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 shrink-0">
                                    <button 
                                        onClick={() => setIsRevisionModalOpen(false)}
                                        className="bg-[#140810] hover:bg-primary/20 text-rose-300/80 hover:text-white py-4 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs border border-primary/20"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={handleReject}
                                        disabled={actionLoading || !revisionReason}
                                        className="bg-[#800020] hover:bg-[#6b001a] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading ? 'MENGIRIM...' : 'KIRIM REVISI'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PDF Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300]" onClick={handleClosePreviewModal} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                             className="fixed inset-4 md:inset-10 z-[301] flex flex-col glass rounded-[2rem] md:rounded-[3rem] border border-primary/30 overflow-hidden shadow-2xl bg-[#1c0c16]"
                        >
                            <div className="p-4 sm:p-6 border-b border-primary/20 flex items-center justify-between bg-[#190a12]/90 backdrop-blur-xl">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2.5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30 shrink-0">
                                        <FileIcon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-[#f3e8ee] uppercase tracking-widest text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{selectedProposal?.title || 'Pratinjau Proposal'}</h3>
                                        <p className="text-[9px] font-black text-rose-300/70 uppercase tracking-[0.2em] truncate">{selectedProposal?.client_name}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-2 sm:gap-4">
                                    <a 
                                        href={previewUrl}
                                        download
                                        className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/20 hover:bg-primary text-rose-300 hover:text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-primary/30 shrink-0"
                                    >
                                        <Download size={12} /> <span className="hidden xs:inline">Unduh File</span>
                                    </a>
                                    <button 
                                        onClick={handleClosePreviewModal}
                                        className="p-2.5 hover:bg-primary/20 rounded-2xl text-rose-300 hover:text-white transition-all bg-[#140810] shrink-0 border border-primary/20"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                                {/* PDF Viewer */}
                                 <div className="h-[350px] sm:h-[450px] lg:h-auto lg:flex-[2] bg-[#140810] relative overflow-hidden border-b lg:border-b-0 lg:border-r border-primary/20">
                                    {(() => {
                                        const path = selectedProposal?.file_path.toLowerCase() || '';
                                        if (path.endsWith('.pdf')) {
                                            return (
                                                <div className="w-full h-full flex flex-col">
                                                    <div className="bg-[#190a12] p-2 flex justify-end px-6 border-b border-primary/20">
                                                        <a 
                                                            href={previewUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] font-black text-rose-400 hover:text-rose-200 uppercase tracking-widest flex items-center gap-2 transition-all"
                                                        >
                                                            <Eye size={12} /> Buka di Tab Baru
                                                        </a>
                                                    </div>
                                                    <iframe 
                                                        src={previewUrl} 
                                                        className="w-full h-full border-none flex-1 bg-[#190a12]"
                                                        title="Proposal Preview"
                                                    />
                                                </div>
                                            );
                                        } else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                                            return (
                                                <div className="w-full h-full flex items-center justify-center p-8 bg-black/60">
                                                    <div className="relative group">
                                                        <img 
                                                            src={previewUrl} 
                                                            alt="Preview" 
                                                            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-primary/30" 
                                                        />
                                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                                                    </div>
                                                </div>
                                            );
                                        } else if (path.match(/\.(mp4|webm|ogg)$/)) {
                                            return (
                                                <div className="w-full h-full flex items-center justify-center bg-black/40 p-4">
                                                    <video src={previewUrl} controls className="max-w-full max-h-full rounded-xl shadow-2xl border border-primary/30" />
                                                </div>
                                            );
                                        } else if (path.match(/\.(xls|xlsx)$/)) {
                                            return (
                                                <div className="w-full h-full flex flex-col bg-[#140810]">
                                                     <div className="bg-[#190a12] p-4 flex justify-between items-center px-8 border-b border-primary/20">
                                                         <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest flex items-center gap-2">
                                                             <Layers size={14} /> Pratinjau Lembar Kerja (Excel)
                                                         </span>
                                                          <a 
                                                              href={previewUrl} 
                                                              className="text-[10px] font-black text-rose-300/70 hover:text-rose-100 uppercase tracking-widest flex items-center gap-2 transition-all"
                                                          >
                                                              <Download size={12} /> Unduh File Asli
                                                          </a>
                                                     </div>
                                                     <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar">
                                                         {isParsingDoc ? (
                                                             <div className="h-full flex flex-col items-center justify-center text-rose-300/60 gap-4">
                                                                 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                 <span className="text-xs font-bold uppercase tracking-widest">Menganalisis Data...</span>
                                                             </div>
                                                         ) : excelData.length > 0 ? (
                                                             <div className="inline-block min-w-full glass rounded-2xl border border-primary/30 overflow-hidden bg-[#1c0c16] shadow-lg">
                                                                 <table className="min-w-full text-left text-xs border-collapse">
                                                                     <thead>
                                                                         <tr className="bg-primary/20 border-b border-primary/30">
                                                                             {excelData[0].map((cell: any, i: number) => (
                                                                                 <th key={i} className="px-6 py-4 font-black text-[#f3e8ee] uppercase tracking-wider border-r border-primary/30 last:border-0">{cell}</th>
                                                                             ))}
                                                                         </tr>
                                                                     </thead>
                                                                     <tbody className="divide-y divide-primary/20">
                                                                         {excelData.slice(1).map((row: any[], i: number) => (
                                                                             <tr key={i} className="hover:bg-primary/10 transition-colors">
                                                                                 {row.map((cell: any, j: number) => (
                                                                                     <td key={j} className="px-6 py-3 text-rose-200/80 border-r border-primary/30 last:border-0 font-medium">{cell || '-'}</td>
                                                                                 ))}
                                                                             </tr>
                                                                         ))}
                                                                     </tbody>
                                                                 </table>
                                                             </div>
                                                         ) : (
                                                             <div className="h-full flex items-center justify-center text-rose-300/50 font-bold italic">Gagal membaca data lembar kerja.</div>
                                                         )}
                                                     </div>
                                                </div>
                                            );
                                        } else if (path.match(/\.(doc|docx)$/)) {
                                            return (
                                                <div className="w-full h-full flex flex-col bg-[#140810]">
                                                     <div className="bg-[#190a12] p-4 flex justify-between items-center px-8 border-b border-primary/20">
                                                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest flex items-center gap-2">
                                                            <FileIcon size={14} /> Pratinjau Dokumen (Word)
                                                        </span>
                                                        <a 
                                                            href={previewUrl} 
                                                            className="text-[10px] font-black text-rose-300/70 hover:text-rose-100 uppercase tracking-widest flex items-center gap-2 transition-all"
                                                        >
                                                            <Download size={12} /> Unduh File Asli
                                                        </a>
                                                    </div>
                                                    <div className="flex-1 overflow-auto p-6 sm:p-12 custom-scrollbar text-[#f3e8ee]">
                                                        {isParsingDoc ? (
                                                            <div className="h-full flex flex-col items-center justify-center text-rose-300/60 gap-4">
                                                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                <span className="text-xs font-bold uppercase tracking-widest">Mengonversi Dokumen...</span>
                                                            </div>
                                                        ) : wordHtml ? (
                                                            <article 
                                                                className="max-w-3xl mx-auto prose prose-invert prose-rose prose-sm"
                                                                dangerouslySetInnerHTML={{ __html: wordHtml }} 
                                                            />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-rose-300/50 font-bold italic">Gagal membaca isi dokumen.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#140810]">
                                                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/20 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-rose-300/60 mb-6 sm:mb-8 border border-primary/30 shadow-sm rotate-3 hover:rotate-0 transition-transform">
                                                        <FileIcon className="w-8 h-8 sm:w-12 sm:h-12" />
                                                    </div>
                                                    <h3 className="text-2xl sm:text-3xl font-black text-[#f3e8ee] mb-2 sm:mb-4 tracking-tight">Pratinjau Tidak Tersedia</h3>
                                                    <p className="text-rose-200/70 text-xs sm:text-sm font-medium mb-6 sm:mb-12 max-w-sm mx-auto leading-relaxed italic">
                                                        Ekstensi file <span className="text-rose-400 font-bold">.{path.split('.').pop()}</span> memerlukan aplikasi eksternal untuk dibuka.
                                                    </p>
                                                    <a 
                                                        href={previewUrl} download
                                                        className="px-8 py-4 sm:px-12 sm:py-5 bg-[#800020] hover:bg-[#6b001a] text-white rounded-2xl font-black transition-all shadow-xl shadow-primary/30 active:scale-95 uppercase tracking-[0.2em] text-[9px] sm:text-[10px]"
                                                    >
                                                        Unduh Dokumen Sekarang
                                                    </a>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                {/* Comments Section */}
                                <div className="h-[500px] lg:h-auto lg:flex-1 flex flex-col bg-[#1c0c16] backdrop-blur-md">
                                    <div className="flex border-b border-primary/20 bg-[#190a12]">
                                        <button 
                                            onClick={() => setActiveTab('discussion')}
                                            className={`flex-1 p-6 flex items-center justify-center gap-3 transition-all border-b-2 ${activeTab === 'discussion' ? 'border-primary text-rose-300 bg-primary/20' : 'border-transparent text-rose-300/60 hover:text-white'}`}
                                        >
                                            <MessageSquare size={18} />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Diskusi</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('history')}
                                            className={`flex-1 p-6 flex items-center justify-center gap-3 transition-all border-b-2 ${activeTab === 'history' ? 'border-primary text-rose-300 bg-primary/20' : 'border-transparent text-rose-300/60 hover:text-white'}`}
                                        >
                                            <Clock size={18} />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Riwayat Versi</span>
                                        </button>
                                    </div>

                                     <div className="flex-1 overflow-hidden">
                                        {activeTab === 'discussion' ? (
                                            selectedProposal && (
                                                <ProposalComments proposalId={selectedProposal.id} currentUser={user} />
                                            )
                                        ) : (
                                            <div className="p-6 space-y-4 overflow-y-auto h-full custom-scrollbar">
                                                {selectedProposal?.versions?.map((version: any, i: number) => (
                                                    <div key={i} className="p-4 bg-[#190a12] border border-primary/30 rounded-2xl flex items-center justify-between group hover:bg-primary/20 transition-all shadow-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-primary/30 text-rose-300 rounded-xl flex items-center justify-center font-black text-xs">
                                                                V{version.version_number}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[#f3e8ee]">Versi {version.version_number}</p>
                                                                <p className="text-[10px] font-semibold text-rose-300/70 uppercase tracking-wider">
                                                                    Oleh {version.creator?.name} - {new Date(version.created_at).toLocaleDateString()}
                                                                </p>

                                                                {version.notes && (
                                                                    <p className="mt-1 text-[10px] text-rose-300 font-bold bg-primary/20 px-2 py-1 rounded-md inline-block border border-primary/30">
                                                                        Catatan: {version.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={`/api/proposals/file-proxy?path=${encodeURIComponent(version.file_path)}`}
                                                            target="_blank"
                                                            download
                                                            className="p-2 bg-[#800020] hover:bg-[#6b001a] text-white rounded-xl transition-all shadow-md flex items-center gap-1 text-[10px] font-bold px-3"
                                                            title="Unduh File Versi Ini"
                                                        >
                                                            <Download size={14} /> Unduh V{version.version_number}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}