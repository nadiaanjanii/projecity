'use client';

import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    Legend 
} from 'recharts';

const COLORS = ['#ff3366', '#ffffff', '#ffb3c1', '#c026d3', '#e11d48', '#fb7185', '#ffe4e6'];

export function WeeklyTrendChart({ data }: { data: any[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff3366" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#190a12', 
                            border: '1px solid rgba(255, 51, 102, 0.4)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="count" 
                        name="Jumlah Aktivitas"
                        stroke="#ff3366" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function StatusPieChart({ data }: { data: any[] }) {
    const translatedData = (data || []).map(item => ({
        ...item,
        name: item.name === 'VERIFIED' ? 'TERVERIFIKASI' :
              item.name === 'PENDING' ? 'MENUNGGU' :
              item.name === 'REJECTED' ? 'REVISI' : item.name
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={translatedData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {translatedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1c0c16" strokeWidth={3} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#190a12', 
                            border: '1px solid rgba(255, 51, 102, 0.4)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DivisionPerformanceChart({ data }: { data: any[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                    <XAxis 
                        dataKey="division" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#190a12', 
                            border: '1px solid rgba(255, 51, 102, 0.4)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    />
                    <Bar dataKey="total" fill="#ff3366" radius={[6, 6, 0, 0]} name="Total Proposal" />
                    <Bar dataKey="verified" fill="#ffb3c1" radius={[6, 6, 0, 0]} name="Terverifikasi" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
