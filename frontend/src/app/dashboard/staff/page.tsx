'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Settings2, Trash2, Mail, Shield, Plus, Briefcase as BriefcaseIcon, FileText as FileIcon, Key, ShieldAlert } from 'lucide-react';
import echo from '@/lib/echo';
import AddStaffModal from '@/components/AddStaffModal';
import EditStaffModal from '@/components/EditStaffModal';

import ConfirmModal from '@/components/ConfirmModal';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { getRelativeTime, formatClockTime, getRelativeTimeMinutes } from '@/lib/time';

export default function StaffControlPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const hasPermission = (permission: string) => {
        if (!currentUser) return false;
        return currentUser.all_permissions?.includes(permission) ?? false;
    };

    const canManageStaff = hasPermission('lihat staf') || 
                           hasPermission('verifikasi staf') || 
                           hasPermission('tambah staf') || 
                           hasPermission('hapus staf') || 
                           hasPermission('kelola pengguna');
    const canAddStaff = hasPermission('tambah staf') || hasPermission('kelola pengguna');
    const { showToast } = useToast();
    const [staff, setStaff] = useState<any[]>([]);
    const [divisions, setDivisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [staffForReset, setStaffForReset] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();

        // Real-time listener for staff updates
        const channel = echo?.private('admin.logs')
            .listen('.AuditLogCreated', (data: any) => {
                const log = data.log;
                if (log.target_type === 'USER') {
                    fetchData();
                }
            });

        return () => {
            channel?.stopListening('.AuditLogCreated');
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const staffRes = await api.get('/staff');
            const divisionsRes = await api.get('/divisions');
            setStaff(staffRes.data.staff || []);
            setDivisions(divisionsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteDivision = async (id: number) => {
        // We handle division deletion in the Divisions page now, 
        // but let's keep it consistent if used here.
        setDivisionToDelete(id);
        setIsDivConfirmOpen(true);
    };

    const updatePosition = async (id: number, position: string) => {
        try {
            await api.patch(`/user/${id}/position`, { position });
            fetchData();
            showToast('Posisi personel berhasil diperbarui');
        } catch (error) {
            showToast('Gagal memperbarui posisi', 'error');
        }
    };
    
    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/user/${id}/status`, { status });
            fetchData();
            showToast(`Status personel diperbarui menjadi ${status}`);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Gagal memperbarui status', 'error');
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<any>(null);
    const [isDivConfirmOpen, setIsDivConfirmOpen] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);

    const handleDeleteStaff = async () => {
        if (!staffToDelete) return;
        setActionLoading(true);
        try {
            await api.delete(`/staff/${staffToDelete.id}`);
            fetchData();
            setIsDeleteModalOpen(false);
            setStaffToDelete(null);
            showToast('Anggota staf telah dihapus dari sistem');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Gagal menghapus staf', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const confirmDelete = (member: any) => {
        setStaffToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const counts = {
        all: staff.length,
        active: staff.filter(s => s.status === 'active').length,
        pending: staff.filter(s => s.status === 'pending').length,
        inactive: staff.filter(s => s.status === 'inactive').length,
        suspended: staff.filter(s => s.status === 'suspended').length,
    };

    const filteredStaff = activeTab === 'all' 
        ? staff 
        : staff.filter(s => s.status === activeTab);

    if (authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-12 h-12 bg-primary rounded-2xl shadow-[0_0_30px_rgba(128,0,32,0.6)] mb-4"
                />
                <span className="text-rose-200/70 italic font-black uppercase tracking-widest text-[10px]">Memverifikasi Otoritas Akses...</span>
            </div>
        );
    }

    if (!canManageStaff) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-background rounded-[3rem] border border-primary/30 shadow-lg">
                <div className="w-24 h-24 bg-rose-500/15 rounded-full flex items-center justify-center text-rose-400 mb-6 border border-rose-500/30 shadow-sm">
                    <Users size={40} />
                </div>
                <h2 className="text-4xl font-black text-[#ffffff] mb-3 tracking-tight">Akses Terbatas</h2>
                <p className="text-rose-100 max-w-md mx-auto text-lg leading-relaxed font-medium">
                    Halaman ini memerlukan otoritas Manajemen Personel. Silakan hubungi Super Admin untuk mendapatkan akses Kontrol Staf.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#ffffff] tracking-tight">Kontrol Personel</h2>
                    <p className="text-rose-100 font-semibold text-sm mt-1">Pantau status keaktifan dan verifikasi tim Anda.</p>
                </div>
                {canAddStaff && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[#800020] hover:bg-[#6b001a] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary/30 active:scale-95 text-xs uppercase tracking-wider group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Tambah Anggota Baru
                    </button>
                )}
            </div>

            {/* Status Summary Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                 {[
                    { id: 'all', label: 'Semua', count: counts.all, icon: Users, color: 'primary' },
                    { id: 'active', label: 'Aktif', count: counts.active, icon: Shield, color: 'primary' },
                    { id: 'pending', label: 'Menunggu', count: counts.pending, icon: Plus, color: 'amber' },
                    { id: 'inactive', label: 'Resign', count: counts.inactive, icon: Trash2, color: 'rose' },
                    { id: 'suspended', label: 'Ditangguhkan', count: counts.suspended, icon: ShieldAlert, color: 'rose' },
                ].map((item) => (
                     <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`glass rounded-2xl p-4 border transition-all text-left group bg-[#1c0c16]/80 shadow-md ${
                            activeTab === item.id 
                            ? `border-primary/60 bg-primary/25 ring-1 ring-primary/40` 
                            : 'border-primary/30 hover:border-primary/50'
                        }`}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                            activeTab === item.id ? `bg-[#800020] text-white` : `bg-primary/20 text-rose-200 group-hover:text-white`
                        }`}>
                            <item.icon size={18} />
                        </div>
                        <div className="text-[10px] font-bold text-rose-200 uppercase tracking-wider mb-0.5">{item.label}</div>
                        <div className={`text-xl font-bold ${activeTab === item.id ? 'text-rose-200' : 'text-[#ffffff]'}`}>{item.count}</div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Staff List Grouped by Division */}
                <div className="space-y-12">
                    {loading ? (
                        <div className="py-20 text-center text-rose-100 font-bold italic">Memindai database tim...</div>
                    ) : (
                        <>
                            {/* Render by Groups based on Tab */}
                            {activeTab === 'all' ? (
                                [
                                    { id: 'pending', label: 'Menunggu Verifikasi', color: 'text-amber-300' },
                                    { id: 'active', label: 'Personel Aktif', color: 'text-rose-200' },
                                    { id: 'inactive', label: 'Personel Resign', color: 'text-rose-300' },
                                    { id: 'suspended', label: 'Personel Ditangguhkan', color: 'text-rose-400' },
                                ].map((group) => {
                                    const groupStaff = staff.filter(s => s.status === group.id);
                                    if (groupStaff.length === 0) return null;

                                    return (
                                        <div key={group.id} className="space-y-6">
                                             <div className="flex items-center gap-4">
                                                <h3 className={`text-xl font-black ${group.color} tracking-widest uppercase`}>{group.label}</h3>
                                                <div className="h-px flex-1 bg-primary/20" />
                                                <span className={`text-[10px] font-black ${group.color} bg-primary/20 px-3 py-1 rounded-full border border-primary/30`}>
                                                    {groupStaff.length} PERSONEL
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                {groupStaff.map((member) => (
                                                    <StaffCard 
                                                        key={member.id} member={member} divisions={divisions} 
                                                        currentUser={currentUser}
                                                        onDelete={() => confirmDelete(member)} onUpdatePosition={updatePosition}
                                                        onUpdateStatus={updateStatus} onEdit={() => { setSelectedStaff(member); setIsEditModalOpen(true); }}
                                                        onReset={() => { setStaffForReset(member); setIsResetModalOpen(true); }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {filteredStaff.map((member) => (
                                        <StaffCard 
                                            key={member.id} member={member} divisions={divisions} 
                                            currentUser={currentUser}
                                            onDelete={() => confirmDelete(member)} onUpdatePosition={updatePosition}
                                            onUpdateStatus={updateStatus} onEdit={() => { setSelectedStaff(member); setIsEditModalOpen(true); }}
                                            onReset={() => { setStaffForReset(member); setIsResetModalOpen(true); }}
                                        />
                                    ))}
                                </div>
                            )}

                            {filteredStaff.length === 0 && (
                                 <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                        <Users className="text-rose-300/50" size={32} />
                                    </div>
                                    <p className="text-rose-200/70 font-bold italic">Tidak ada personel dengan status ini</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <AddStaffModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />

            <EditStaffModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchData}
                staffMember={selectedStaff}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteStaff}
                title="Hapus Staf?"
                message={`Apakah Anda yakin ingin menghapus ${staffToDelete?.name} dari sistem? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus Permanen"
                loading={actionLoading}
                type="danger"
            />

            <ResetPasswordModal 
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                user={staffForReset}
            />
        </div>
    );
}

// Sub-component for individual staff cards to keep the main component clean
function StaffCard({ member, divisions, currentUser, onDelete, onUpdatePosition, onUpdateStatus, onEdit, onReset }: any) {
    const statusConfig: any = {
        active: { label: 'Aktif', color: 'text-rose-300', bg: 'bg-primary/20', border: 'border-primary/40' },
        pending: { label: 'Menunggu', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
        inactive: { label: 'Resign', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
        suspended: { label: 'Ditangguhkan', color: 'text-rose-300/60', bg: 'bg-[#140810]', border: 'border-primary/20' }
    };

    const status = statusConfig[member.status] || statusConfig.active;
    const isInactive = member.status === 'inactive' || member.status === 'suspended';

    return (
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-[2.5rem] p-8 border relative group transition-all overflow-hidden bg-[#1c0c16]/80 shadow-lg ${
                isInactive ? 'opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100 border-primary/20' : 'border-primary/30 hover:border-primary/50'
            } ${member.status === 'pending' ? 'ring-2 ring-amber-500/40 border-amber-500/40' : ''}`}
        >
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden shrink-0 bg-gradient-to-br ${
                    member.role === 'superadmin' 
                        ? 'from-[#4a0013] to-primary shadow-primary/30' 
                        : member.role === 'manager' 
                        ? 'from-primary to-[#a31d36] shadow-rose-900/30' 
                        : 'from-[#4d1927] to-[#800020] shadow-rose-950/30'
                }`}>
                    {member.avatar_url ? (
                        <img src={member.avatar_url} alt="Staff" className="w-full h-full object-cover" />
                    ) : (
                        (member.name?.[0] || 'S').toUpperCase()
                    )}
                </div>
                 <div className="flex gap-2">
                    {(currentUser?.role === 'superadmin' || currentUser?.all_permissions?.includes('atur ulang sandi')) && (
                        <button 
                            onClick={onReset}
                            className="p-2 bg-primary/10 hover:bg-primary/25 rounded-xl text-rose-300/70 hover:text-white transition-all"
                            title="Atur Ulang Sandi"
                        >
                            <Key size={18} />
                        </button>
                    )}
                    {(currentUser?.role === 'superadmin' || currentUser?.all_permissions?.includes('edit staf')) && (
                        <button 
                            onClick={onEdit}
                            className="p-2 bg-primary/10 hover:bg-primary/25 rounded-xl text-rose-300/70 hover:text-white transition-all"
                            title="Edit Data Personel"
                        >
                            <Settings2 size={18} />
                        </button>
                    )}
                    {(currentUser?.role === 'superadmin' || currentUser?.all_permissions?.includes('hapus staf')) && (
                        <button 
                            onClick={() => onDelete(member.id, member.name)}
                            className="p-2 bg-primary/10 hover:bg-rose-600/30 rounded-xl text-rose-300/70 hover:text-rose-300 transition-all"
                            title="Hapus Personel"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-[#f3e8ee]">{member.name}</h3>
                    {member.position && (
                        <span className="text-[8px] font-black bg-primary/20 px-2 py-0.5 rounded text-rose-300 border border-primary/30 uppercase">
                            {member.position}
                        </span>
                    )}
                </div>
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-rose-200/70 text-xs font-bold uppercase tracking-widest">
                        <Shield size={12} className="text-rose-400" /> {
                            member.role === 'superadmin' ? 'Super Admin' : 
                            (member.role === 'manager' ? 'Manajer' : 'Staf')
                        }
                    </div>
                    <div className={`flex items-center px-2.5 py-1 ${status.bg} rounded-full border ${status.border}`}>
                        <span className={`text-[10px] font-bold uppercase ${status.color}`}>{status.label}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/20 rounded-lg border border-primary/30">
                        <FileIcon size={10} className="text-rose-300" />
                        <span className="text-[10px] font-bold text-rose-300">{member.proposals_count || 0} PROPOSAL</span>
                    </div>

                    {member.is_online ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Online
                        </span>
                    ) : (
                        <span className="text-[10px] text-rose-200/60 font-medium">
                            Offline {getRelativeTimeMinutes(member.updated_at)}
                        </span>
                    )}
                </div>

                <div className="mb-4">
                    {(currentUser?.role === 'superadmin' || currentUser?.all_permissions?.includes('verifikasi staf')) && (
                        <>
                            {member.status === 'pending' && (
                                <button 
                                    onClick={() => onUpdateStatus(member.id, 'active')}
                                    className="w-full text-[10px] font-bold bg-[#800020] hover:bg-[#6b001a] text-white px-3 py-2 rounded-lg transition-all shadow-lg shadow-primary/30"
                                >
                                    VERIFIKASI AKUN
                                </button>
                            )}
                            
                            {member.status === 'active' && (
                                <button 
                                    onClick={() => onUpdateStatus(member.id, 'inactive')}
                                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
                                >
                                    Tandai Resign
                                </button>
                            )}

                            {member.status === 'inactive' && (
                                <button 
                                    onClick={() => onUpdateStatus(member.id, 'active')}
                                    className="text-[10px] font-bold text-rose-300 hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    Aktifkan Kembali
                                </button>
                            )}
                        </>
                    )}
                </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-rose-200/70 text-sm font-medium">
                        <Mail size={16} className="text-rose-300/50" /> {member.email}
                    </div>
                    <div className="pt-4 border-t border-primary/20">
                        <label className="text-[10px] font-black text-rose-300/70 uppercase tracking-[0.2em] mb-2 block">Ubah Divisi</label>
                        <select 
                            value={member.position || ''} 
                            disabled={currentUser?.role !== 'superadmin' && !currentUser?.all_permissions?.includes('ubah divisi staf')}
                            onChange={(e) => onUpdatePosition(member.id, e.target.value)}
                            className="w-full bg-[#190a12] border border-primary/30 rounded-xl px-4 py-2.5 text-sm font-bold text-[#f3e8ee] focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="" className="bg-[#1c0c16] text-[#f3e8ee] normal-case">Tanpa Divisi</option>
                            {divisions.map((div: any) => (
                                <option key={div.id} value={div.name} className="bg-[#1c0c16] text-[#f3e8ee] uppercase">{div.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
        </motion.div>
    );
}
