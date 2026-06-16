import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
    AlertTriangle, ArrowRight, UserPlus, 
    Truck, 
    TrendingUp, Check
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/Skeleton';

const StatCard = ({ title, value, sub, subColor = "text-neutral-400", alert = false, loading = false, to }: { title: string; value: string | number; subText?: string; sub?: string; subColor?: string; alert?: boolean; loading?: boolean; to?: string }) => {
    const content = (
        <>
            {/* Editorial Frame Markers */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-neutral-200 group-hover:border-brand-pink transition-colors" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-neutral-200 group-hover:border-brand-pink transition-colors" />
            
            <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8">{title}</p>
                {loading ? (
                    <Skeleton className="w-3/4 h-12 mb-4" />
                ) : (
                    <h3 
                        className="text-5xl font-extrabold text-neutral-950 tracking-tighter leading-none mb-4 group-hover:scale-[1.02] transition-transform origin-left font-inter"
                    >
                        {value}
                    </h3>
                )}
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
                <div className={`h-[1px] w-4 ${subColor.replace('text-', 'bg-')} opacity-30`} />
                <p 
                    className={`text-xs font-bold uppercase tracking-widest ${subColor} font-inter`}
                >
                    {sub}
                </p>
            </div>
        </>
    );

    const className = `bg-white p-8 flex flex-col justify-between transition-all hover:shadow-2xl relative group overflow-hidden border border-neutral-100 block ${alert ? 'ring-1 ring-red-100' : ''}`;

    if (to) {
        return (
            <Link to={to} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <div className={className}>
            {content}
        </div>
    );
};

const AdminOpsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        api.getAdminStats().then(s => { setStats(s); setIsLoadingStats(false); }).catch(() => setIsLoadingStats(false));
        api.getAdminOrders().then(o => { setOrders(o.slice(0, 5)); setIsLoadingOrders(false); }).catch(() => setIsLoadingOrders(false));
    }, []);

    const pendingCount = stats?.pendingApps || 0;
    const pendingProductsCount = stats?.pendingProducts || 0;
    
    const showBanner = pendingCount > 0 || pendingProductsCount > 0;

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-700 pb-20">
                
                {/* Section 1 — Alert Banner */}
                {showBanner && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-950">
                                    {pendingCount} maker applications · {pendingProductsCount} listings awaiting review
                                </p>
                                <p className="text-xs text-red-700/70 font-medium">Platform operations require immediate attention to maintain SLA.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link to="/admin/ops/makers/applications" className="flex-1 md:flex-none text-center px-8 py-3.5 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-950/20">
                                Review Queue
                            </Link>
                        </div>
                    </div>
                )}

                {/* Section 2 — Platform Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Total GMV" 
                        value={`₹${(stats?.totalGMV || 0).toLocaleString()}`} 
                        sub="Live Platform Volume" 
                        subColor="text-neutral-400"
                        loading={isLoadingStats}
                        to="/admin/ops/revenue"
                    />
                    <StatCard 
                        title="Total Orders" 
                        value={stats?.totalOrders || 0} 
                        sub="Across all artisans" 
                        subColor="text-neutral-400"
                        loading={isLoadingStats}
                        to="/admin/ops/orders"
                    />
                    <StatCard 
                        title="Active Makers" 
                        value={stats?.activeArtisans || 0} 
                        sub={`${pendingCount} pending`} 
                        subColor={pendingCount > 0 ? "text-amber-600" : "text-neutral-400"}
                        loading={isLoadingStats}
                        to="/admin/ops/makers"
                    />
                    <StatCard 
                        title="Commission" 
                        value={`₹${(stats?.commission || 0).toLocaleString()}`} 
                        sub={`${stats?.commissionRate || 5}% platform fee`} 
                        loading={isLoadingStats}
                        to="/admin/ops/payouts"
                    />
                </div>

                {/* Section 3 — Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/admin/ops/makers/applications" className="flex flex-col justify-between p-8 bg-white border border-neutral-100 group hover:shadow-2xl transition-all relative">
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-12 bg-brand-pink/5 flex items-center justify-center text-brand-pink rounded-sm group-hover:scale-110 transition-transform">
                                <UserPlus size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Maker Review</span>
                            <span className="text-xl font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors leading-tight">Review Pending Applications</span>
                        </div>
                    </Link>
                    
                    <Link to="/admin/ops/listings/review" className="flex flex-col justify-between p-8 bg-white border border-neutral-100 group hover:shadow-2xl transition-all relative">
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-12 bg-neutral-50 text-neutral-400 flex items-center justify-center rounded-sm group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all group-hover:scale-110">
                                <Check size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Inventory Governance</span>
                            <span className="text-xl font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors leading-tight">Review {pendingProductsCount} New Listings</span>
                        </div>
                    </Link>

                    <Link to="/admin/ops/orders" className="flex flex-col justify-between p-8 bg-white border border-neutral-100 group hover:shadow-2xl transition-all relative">
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-12 bg-neutral-50 text-neutral-400 flex items-center justify-center rounded-sm group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all group-hover:scale-110">
                                <Truck size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Order Ledger</span>
                            <span className="text-xl font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors leading-tight">Live Fulfillment View</span>
                        </div>
                    </Link>
                </div>

                {/* Section 4 — Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-end justify-between px-1">
                            <div className="space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-pink">Settlements</p>
                                <h2 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight">Recent Activity</h2>
                            </div>
                            <Link to="/admin/ops/orders" className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 hover:text-brand-pink transition-colors border-b border-neutral-100 pb-1">View Archives →</Link>
                        </div>
                        <div className="bg-white border border-neutral-100 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-[100px_1fr_1fr_100px_110px] gap-4 px-8 py-5 border-b border-neutral-50 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                <div>Order ID</div>
                                <div>Origin</div>
                                <div>Recipient</div>
                                <div className="text-right">Value</div>
                                <div className="text-center">State</div>
                            </div>
                            <div className="divide-y divide-neutral-50">
                                {isLoadingOrders ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="grid grid-cols-[100px_1fr_1fr_100px_110px] gap-4 px-8 py-6 items-center">
                                            <Skeleton className="w-16 h-4" />
                                            <Skeleton className="w-24 h-4" />
                                            <Skeleton className="w-24 h-4" />
                                            <Skeleton className="w-16 h-4 ml-auto" />
                                            <Skeleton className="w-16 h-4 mx-auto" />
                                        </div>
                                    ))
                                ) : orders.map(order => (
                                    <Link to={`/admin/ops/orders/${order.id}`} key={order.id} className="grid grid-cols-[100px_1fr_1fr_100px_110px] gap-4 px-8 py-6 items-center hover:bg-neutral-50 transition-all cursor-pointer group">
                                        <div className="text-xs font-bold text-neutral-900">#{order.id.slice(0, 8)}</div>
                                        <div className="text-xs text-neutral-500 font-light truncate">{order.artisans?.brand_name || 'Individual'}</div>
                                        <div className="text-xs text-neutral-400 font-light truncate">{order.shipping_address?.full_name || 'Buyer'}</div>
                                        <div 
                                            className="text-xs font-bold text-neutral-950 text-right tracking-tight font-inter"
                                        >
                                            ₹{(order.total_amount || 0).toLocaleString()}
                                        </div>
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-sm ${
                                                order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                                order.status === 'disputed' ? 'bg-red-50 text-red-700 border-red-100' :
                                                order.status === 'shipped' ? 'bg-neutral-50 text-neutral-500 border-neutral-200' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {!isLoadingOrders && orders.length === 0 && (
                                    <div className="p-12 text-center text-xs font-black uppercase tracking-widest text-neutral-400 italic">
                                        No recent acquisitions recorded
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Faux Data Notice */}
                    <div className="lg:col-span-2 space-y-8">
                         <div className="p-12 border border-dashed border-neutral-200 rounded-sm flex flex-col items-center justify-center text-center bg-[#FAF7F2]">
                            <TrendingUp size={32} strokeWidth={1.5} className="text-brand-pink mb-6" />
                            <h3 className="text-lg font-serif italic text-neutral-950 mb-2">Analytics Engine</h3>
                            <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">Processing Nodes</p>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                Live forecasting and dispute tracking modules are currently being synchronized with the order ledger. 
                                Real-time charts will appear as transaction density increases.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminOpsDashboard;
