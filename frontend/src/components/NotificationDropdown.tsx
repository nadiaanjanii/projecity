'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, AlertCircle, Info, X, UserPlus, MessageSquare } from 'lucide-react';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAndMarkAllRead = async () => {
        try {
            const res = await api.get('/notifications');
            const list = res.data.notifications || [];
            setNotifications(list);

            const hasUnread = list.some((n: any) => !n.is_read);
            if (hasUnread) {
                await api.post('/notifications/read-all');
                setNotifications(list.map((n: any) => ({ ...n, is_read: 1 })));
            }
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAndMarkAllRead();
        }
    }, [isOpen]);

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error(error);
            }
        }
    };

    const getIcon = (type: string, message?: string) => {
        if (message?.includes('Diskusi') || message?.includes('💬')) {
            return <div className="p-2 bg-rose-500/30 text-rose-200 rounded-lg shadow-sm border border-rose-500/40"><MessageSquare size={14} /></div>;
        }
        switch (type) {
            case 'success': return <div className="p-2 bg-primary/20 text-rose-300 rounded-lg shadow-sm border border-primary/30"><Check size={14} /></div>;
            case 'warning': return <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg shadow-sm border border-rose-500/30"><AlertCircle size={14} /></div>;
            case 'user_request': return <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg shadow-sm border border-rose-500/30"><UserPlus size={14} /></div>;
            default: return <div className="p-2 bg-primary/20 text-rose-300 rounded-lg shadow-sm border border-primary/30"><Info size={14} /></div>;
        }
    };

    const handleNotificationClick = (n: any) => {
        if (!n.is_read) {
            markAsRead(n.id);
        }
        if (n.proposal_id) {
            onClose();
            window.location.href = `/dashboard/proposals?openModal=${n.proposal_id}&tab=discussion`;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[400px] glass border border-primary/30 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden bg-[#1c0c16] text-[#ffffff]"
                    >
                        <div className="p-8 border-b border-primary/20 bg-[#190a12] flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-[#ffffff] text-xl tracking-tight uppercase">Notifikasi</h3>
                                <p className="text-[10px] font-bold text-rose-200">Pemberitahuan Aktivitas Sistem</p>
                            </div>
                            <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        await api.post('/notifications/read-all');
                                        setNotifications(prev => prev.map((n: any) => ({ ...n, is_read: 1 })));
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="text-[10px] font-black bg-[#800020] hover:bg-[#6b001a] px-3 py-1.5 rounded-full text-white shadow-lg shadow-primary/30 transition-all uppercase tracking-wider"
                            >
                                Tandai Semua Dibaca
                            </button>
                        </div>

                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-16 text-center text-rose-100 italic font-bold">Memindai pemberitahuan...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
                                        <Bell size={32} className="text-rose-200" />
                                    </div>
                                    <p className="text-rose-100 font-bold italic">Tidak ada notifikasi baru</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-primary/20">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={`p-6 flex gap-5 hover:bg-primary/20 transition-all relative group cursor-pointer ${!n.is_read ? 'bg-primary/10' : ''}`}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <div className="shrink-0">{getIcon(n.type, n.message)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-[#ffffff] font-bold' : 'text-rose-100 font-semibold'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Clock size={12} className="text-rose-300" />
                                                    <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest">
                                                        {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {!n.is_read && (
                                                <div className="w-2.5 h-2.5 bg-rose-400 rounded-full mt-1.5 shadow-lg shadow-primary/40 animate-pulse" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-primary/20 bg-[#140810] text-center">
                            <button className="text-[10px] font-black text-rose-200 hover:text-white uppercase tracking-[0.2em] transition-all">
                                Lihat Semua Riwayat
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
