import { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp,
    PieChart, IndianRupee,
    ShoppingBag, LayoutDashboard, Loader2
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminRevenue = () => {
    const [stats, setStats] = useState<any>(null);
    const [artisans, setArtisans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRevenueData();
    }, []);

    const fetchRevenueData = async () => {
        setIsLoading(true);
        try {
            const [statsData, artisansData] = await Promise.all([
                api.getAdminStats(),
                api.getAdminArtisans()
            ]);
            setStats(statsData);
            setArtisans(artisansData);
        } catch (error) {
            console.error('Failed to fetch revenue data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const topArtisans = [...artisans]
        .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
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

    if (isLoading) return (
        <AdminOpsLayout>
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 size={40} className="text-brand-pink animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Calculating Fiscal Metrics...</p>
            </div>
        </AdminOpsLayout>
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
                </div>

                {/* SECTION 1: Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Platform GMV" value={`₹${(stats?.totalGMV || 0).toLocaleString()}`} subValue="Gross order value" trend="Live" />
                    <StatCard label="Total Commission" value={`₹${(stats?.commission || 0).toLocaleString()}`} subValue="5% platform cut" trend="+100%" />
                    <StatCard label="TCS Collected" value={`₹${((stats?.totalGMV || 0) * 0.01).toLocaleString()}`} subValue="1% statutory tax" trend="Auto" />
                    <StatCard label="Active Listings" value={(stats?.activeArtisans || 0).toString()} subValue="Managed artisans" trend="Direct" />
                </div>

                {/* SECTION 2: Revenue Breakdown Chart Placeholder */}
                <section className="bg-white border border-neutral-100 rounded-sm p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={18} className="text-neutral-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Revenue Breakdown</h3>
                        </div>
                    </div>

                    <div className="h-[400px] w-full bg-neutral-50 border border-dashed border-neutral-200 rounded-sm flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="text-center relative z-10 bg-white/80 backdrop-blur-sm p-6 rounded-sm border border-neutral-100 shadow-xl">
                            <TrendingUp size={32} className="text-brand-pink mx-auto mb-4" />
                            <p className="text-sm font-bold text-neutral-900">Revenue Trends Engine</p>
                            <p className="text-[10px] text-neutral-400 font-medium uppercase mt-1 tracking-widest">Processing Transaction Nodes...</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* SECTION 3: Revenue by Maker */}
                    <div className="lg:col-span-3 bg-white border border-neutral-100 rounded-sm p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
                            <div className="flex items-center gap-3">
                                <PieChart size={18} className="text-neutral-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Top Performance by Maker</h3>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {topArtisans.map((maker, idx) => (
                                <div key={maker.id} className="flex items-center gap-6 p-4 hover:bg-neutral-50 transition-all rounded-sm group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-[10px] font-black text-neutral-300 group-hover:bg-brand-pink group-hover:text-white transition-all">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">{maker.brand_name || maker.name}</p>
                                        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-0.5 font-inter">Active Artisan Shop</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-brand-pink font-inter">₹0</p>
                                        <p className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Comm. To Date</p>
                                    </div>
                                </div>
                            ))}
                            {topArtisans.length === 0 && (
                                <div className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-neutral-300 italic">
                                    No artisan data recorded
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 4: Insights */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Performance Insights</h3>
                        
                        <div className="bg-brand-pink/5 border border-brand-pink/20 p-8 rounded-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={18} className="text-brand-pink" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Orders Processed</p>
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-neutral-950 tracking-tight">{stats?.totalOrders || 0}</h4>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">System-wide transactions across all partner boutiques.</p>
                        </div>

                        <div className="bg-neutral-950 p-8 rounded-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={18} className="text-brand-pink" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Active Artisans</p>
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-white tracking-tight">{stats?.activeArtisans || 0}</h4>
                            <p className="text-xs text-neutral-400 font-medium leading-relaxed">Verified makers currently with live inventory.</p>
                        </div>

                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={18} className="text-neutral-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Avg Order Value</p>
                            </div>
                            <h4 className="text-2xl font-inter font-bold text-neutral-950 tracking-tight">
                                ₹{stats?.totalOrders > 0 ? Math.round(stats.totalGMV / stats.totalOrders).toLocaleString() : '0'}
                            </h4>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">Calculated from system-wide GMV and transaction density.</p>
                        </div>
                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminRevenue;
