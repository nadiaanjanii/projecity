'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Konfirmasi', 
    cancelText = 'Batal',
    type = 'danger',
    loading = false 
}: ConfirmModalProps) {
    const getColor = () => {
        switch (type) {
            case 'danger': return { 
                bg: 'bg-rose-500/20', 
                text: 'text-rose-400', 
                btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/40', 
                icon: <Trash2 size={32} />,
                border: 'border-rose-500/30'
            };
            case 'warning': return { 
                bg: 'bg-amber-500/20', 
                text: 'text-amber-400', 
                btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/40', 
                icon: <AlertTriangle size={32} />,
                border: 'border-amber-500/30'
            };
            case 'success': return { 
                bg: 'bg-primary/30', 
                text: 'text-rose-300', 
                btn: 'bg-[#800020] hover:bg-[#6b001a] shadow-primary/30', 
                icon: <CheckCircle2 size={32} />,
                border: 'border-primary/30'
            };
            default: return { 
                bg: 'bg-primary/30', 
                text: 'text-rose-300', 
                btn: 'bg-[#800020] hover:bg-[#6b001a] shadow-primary/30', 
                icon: <HelpCircle size={32} />,
                border: 'border-primary/30'
            };
        }
    };

    const styles = getColor();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/30 shadow-2xl overflow-y-auto custom-scrollbar p-6 sm:p-10 md:p-12 text-center bg-[#1c0c16] text-[#f3e8ee] backdrop-blur-2xl max-h-[90vh] flex flex-col items-center justify-center"
                    >
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 ${styles.bg} ${styles.text} rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner border shrink-0 ${styles.border}`}>
                            {styles.icon}
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-[#f3e8ee] mb-3 sm:mb-4 tracking-tight uppercase">{title}</h3>
                        <p className="text-rose-200/70 font-medium leading-relaxed mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg italic opacity-90">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button 
                                onClick={onClose}
                                className="px-8 py-5 bg-[#140810] hover:bg-primary/20 text-rose-300 hover:text-white font-black rounded-2xl transition-all border border-primary/20 active:scale-95 uppercase tracking-widest text-xs"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={onConfirm}
                                disabled={loading}
                                className={`px-8 py-5 ${styles.btn} text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center`}
                            >
                                {loading ? 'MEMPROSES...' : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
