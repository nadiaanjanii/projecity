'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Search, Download, ExternalLink, Eye, X, Calendar, Filter, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const MONTHS = [
    { value: 'ALL', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
];

export default function ArchivePage() {
    const searchParams = useSearchParams();
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('ALL');
    const [selectedYear, setSelectedYear] = useState('ALL');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const query = searchParams?.get('search');
        if (query) {
            setSearch(query);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                const response = await api.get('/archive');
                setProposals(response.data.proposals || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchive();
    }, []);

    // Extract unique years from proposals dynamically (always includes current year and any year proposals exist for)
    const currentYear = new Date().getFullYear().toString();
    const extractedYears = proposals.map(p => {
        const d = new Date(p.updated_at || p.created_at);
        return isNaN(d.getTime()) ? null : d.getFullYear().toString();
    }).filter(Boolean) as string[];

    const availableYears = Array.from(new Set([currentYear, ...extractedYears]))
        .sort((a, b) => b.localeCompare(a));

    const filteredProposals = proposals.filter(p => {
        const dateObj = new Date(p.updated_at || p.created_at);
        const pMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const pYear = dateObj.getFullYear().toString();

        const matchesSearch = !search.trim() || (
            p.title?.toLowerCase().includes(search.toLowerCase()) || 
            p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.division?.toLowerCase().includes(search.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
        );

        const matchesMonth = selectedMonth === 'ALL' || pMonth === selectedMonth;
        const matchesYear = selectedYear === 'ALL' || pYear === selectedYear;

        return matchesSearch && matchesMonth && matchesYear;
    });

    const isFilterActive = search.trim() !== '' || selectedMonth !== 'ALL' || selectedYear !== 'ALL';

    const resetFilters = () => {
        setSearch('');
        setSelectedMonth('ALL');
        setSelectedYear('ALL');
        window.history.replaceState(null, '', '/dashboard/archive');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#ffffff] tracking-tight">Perpustakaan Arsip</h2>
                    <p className="text-rose-100 font-semibold mt-1">Dokumentasi proyek yang telah diverifikasi dan diselesaikan.</p>
                </div>
            </div>

            {/* Filter Bar Controls */}
            <div className="glass rounded-[2.5rem] border border-primary/30 p-6 sm:p-8 space-y-6 bg-[#1c0c16]/80 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1">Pencarian Proposal</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-white transition-colors" size={18} />
                            <input 
                                type="text" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul, nama klien, atau divisi..."
                                className="w-full bg-[#190a12] border border-primary/40 rounded-2xl py-3 pl-11 pr-4 text-[#ffffff] placeholder:text-rose-200/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Calendar size={12} className="text-rose-300" /> Filter Bulan
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full bg-[#190a12] border border-primary/40 rounded-2xl py-3 px-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm cursor-pointer"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value} className="bg-[#1c0c16] text-[#ffffff] font-bold">
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Filter size={12} className="text-rose-300" /> Filter Tahun
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-[#190a12] border border-primary/40 rounded-2xl py-3 px-4 text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-sm cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#1c0c16] text-[#ffffff] font-bold">Semua Tahun</option>
                            {availableYears.map(yr => (
                                <option key={yr} value={yr} className="bg-[#1c0c16] text-[#ffffff] font-bold">
                                    Tahun {yr}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Filter Indicator Bar */}
                {isFilterActive && (
                    <div className="pt-4 border-t border-primary/20 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-rose-200">Filter Aktif:</span>
                            {search.trim() && (
                                <span className="px-3 py-1 bg-primary/30 text-white rounded-full text-xs font-bold border border-primary/40">
                                    Kata Kunci: "{search}"
                                </span>
                            )}
                            {selectedMonth !== 'ALL' && (
                                <span className="px-3 py-1 bg-rose-500/30 text-white rounded-full text-xs font-bold border border-rose-500/40">
                                    Bulan: {MONTHS.find(m => m.value === selectedMonth)?.label}
                                </span>
                            )}
                            {selectedYear !== 'ALL' && (
                                <span className="px-3 py-1 bg-amber-500/30 text-amber-200 rounded-full text-xs font-bold border border-amber-500/40">
                                    Tahun: {selectedYear}
                                </span>
                            )}
                            <span className="text-xs font-semibold text-rose-200/80 ml-2">
                                ({filteredProposals.length} arsip ditemukan)
                            </span>
                        </div>
                        <button 
                            onClick={resetFilters}
                            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition-all border border-rose-500/30 active:scale-95"
                        >
                            <RotateCcw size={14} />
                            <span>Reset Filter</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="glass rounded-[2.5rem] border border-primary/30 overflow-hidden bg-[#1c0c16]/80 shadow-lg">

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-rose-200 text-[11px] uppercase tracking-widest border-b border-primary/30 bg-[#190a12]">
                                <th className="px-8 py-6 font-black">Judul Proposal</th>
                                <th className="px-8 py-6 font-black">Divisi & Layanan</th>
                                <th className="px-8 py-6 font-black">Tanggal Selesai</th>
                                <th className="px-8 py-6 text-right font-black">Akses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/20">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-20 text-center text-rose-100 font-bold italic">Memindai perpustakaan...</td></tr>
                            ) : filteredProposals.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-20 text-center text-rose-200 font-bold italic">Tidak ada dokumen arsip yang ditemukan</td></tr>
                            ) : (
                                filteredProposals.map((p) => (
                                    <tr key={p.id} className="hover:bg-primary/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-[#f3e8ee] text-lg group-hover:text-rose-300 transition-colors">{p.title}</div>
                                            <div className="text-[10px] text-rose-300/70 font-bold mt-1 uppercase">KLIEN: {p.client_name}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-3 py-1 bg-primary/20 text-rose-300 text-[10px] font-black rounded-lg border border-primary/30">
                                                    {p.division}
                                                </span>
                                                {p.category && (
                                                    <span className="px-3 py-1 bg-rose-500/20 text-rose-200 text-[10px] font-bold rounded-lg border border-rose-500/30">
                                                        {p.category}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-[#f3e8ee] font-bold">
                                            {new Date(p.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                                                        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || baseUrl.replace('/api', '/storage');
                                                        setPreviewUrl(`${storageUrl}/${p.file_path}`);
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    className="p-3 bg-primary/20 hover:bg-primary text-rose-300 hover:text-white rounded-xl border border-primary/30 transition-all"
                                                    title="Lihat Dokumen"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <a 
                                                    href={`${process.env.NEXT_PUBLIC_STORAGE_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '/storage') : 'http://localhost:8000/storage')}/${p.file_path}`}
                                                    download
                                                    className="p-3 bg-[#190a12] hover:bg-primary/20 text-rose-300/70 hover:text-white rounded-xl border border-primary/30 transition-all"
                                                    title="Unduh Berkas"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Document Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black/80 backdrop-blur-md" 
                            onClick={() => setIsPreviewOpen(false)} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }} 
                            className="glass border border-primary/30 rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col z-[210] overflow-hidden bg-[#1c0c16]"
                        >
                            <div className="p-6 border-b border-primary/20 bg-[#190a12] flex items-center justify-between">
                                <h3 className="font-black text-[#f3e8ee] text-lg uppercase tracking-wider flex items-center gap-2">
                                    <Archive size={20} className="text-rose-400" /> Pratinjau Dokumen Arsip
                                </h3>
                                <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-primary/20 rounded-xl text-rose-300/70 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 bg-black/50">
                                <iframe src={previewUrl} className="w-full h-full border-none" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
