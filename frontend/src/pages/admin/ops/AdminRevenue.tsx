import { useState } from 'react';
import { 
    BarChart3, TrendingUp,
    PieChart, IndianRupee,
    ShoppingBag, LayoutDashboard
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockAllMakers } from '../../../lib/adminOps.mock';

const AdminRevenue = () => {
    const [timeRange, setTimeRange] = useState('Last 30 Days');

    const revenueByMaker = mockAllMakers
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

    const StatCard = ({ label, value, subValue, trend }: { label: string; value: string; subValue: string; trend?: string }) => (
        <div className="bg-white border border-neutral-100 p-8 rounded-sm shadow-sm group hover:border-brand-pink/30 transition-all">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">{label}</p>
                <div className="p-2 bg-neutral-50 rounded-sm text-neutral-300 group-hover:text-brand-pink transition-colors">
                    <IndianRupee size={16} />
                </div>
            </div>
            <h3 className="text-3xl font-inter font-bold text-neutral-950 tracking-tight mb-2">{value}</h3>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{trend}</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{subValue}</span>
            </div>
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-12 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Revenue Analytics</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Platform Revenue</h1>
                    </div>
                    <div className="flex bg-neutral-100 p-1 rounded-sm overflow-hidden">
                        {['Last 30 Days', 'Last 3 Months', 'Last 6 Months'].map(range => (
                            <button 
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    timeRange === range ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECTION 1: Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Platform Revenue" value="₹4,21,029" subValue="All-time commission" trend="+12%" />
                    <StatCard label="Commission This Month" value="₹6,229" subValue="5% platform cut" trend="+8%" />
                    <StatCard label="TCS Collected" value="₹1,246" subValue="1% statutory tax" trend="+5%" />
                    <StatCard label="Listing Fees" value="₹12,400" subValue="₹10 per product" trend="+15%" />
                </div>

                {/* SECTION 2: Revenue Breakdown Chart Placeholder */}
                <section className="bg-white border border-neutral-100 rounded-sm p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={18} className="text-neutral-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Revenue Breakdown</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-brand-pink" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Commission</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#4A8C6F]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">TCS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#D4547A]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Listing Fees</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full bg-neutral-50 border border-dashed border-neutral-200 rounded-sm flex flex-col items-center justify-center relative overflow-hidden group">
                        {/* Mock Chart Bars */}
                        <div className="flex items-end gap-4 h-64 absolute bottom-12 left-1/2 -translate-x-1/2">
                            {[0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 1.0, 0.4, 0.6, 0.8, 0.5, 0.9].map((h, i) => (
                                <div key={i} className="flex flex-col gap-1 w-12 group/bar cursor-help">
                                    <div className="w-full bg-[#D4547A]/30 rounded-sm transition-all group-hover/bar:bg-[#D4547A]" style={{ height: `${h * 40}px` }} />
                                    <div className="w-full bg-[#4A8C6F]/30 rounded-sm transition-all group-hover/bar:bg-[#4A8C6F]" style={{ height: `${h * 20}px` }} />
                                    <div className="w-full bg-brand-pink/30 rounded-sm transition-all group-hover/bar:bg-brand-pink" style={{ height: `${h * 140}px` }} />
                                    <span className="text-[8px] font-black text-neutral-300 mt-2 text-center">JAN</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-center relative z-10 bg-white/80 backdrop-blur-sm p-6 rounded-sm border border-neutral-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingUp size={32} className="text-brand-pink mx-auto mb-4" />
                            <p className="text-sm font-bold text-neutral-900">Revenue Trends Engine</p>
                            <p className="text-[10px] text-neutral-400 font-medium uppercase mt-1 tracking-widest">Connect Recharts for live data visualization</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* SECTION 3: Revenue by Maker */}
                    <div className="lg:col-span-3 bg-white border border-neutral-100 rounded-sm p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
                            <div className="flex items-center gap-3">
                                <PieChart size={18} className="text-neutral-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Revenue by Maker</h3>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline">View All</button>
                        </div>
                        <div className="space-y-1">
                            {revenueByMaker.map((maker, idx) => (
                                <div key={maker.id} className="flex items-center gap-6 p-4 hover:bg-neutral-50 transition-all rounded-sm group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-[10px] font-black text-neutral-300 group-hover:bg-brand-pink group-hover:text-white transition-all">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">{maker.shopName}</p>
                                        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-0.5 font-inter">{maker.totalOrders} Orders · ₹{maker.totalRevenue.toLocaleString()} GMV</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-brand-pink font-inter">₹{(maker.totalRevenue * 0.05).toLocaleString()}</p>
                                        <p className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Comm.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 4: Insights */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Performance Insights</h3>
                        
                        <div className="bg-brand-pink/5 border border-brand-pink/20 p-8 rounded-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={18} className="text-brand-pink" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Top Revenue Category</p>
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-neutral-950 tracking-tight">Pottery & Ceramics</h4>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">Generated ₹8,420 in platform commission this month across 42 orders.</p>
                        </div>

                        <div className="bg-neutral-950 p-8 rounded-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={18} className="text-brand-pink" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Highest GMV Maker</p>
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Royal Silk Weaves</h4>
                            <p className="text-xs text-neutral-400 font-medium leading-relaxed">Recorded ₹1,24,580 in gross sales this month. Contribution: 15.2% of total platform GMV.</p>
                        </div>

                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={18} className="text-neutral-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Avg Commission Per Order</p>
                            </div>
                            <h4 className="text-2xl font-inter font-bold text-neutral-950 tracking-tight">₹148.50</h4>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">Based on 184 orders processed this month. Up 4.2% from last quarter.</p>
                        </div>
                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminRevenue;
