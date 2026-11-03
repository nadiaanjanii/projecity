'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Trash2, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import echo from '@/lib/echo';

import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/context/ToastContext';

export default function ProposalComments({ proposalId, currentUser }: { proposalId: number, currentUser: any }) {
    const { showToast } = useToast();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/proposals/${proposalId}/comments`);
            setComments(res.data.comments);
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();

        // Real-time listener for new comments
        const channel = echo?.channel(`proposal.${proposalId}`)
            .listen('.CommentCreated', (data: any) => {
                const newComment = data.comment;
                setComments(prev => {
                    // Prevent duplicates if the user is the sender (already added locally)
                    if (prev.find(c => c.id === newComment.id)) return prev;
                    return [...prev, newComment];
                });
            });

        return () => {
            channel?.stopListening('.CommentCreated');
        };
    }, [proposalId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const res = await api.post('/comments', {
                proposal_id: proposalId,
                content: newComment
            });
            // We add it locally for instant feedback, 
            // the listener will handle duplicates
            setComments(prev => {
                if (prev.find(c => c.id === res.data.comment.id)) return prev;
                return [...prev, res.data.comment];
            });
            setNewComment('');
            showToast('Komentar berhasil dikirim');
        } catch (error: any) {
            if (error.response?.status !== 401) {
                showToast('Gagal mengirim komentar', 'error');
            }
        } finally {
            setSending(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCommentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        setActionLoading(true);
        try {
            await api.delete(`/comments/${commentToDelete}`);
            setComments(comments.filter(c => c.id !== commentToDelete));
            showToast('Komentar berhasil dihapus');
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            if (error.response?.status !== 401) {
                showToast('Gagal menghapus komentar', 'error');
            }
        } finally {
            setActionLoading(false);
            setCommentToDelete(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#140810]/50">
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-20 text-rose-100 font-bold italic">Memindai diskusi...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
                            <MessageSquare className="text-rose-200" size={40} />
                        </div>
                        <p className="text-rose-100 font-bold italic">Belum ada diskusi di sini. Mulailah percakapan!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <AnimatePresence>
                            {comments.map((comment) => (
                                <motion.div 
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-5 ${comment.user_id === currentUser?.id ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg overflow-hidden bg-gradient-to-br ${
                                        comment.user?.role === 'superadmin' 
                                            ? 'from-[#4a0013] to-primary shadow-primary/30' 
                                            : comment.user?.role === 'manager' 
                                            ? 'from-primary to-[#a31d36] shadow-rose-950/30' 
                                            : 'from-[#4d1927] to-[#800020] shadow-rose-950/30'
                                    }`}>
                                        {comment.user?.avatar_url ? (
                                            <img src={comment.user.avatar_url} alt={comment.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (comment.user?.name?.[0] || 'U').toUpperCase()
                                        )}
                                    </div>
                                    <div className={`max-w-[75%] group ${comment.user_id === currentUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className={`p-5 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${
                                            comment.user_id === currentUser?.id 
                                            ? 'bg-gradient-to-r from-[#800020] to-[#a31d36] text-white rounded-tr-none shadow-primary/30 border border-primary/40' 
                                            : 'bg-[#190a12] text-[#ffffff] border border-primary/40 rounded-tl-none'
                                        }`}>
                                            {comment.content}
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 px-2">
                                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={10} className="text-rose-300" />
                                                {comment.user?.name.split(' ')[0]} - {new Date(comment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {(comment.user_id === currentUser?.id || currentUser?.role === 'manager' || currentUser?.role === 'superadmin' || currentUser?.all_permissions?.includes('kelola komentar')) && (
                                                <button 
                                                    onClick={() => handleDeleteClick(comment.id)}
                                                    className="text-rose-300 opacity-0 group-hover:opacity-100 transition-all hover:text-white"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                         </div>
                                     </div>
                                 </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-8 bg-[#190a12]/90 backdrop-blur-xl border-t border-primary/30">
                <div className="relative group">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tulis pesan Anda..."
                        className="w-full bg-[#140810] border border-primary/40 rounded-2xl py-5 pl-8 pr-20 text-[#ffffff] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-inner placeholder:text-rose-200/70"
                    />
                    <button 
                        type="submit"
                        disabled={sending || !newComment.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#800020] hover:bg-[#6b001a] disabled:bg-[#1c0c16] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-xl shadow-primary/30 active:scale-95 border border-primary/30"
                    >
                        <Send size={20} className={sending ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </form>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteComment}
                title="Hapus Komentar?"
                message="Komentar Anda akan dihapus secara permanen dari diskusi ini. Lanjutkan?"
                confirmText="Hapus Sekarang"
                loading={actionLoading}
                type="danger"
            />
        </div>
    );
}
