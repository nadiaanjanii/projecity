'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp, Sparkles, Download } from 'lucide-react';
import { WeeklyTrendChart, StatusPieChart, DivisionPerformanceChart } from '@/components/AnalyticsCharts';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setAnalytics(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="py-20 text-center text-rose-100 font-bold italic">Mengkalkulasi intelijen bisnis...</div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#ffffff]">
                        Pusat Analitik <span className="text-rose-300">Projecity</span>
                    </h2>
                    <p className="text-rose-100 mt-1 font-semibold text-sm">
                        Visualisasi data real-time untuk pengamatan performa dan keputusan strategis.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trends */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6 bg-[#1c0c16]/80 shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/20 text-rose-300 rounded-xl border border-primary/30"><TrendingUp size={20} /></div>
                            <h3 className="text-lg font-bold text-[#f3e8ee]">Tren Mingguan</h3>
                        </div>
                    </div>
                    <WeeklyTrendChart data={analytics?.weekly_trends || []} />
                </motion.div>

                {/* Status Distribution */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6 bg-[#1c0c16]/80 shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/20 text-rose-300 rounded-xl border border-primary/30"><PieChartIcon size={20} /></div>
                            <h3 className="text-lg font-bold text-[#f3e8ee]">Distribusi Status</h3>
                        </div>
                    </div>
                    <StatusPieChart data={analytics?.status_distribution || []} />
                </motion.div>

                {/* Division Performance */}
                {user?.all_permissions?.includes('lihat analisis') && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6 bg-[#1c0c16]/80 shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/20 text-rose-300 rounded-xl border border-primary/30"><BarChartIcon size={20} /></div>
                                <h3 className="text-lg font-bold text-[#f3e8ee]">Performa Antar Divisi</h3>
                            </div>
                        </div>
                        <DivisionPerformanceChart data={analytics?.division_performance || []} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
