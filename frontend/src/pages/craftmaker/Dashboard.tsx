import { Link } from 'react-router-dom';
import { 
    IndianRupee, ShoppingCart, Clock, Star, PlusCircle, ClipboardList, 
    TrendingUp, MessageCircle, User, ArrowRight, Zap, AlertCircle, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockOrders, mockReviews, type OrderStatus } from '../../lib/craftmaker';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
    'new':             { label: 'New',          classes: 'bg-blue-50 text-blue-700 border-blue-100' },
    'awaiting-proof':  { label: 'Awaiting',     classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    'proof-sent':      { label: 'Proof Sent',   classes: 'bg-teal-50 text-teal-700 border-teal-100' },
    'in-production':   { label: 'In Prod.',     classes: 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' },
    'shipped':         { label: 'Shipped',      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'delivered':       { label: 'Delivered',    classes: 'bg-green-50 text-green-700 border-green-100' },
    'cancelled':       { label: 'Cancelled',    classes: 'bg-neutral-50 text-neutral-400 border-neutral-100' },
    'disputed':        { label: 'Disputed',     classes: 'bg-red-50 text-red-700 border-red-100' },
};

const Dashboard = () => {
    const activeOrders   = mockOrders.filter(o => !['delivered','cancelled'].includes(o.status));
    const pendingProofs  = mockOrders.filter(o => o.status === 'proof-sent' && o.proofStatus === 'sent');
    const proofAlerts    = mockOrders.filter(o => o.status === 'proof-sent');
    const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

    const stats = [
        { label: "Today's Revenue",  value: '₹4,280',           sub: '↑ 18% vs yesterday',  subColor: 'text-green-600',  icon: IndianRupee, accent: false },
        { label: 'Active Orders',    value: activeOrders.length, sub: `${activeOrders.length} need attention`, subColor: 'text-amber-600', icon: ShoppingCart, accent: false },
        { label: 'Pending Proofs',   value: pendingProofs.length, sub: pendingProofs.length > 0 ? 'Respond before deadline' : 'All clear', subColor: pendingProofs.length > 0 ? 'text-brand-pink' : 'text-green-600', icon: Clock, accent: pendingProofs.length > 0 },
        { label: 'Shop Rating',      value: '4.8 ★',             sub: '143 reviews',         subColor: 'text-brand-gold',  icon: Star, accent: false },
    ];

    return (
        <CraftMakerLayout>
            {/* ── Page hero strip ── */}
            <div className="relative rounded-sm overflow-hidden mb-10 bg-[#0a0a0a] px-10 py-10">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arches.png')] opacity-5" />
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-pink/20 to-transparent" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-3">Artisan Dashboard</p>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">Good morning, Meera</h1>
                        <p className="text-white/40 text-sm mt-2 font-light">{today} · Jaipur, Rajasthan</p>
                    </div>
                    <div className="flex gap-4 shrink-0">
                        <Link to="/craftmaker/listings/new" className="flex items-center gap-2 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/30">
                            <PlusCircle size={14} /> New Listing
                        </Link>
                        <Link to="/craftmaker/orders" className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 transition-all">
                            <ClipboardList size={14} /> All Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Onboarding Progress Widget ── */}
            <div className="bg-white border border-brand-pink/20 shadow-sm rounded-sm p-6 lg:p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-brand-pink/5 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-neutral-900">Complete your Shop Setup</h2>
                        <p className="text-sm text-neutral-500 mt-1">Finish these steps to unlock full marketplace visibility and payouts.</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-3xl font-inter font-black text-brand-pink">50%</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Completion</p>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-brand-pink w-1/2 rounded-full transition-all duration-1000" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Upload Shop Logo', completed: true },
                        { label: 'Link Bank Account', completed: true },
                        { label: 'Verify GSTIN', completed: false, link: '/craftmaker/tax' },
                        { label: 'Create First Listing', completed: false, link: '/craftmaker/listings/new' },
                    ].map((step, idx) => (
                        <Link 
                            key={idx} 
                            to={step.link || '#'}
                            className={`flex items-start gap-3 p-4 border rounded-sm transition-all ${step.completed ? 'bg-neutral-50 border-neutral-100 pointer-events-none' : 'bg-white border-neutral-200 hover:border-brand-pink hover:shadow-sm cursor-pointer'}`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${step.completed ? 'bg-green-50 border-green-200 text-green-600' : 'bg-neutral-50 border-neutral-300 text-neutral-300'}`}>
                                {step.completed ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${step.completed ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>{step.label}</p>
                                {!step.completed && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-pink mt-1">Start →</p>}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Proof deadline alerts ── */}
            {proofAlerts.length > 0 && (
                <div className="mb-8 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 flex items-center gap-2">
                        <AlertCircle size={12} className="text-amber-500" /> Proof Deadlines Requiring Action
                    </p>
                    {proofAlerts.map(order => (
                        <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-sm px-6 py-5">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white border border-amber-100 rounded-sm overflow-hidden shadow-sm shrink-0">
                                    <img src={order.productThumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-amber-900">{order.id}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white bg-amber-500 px-2 py-0.5 rounded-full">Action Required</span>
                                    </div>
                                    <p className="text-sm font-serif font-bold text-neutral-900">{order.productName} <span className="font-sans font-light italic text-neutral-500">· {order.buyerName}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Remaining</p>
                                    <p className="text-sm font-black text-red-500 flex items-center gap-1"><Clock size={12} /> 38h 00m</p>
                                </div>
                                <Link to={`/craftmaker/orders/${order.id}`} className="bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] px-5 py-3 hover:bg-brand-pink-dark transition-all shadow-md">
                                    Upload Proof →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Stats row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`relative bg-white border rounded-sm p-6 shadow-sm group hover:shadow-md transition-all overflow-hidden ${stat.accent ? 'border-brand-pink/30' : 'border-neutral-100 hover:border-brand-pink/20'}`}
                    >
                        {stat.accent && <div className="absolute inset-0 bg-brand-pink/2" />}
                        <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-4 ${stat.accent ? 'bg-brand-pink/10 text-brand-pink' : 'bg-neutral-50 text-neutral-400 group-hover:bg-brand-pink/5 group-hover:text-brand-pink'} transition-all`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{stat.label}</p>
                            <p className="text-3xl font-inter font-bold text-neutral-950 mt-1 tracking-tight">{stat.value}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${stat.subColor}`}>{stat.sub}</p>
                        </div>
                        {/* subtle accent line */}
                        <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${stat.accent ? 'bg-brand-pink w-full' : 'bg-brand-pink'}`} />
                    </motion.div>
                ))}
            </div>

            {/* ── Main content grid ── */}
            <div className="grid lg:grid-cols-12 gap-8 mb-10">
                
                {/* Recent Orders — 8 cols */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Recent Orders</h2>
                        <Link to="/craftmaker/orders" className="text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline flex items-center gap-1">
                            All Orders <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    {['Order ID', 'Product', 'Amount', 'Status', ''].map(h => (
                                        <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {mockOrders.slice(0, 6).map(order => (
                                    <tr key={order.id} className="group hover:bg-neutral-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-neutral-900 group-hover:text-brand-pink transition-colors">{order.id}</span>
                                            {order.isCustom && <div className="text-[8px] font-black uppercase text-brand-pink mt-0.5 flex items-center gap-1"><Zap size={8} /> Custom</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-sm bg-neutral-100 overflow-hidden shrink-0 border border-neutral-50">
                                                    <img src={order.productThumbnail} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-900 truncate max-w-[120px]">{order.productName}</p>
                                                    <p className="text-[9px] text-neutral-400 font-bold uppercase">{order.buyerName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-neutral-950 font-inter">₹{order.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[order.status].classes}`}>
                                                {statusConfig[order.status].label}
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
                    </div>
                </div>

                {/* Performance panel — 4 cols */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Earnings card */}
                    <div className="bg-[#0a0a0a] rounded-sm p-6 text-white relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-brand-pink/20 rounded-full -mr-8 -mb-8" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">This Month's Gross</p>
                        <p className="text-4xl font-inter font-bold text-white tracking-tight">₹18,340</p>
                        <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mt-2 font-inter">↑ 12% vs last month</p>
                        <div className="mt-6 pt-4 border-t border-white/10">
                            {/* Simple bar mini-chart */}
                            <div className="flex items-end gap-1 h-12">
                                {[40, 70, 30, 85, 55, 90, 65].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-sm bg-brand-pink/30 hover:bg-brand-pink/70 transition-all" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">Last 7 days</p>
                        </div>
                        <Link to="/craftmaker/earnings" className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline">
                            View Details <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* Quick action tiles */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Listings', icon: Package, path: '/craftmaker/listings', count: 8 },
                            { label: 'Custom', icon: ClipboardList, path: '/craftmaker/orders/custom', count: 3 },
                            { label: 'Disputes', icon: AlertCircle, path: '/craftmaker/disputes', count: 1 },
                            { label: 'Analytics', icon: TrendingUp, path: '/craftmaker/analytics', count: null },
                        ].map(item => (
                            <Link key={item.path} to={item.path} className="bg-white border border-neutral-100 rounded-sm p-4 hover:border-brand-pink/30 hover:shadow-md transition-all group">
                                <item.icon size={18} className="text-neutral-300 group-hover:text-brand-pink transition-colors mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{item.label}</p>
                                {item.count !== null && <p className="text-xl font-serif font-bold text-neutral-950 mt-0.5">{item.count}</p>}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent Reviews ── */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Recent Appraisals</h2>
                    <Link to="/craftmaker/reviews" className="text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline flex items-center gap-1">
                        All Reviews <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {mockReviews.slice(0, 3).map(review => (
                        <div key={review.id} className="bg-white border border-neutral-100 rounded-sm p-6 shadow-sm flex flex-col hover:border-brand-pink/20 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-neutral-900">{review.buyerMasked}</p>
                                        <p className="text-[9px] text-neutral-400 font-bold uppercase">{review.date}</p>
                                    </div>
                                </div>
                                <div className="flex text-brand-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-neutral-100'} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-pink mb-2 italic">{review.productName}</p>
                            <p className="text-sm text-neutral-600 font-light leading-relaxed flex-grow line-clamp-3">"{review.text}"</p>
                            <div className="mt-4 pt-4 border-t border-neutral-50 flex justify-between items-center">
                                <button className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-pink transition-colors flex items-center gap-1.5">
                                    <MessageCircle size={12} /> {review.makerReply ? 'Edit Reply' : 'Reply'}
                                </button>
                                <span className="text-[9px] text-neutral-300 font-bold uppercase">{review.orderId}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Dashboard;
