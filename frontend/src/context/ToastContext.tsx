'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'live';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-10 right-10 z-[1000] flex flex-col gap-4 items-end pointer-events-none w-full max-w-sm px-6">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9, rotateX: -20 }}
                            animate={{ opacity: 1, x: 0, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto w-full group"
                        >
                            <div className={`relative overflow-hidden glass rounded-3xl border p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-4 transition-all hover:scale-[1.02] active:scale-95 ${
                                toast.type === 'success' ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent' : 
                                toast.type === 'error' ? 'border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-transparent' : 
                                toast.type === 'live' ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent' :
                                'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent'
                            }`}>
                                {/* Progress Bar Animation */}
                                <motion.div 
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 5, ease: 'linear' }}
                                    className={`absolute bottom-0 left-0 h-1 ${
                                        toast.type === 'success' ? 'bg-emerald-500' : 
                                        toast.type === 'error' ? 'bg-rose-500' : 
                                        toast.type === 'live' ? 'bg-amber-500' :
                                        'bg-blue-500'
                                    } opacity-50`}
                                />

                                <div className={`p-3 rounded-2xl shrink-0 ${
                                    toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 
                                    toast.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/40' : 
                                    toast.type === 'live' ? 'bg-amber-500 text-white shadow-amber-500/40' :
                                    'bg-blue-500 text-white shadow-blue-500/40'
                                } shadow-xl ring-4 ring-white/10`}>
                                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : 
                                     toast.type === 'error' ? <AlertCircle size={20} /> : 
                                     toast.type === 'live' ? <Zap size={20} className="animate-pulse" /> :
                                     <Info size={20} />}
                                </div>

                                <div className="flex-1 pt-1">
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                                        toast.type === 'success' ? 'text-emerald-400' : 
                                        toast.type === 'error' ? 'text-rose-400' : 
                                        toast.type === 'live' ? 'text-amber-400' :
                                        'text-blue-400'
                                    }`}>
                                        {toast.type === 'live' ? 'AKTIVITAS LIVE' : toast.type.toUpperCase()}
                                    </h4>
                                    <p className="text-[#f3e8ee] font-medium text-sm leading-relaxed">{toast.message}</p>
                                </div>

                                <button 
                                    onClick={() => removeToast(toast.id)}
                                    className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0 mt-1"
                                >
                                    <X size={16} />
                                </button>

                                {/* Background Glow */}
                                <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-20 -z-10 rounded-full ${
                                    toast.type === 'success' ? 'bg-emerald-500' : 
                                    toast.type === 'error' ? 'bg-rose-500' : 
                                    'bg-blue-500'
                                }`} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
