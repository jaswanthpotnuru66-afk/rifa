import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    IndianRupee, ShoppingCart, Clock, PlusCircle, 
    ArrowRight, Zap, Package, Settings,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';

const statusConfig: any = {
    'new':             { label: 'New',          classes: 'bg-blue-50 text-blue-700 border-blue-100' },
    'awaiting-proof':  { label: 'Awaiting',     classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    'proof-sent':      { label: 'Proof Sent',   classes: 'bg-teal-50 text-teal-700 border-teal-100' },
    'in-production':   { label: 'In Prod.',     classes: 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' },
    'shipped':         { label: 'Shipped',      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'delivered':       { label: 'Delivered',    classes: 'bg-green-50 text-green-700 border-green-100' },
    'cancelled':       { label: 'Cancelled',    classes: 'bg-neutral-50 text-neutral-400 border-neutral-100' },
    'disputed':        { label: 'Disputed',     classes: 'bg-red-50 text-red-700 border-red-100' },
    'confirmed':       { label: 'Confirmed',    classes: 'bg-green-50 text-green-700 border-green-100' },
    'pending':         { label: 'Pending',      classes: 'bg-amber-50 text-amber-700 border-amber-100' },
};

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            try {
                const [sData, oData] = await Promise.all([
                    api.getArtisanStats(),
                    api.getArtisanOrders()
                ]);
                setStats(sData);
                setOrders(oData);
            } catch (err) {
                console.error('Error loading artisan dashboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (isLoading) {
        return (
            <CraftMakerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin text-brand-pink" size={32} />
                </div>
            </CraftMakerLayout>
        );
    }

    const dashboardStats = [
        { label: "Today's Revenue",  value: stats?.stats?.todayRevenue || '₹0',           sub: 'Real-time sales',  subColor: 'text-green-600',  icon: IndianRupee, accent: false },
        { label: 'Active Orders',    value: stats?.stats?.activeOrdersCount || 0, sub: `Awaiting fulfillment`, subColor: 'text-amber-600', icon: ShoppingCart, accent: false },
        { label: 'Pending Proofs',   value: stats?.stats?.pendingProofsCount || 0, sub: 'Customer approvals', subColor: 'text-green-600', icon: Clock, accent: false },
        { label: 'Live Gallery',     value: stats?.stats?.activeListings || 0, sub: `${stats?.stats?.pendingListings || 0} under review`, subColor: 'text-brand-pink', icon: Package, accent: true },
    ];

    return (
        <CraftMakerLayout>
            {/* ── Page hero strip ── */}
            <div className="relative rounded-sm overflow-hidden mb-10 bg-[#0a0a0a] px-10 py-10">
                {stats?.artisan?.process_img && (
                    <img src={stats.artisan.process_img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-3">Artisan Dashboard</p>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                            Good morning, {stats?.artisan?.name?.split(' ')[0] || 'Visionary'}
                        </h1>
                        <p className="text-white/40 text-sm mt-2 font-light">{today} · {stats?.artisan?.location || 'India'}</p>
                    </div>
                    <div className="flex gap-4 shrink-0">
                        <Link to="/craftmaker/listings/new" className="flex items-center gap-2 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/30">
                            <PlusCircle size={14} /> New Listing
                        </Link>
                        <Link to="/craftmaker/settings" className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 transition-all">
                            <Settings size={14} /> Edit Profile
                        </Link>
                        <Link to={`/artisan/${stats?.artisan?.id}`} className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 transition-all">
                            <ArrowRight size={14} /> View Studio
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {dashboardStats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`relative bg-white border rounded-sm p-6 shadow-sm group hover:shadow-md transition-all overflow-hidden ${stat.accent ? 'border-brand-pink/30' : 'border-neutral-100 hover:border-brand-pink/20'}`}
                    >
                        <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-neutral-50 text-neutral-400 group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{stat.label}</p>
                            <p className="text-3xl font-inter font-bold text-neutral-950 mt-1 tracking-tight">{stat.value}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${stat.subColor}`}>{stat.sub}</p>
                        </div>
                        <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-brand-pink" />
                    </motion.div>
                ))}
            </div>

            {/* ── Main content grid ── */}
            <div className="grid lg:grid-cols-12 gap-8 mb-10">
                
                {/* Recent Orders — 8 cols */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Live Acquisition Stream</h2>
                        <Link to="/craftmaker/orders" className="text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline flex items-center gap-1">
                            All Activity <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm min-h-[400px]">
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-neutral-400">
                                <Package size={48} className="mb-4 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest">No active acquisitions yet</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-neutral-50 border-b border-neutral-100">
                                    <tr>
                                        {['Order ID', 'Product', 'Amount', 'Status', ''].map(h => (
                                            <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {orders.slice(0, 8).map(order => (
                                        <tr key={order.id} className="group hover:bg-neutral-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-neutral-900 group-hover:text-brand-pink transition-colors">#{order.id.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-sm bg-neutral-100 overflow-hidden shrink-0 border border-neutral-50">
                                                        <img src={order.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-900 truncate max-w-[120px]">{order.product_name}</p>
                                                        <p className="text-[9px] text-neutral-400 font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-black text-neutral-950 font-inter">₹{(order.price * order.quantity).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[order.orders?.status || 'pending'].classes}`}>
                                                    {statusConfig[order.orders?.status || 'pending'].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/craftmaker/orders/${order.id}`} className="text-neutral-300 hover:text-brand-pink transition-colors p-1 block">
                                                    <ArrowRight size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Performance panel — 4 cols */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Earnings card */}
                    <div className="bg-[#0a0a0a] rounded-sm p-6 text-white relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-brand-pink/20 rounded-full -mr-8 -mb-8" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">Gross Acquisitions</p>
                        <p className="text-4xl font-inter font-bold text-white tracking-tight">{stats?.stats?.monthlyGross || '₹0'}</p>
                        <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mt-2 font-inter">Verified Studio Revenue</p>
                        
                        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Live Catalog</p>
                                <p className="text-xl font-serif font-bold text-white">{stats?.stats?.activeListings || 0}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Efficiency</p>
                                <p className="text-xl font-serif font-bold text-white">98%</p>
                            </div>
                        </div>

                        <Link to="/craftmaker/earnings" className="mt-6 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline">
                            Studio Analytics <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* Quick action tiles */}
                    <div className="grid grid-cols-1 gap-3">
                        <Link to="/craftmaker/listings" className="bg-white border border-neutral-100 rounded-sm p-6 hover:border-brand-pink/30 hover:shadow-md transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-50 rounded-sm flex items-center justify-center text-neutral-400 group-hover:text-brand-pink group-hover:bg-brand-pink/5 transition-all">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Inventory</p>
                                    <p className="text-lg font-serif font-bold text-neutral-900">Manage Creations</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink transition-colors" />
                        </Link>

                        <Link to="/craftmaker/orders/custom" className="bg-white border border-neutral-100 rounded-sm p-6 hover:border-brand-pink/30 hover:shadow-md transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-50 rounded-sm flex items-center justify-center text-neutral-400 group-hover:text-brand-pink group-hover:bg-brand-pink/5 transition-all">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Bespoke</p>
                                    <p className="text-lg font-serif font-bold text-neutral-900">Custom Requests</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Dashboard;
