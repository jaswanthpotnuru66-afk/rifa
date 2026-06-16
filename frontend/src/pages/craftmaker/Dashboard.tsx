import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    IndianRupee, ShoppingCart, Clock, PlusCircle,
    ArrowRight, Zap, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/Skeleton';

const statusConfig: any = {
    'new': { label: 'New', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
    'awaiting-proof': { label: 'Awaiting', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    'proof-sent': { label: 'Proof Sent', classes: 'bg-teal-50 text-teal-700 border-teal-100' },
    'in-production': { label: 'In Prod.', classes: 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' },
    'processing': { label: 'In Prod.', classes: 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' },
    'shipped': { label: 'Shipped', classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'delivered': { label: 'Delivered', classes: 'bg-green-50 text-green-700 border-green-100' },
    'cancelled': { label: 'Cancelled', classes: 'bg-neutral-50 text-neutral-400 border-neutral-100' },
    'disputed': { label: 'Disputed', classes: 'bg-red-50 text-red-700 border-red-100' },
    'confirmed': { label: 'Confirmed', classes: 'bg-green-50 text-green-700 border-green-100' },
    'pending': { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
};

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    useEffect(() => {
        api.getArtisanStats().then(s => { setStats(s); setIsLoadingStats(false); }).catch(() => setIsLoadingStats(false));
        api.getArtisanOrders().then(o => { setOrders(o); setIsLoadingOrders(false); }).catch(() => setIsLoadingOrders(false));
    }, []);

    const dashboardStats = [
        { label: "Today's Revenue", value: stats?.stats?.todayRevenue || '₹0', sub: 'Real-time sales', subColor: 'text-green-600', icon: IndianRupee, accent: false },
        { label: 'Active Orders', value: stats?.stats?.activeOrdersCount || 0, sub: `Awaiting fulfillment`, subColor: 'text-amber-600', icon: ShoppingCart, accent: false },
        { label: 'Pending Proofs', value: stats?.stats?.pendingProofsCount || 0, sub: 'Customer approvals', subColor: 'text-green-600', icon: Clock, accent: false },
        { label: 'Live Gallery', value: stats?.stats?.activeListings || 0, sub: `${stats?.stats?.pendingListings || 0} under review`, subColor: 'text-brand-pink', icon: Package, accent: true },
    ];

    return (
        <CraftMakerLayout>
            {/* ── Premium Hero Section ── */}
            <div className="relative rounded-2xl overflow-hidden mb-12 bg-neutral-900 px-8 py-12 md:px-12 md:py-16 shadow-2xl border border-white/10 group">
                {stats?.artisan?.process_img && (
                    <motion.img 
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        loading="lazy"
                        src={stats.artisan.process_img}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent backdrop-blur-[2px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 border border-brand-pink/20 mb-4"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-pink">Artisan Studio Active</p>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight"
                        >
                            Good morning, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                {stats?.artisan?.name?.split(' ')[0] || 'Visionary'}
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-white/50 text-sm mt-4 font-light flex items-center gap-2"
                        >
                            <Clock size={14} className="text-white/40" /> {today} <span className="mx-2">•</span> {stats?.artisan?.location || 'India'}
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-3 shrink-0"
                    >
                        <Link to="/craftmaker/listings/new" className="relative overflow-hidden group flex items-center gap-2 bg-white text-neutral-950 text-xs font-black uppercase tracking-[0.2em] px-6 py-4 rounded-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all duration-300">
                            <span className="absolute inset-0 bg-gradient-to-r from-white via-brand-pink/10 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <PlusCircle size={15} className="relative z-10" /> 
                            <span className="relative z-10">New Listing</span>
                        </Link>
                        <Link to={`/rifa/${stats?.artisan?.id}`} className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 text-xs font-black uppercase tracking-[0.2em] px-6 py-4 rounded-xl transition-all duration-300">
                            <ArrowRight size={15} /> View Studio
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* ── Bento-Box Metrics ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {isLoadingStats ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                            <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                            <Skeleton className="w-1/2 h-3 mb-2" />
                            <Skeleton className="w-3/4 h-8 mb-2" />
                            <Skeleton className="w-1/3 h-3" />
                        </div>
                    ))
                ) : (
                    dashboardStats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (i * 0.1) }}
                            className={`relative bg-white rounded-2xl p-6 border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden group ${stat.accent ? 'border-brand-pink/20 shadow-brand-pink/5' : 'border-neutral-100'}`}
                        >
                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 ${stat.accent ? 'bg-brand-pink/10 text-brand-pink group-hover:bg-brand-pink group-hover:text-white' : 'bg-neutral-50 text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white'}`}>
                                    <stat.icon size={22} strokeWidth={1.5} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-inter font-black text-neutral-900 tracking-tight">{stat.value}</p>
                                <p className={`text-xs font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5 ${stat.subColor}`}>
                                    <span className="w-1 h-1 rounded-full bg-current" /> {stat.sub}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* ── Main content grid ── */}
            <div className="grid lg:grid-cols-12 gap-8 mb-12">

                {/* Left: Live Acquisition Stream — 7 cols */}
                <div className="lg:col-span-7">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 mb-1">Activity</h2>
                            <h3 className="text-xl font-serif font-bold text-neutral-900">Live Acquisition Stream</h3>
                        </div>
                        <Link to="/craftmaker/orders" className="text-xs font-black uppercase tracking-widest text-brand-pink hover:text-brand-pink-dark transition-colors flex items-center gap-1.5 bg-brand-pink/5 px-4 py-2 rounded-lg">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    
                    <div className="space-y-3 min-h-[400px]">
                        {isLoadingOrders ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-4 px-5 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="w-1/3 h-4" />
                                        <Skeleton className="w-1/4 h-3" />
                                    </div>
                                </div>
                            ))
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-2xl border border-neutral-100 border-dashed">
                                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                                    <Package size={24} className="text-neutral-300" />
                                </div>
                                <p className="text-sm font-bold text-neutral-900">No active acquisitions yet</p>
                                <p className="text-xs text-neutral-400 mt-1">Your recent orders will appear here.</p>
                            </div>
                        ) : (
                            orders.slice(0, 6).map((order, i) => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative bg-white border border-neutral-100 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-brand-pink/20 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-pink scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                                    
                                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                        <div className="w-14 h-14 rounded-xl bg-neutral-50 overflow-hidden shrink-0 border border-neutral-100 shadow-sm">
                                            <img loading="lazy" src={order.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1 group-hover:text-brand-pink transition-colors">
                                                #{order.order_id.slice(0, 8)}
                                            </p>
                                            <p className="text-sm font-bold text-neutral-900 truncate">{order.product_name}</p>
                                            <p className="text-xs text-neutral-400 font-medium mt-1">
                                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1">Revenue</p>
                                            <p className="text-sm font-black text-neutral-900 font-inter">₹{(order.price * order.quantity).toLocaleString()}</p>
                                        </div>
                                        <div className="w-28 text-right">
                                            <span className={`inline-flex px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest ${statusConfig[order.orders?.status || 'pending']?.classes || 'bg-neutral-50 text-neutral-500'}`}>
                                                {statusConfig[order.orders?.status || 'pending']?.label || order.orders?.status || 'Pending'}
                                            </span>
                                        </div>
                                        <Link to={`/craftmaker/orders/${order.order_id}`} className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-brand-pink group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Performance & Quick Actions — 5 cols */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Premium Dark Financial Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-neutral-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-pink/30 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Gross Acquisitions</p>
                                <IndianRupee size={16} className="text-brand-pink" />
                            </div>
                            
                            <p className="text-5xl font-inter font-black text-white tracking-tight mb-2 drop-shadow-md">
                                {stats?.stats?.monthlyGross || '₹0'}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                <p className="text-[11px] text-green-400 font-black uppercase tracking-widest font-inter">Verified Studio Revenue</p>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">Live Catalog</p>
                                    <p className="text-2xl font-serif font-bold text-white">{stats?.stats?.activeListings || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">Efficiency</p>
                                    <p className="text-2xl font-serif font-bold text-white">98%</p>
                                </div>
                            </div>

                            <Link to="/craftmaker/earnings" className="mt-8 flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group">
                                <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-brand-pink transition-colors">Studio Analytics</span>
                                <ArrowRight size={14} className="text-white/50 group-hover:text-brand-pink transform group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Bento Grid Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/craftmaker/listings" className="col-span-2 bg-white border border-neutral-100 rounded-2xl p-6 hover:border-brand-pink/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-brand-pink group-hover:bg-brand-pink/10 transition-all">
                                    <Package size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1">Inventory</p>
                                    <p className="text-lg font-serif font-bold text-neutral-900 group-hover:text-brand-pink transition-colors">Manage Creations</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center group-hover:border-brand-pink/30 group-hover:bg-brand-pink/5 transition-all">
                                <ArrowRight size={16} className="text-neutral-300 group-hover:text-brand-pink transform group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </Link>

                        <Link to="/craftmaker/orders/custom" className="bg-white border border-neutral-100 rounded-2xl p-6 hover:border-brand-pink/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all group flex flex-col justify-between h-36">
                            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-brand-pink group-hover:bg-brand-pink/10 transition-all">
                                <Zap size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1">Bespoke</p>
                                <p className="text-sm font-serif font-bold text-neutral-900 flex items-center justify-between">
                                    Custom Requests
                                    <ArrowRight size={14} className="text-neutral-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </p>
                            </div>
                        </Link>

                        <Link to="/craftmaker/marketing" className="bg-white border border-neutral-100 rounded-2xl p-6 hover:border-brand-pink/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all group flex flex-col justify-between h-36">
                            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-brand-pink group-hover:bg-brand-pink/10 transition-all">
                                <IndianRupee size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1">Growth</p>
                                <p className="text-sm font-serif font-bold text-neutral-900 flex items-center justify-between">
                                    Promotions
                                    <ArrowRight size={14} className="text-neutral-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Dashboard;
