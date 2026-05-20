import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, ArrowRight, ChevronDown, 
    Loader2, Package} from 'lucide-react';
import { Link } from 'react-router-dom';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';

const STATUS_TABS = ['all','pending','confirmed','processing','shipped','delivered','cancelled'];

const statusConfig: Record<string, { label: string; classes: string }> = {
    'pending':         { label: 'Pending',      classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    'confirmed':       { label: 'Confirmed',    classes: 'bg-blue-50 text-blue-700 border-blue-100' },
    'processing':      { label: 'In Production', classes: 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' },
    'shipped':         { label: 'Shipped',      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'delivered':       { label: 'Delivered',    classes: 'bg-green-50 text-green-700 border-green-100' },
    'cancelled':       { label: 'Cancelled',    classes: 'bg-neutral-50 text-neutral-400 border-neutral-100' },
};

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await api.getArtisanOrders();
            setOrders(data);
        } catch (err) {
            console.error('Error loading orders:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: orders.length };
        STATUS_TABS.forEach(t => { if (t !== 'all') c[t] = orders.filter(o => o.orders?.status === t).length; });
        return c;
    }, [orders]);

    const filtered = useMemo(() => {
        let r = [...orders];
        if (activeTab !== 'all') r = r.filter(o => o.orders?.status === activeTab);
        if (searchQuery) {
            r = r.filter(o => 
                o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                o.product_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (sortBy === 'Newest') r.sort((a,b) => new Date(b.orders?.created_at || b.created_at).getTime() - new Date(a.orders?.created_at || a.created_at).getTime());
        if (sortBy === 'Oldest') r.sort((a,b) => new Date(a.orders?.created_at || a.created_at).getTime() - new Date(b.orders?.created_at || b.created_at).getTime());
        return r;
    }, [orders, activeTab, searchQuery, sortBy]);

    if (isLoading) {
        return (
            <CraftMakerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin text-brand-pink" size={32} />
                </div>
            </CraftMakerLayout>
        );
    }

    return (
        <CraftMakerLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Fulfillment Center</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Order Logs</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Track fulfillment and shipment for your masterpieces.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{orders.length} Total Sales</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-6 border-b border-neutral-100 overflow-x-auto no-scrollbar pb-px">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                            }`}
                        >
                            {tab === 'all' ? 'All' : tab.replace(/-/g,' ')}
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black font-inter ${activeTab === tab ? 'bg-brand-pink text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                {counts[tab] || 0}
                            </span>
                            {activeTab === tab && (
                                <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:w-80 group">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                        <input
                            type="text"
                            placeholder="Search order ID or product..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-sm font-medium transition-all placeholder:text-neutral-300"
                        />
                    </div>
                    <div className="relative w-full md:w-auto md:ml-auto">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full md:w-auto appearance-none pl-4 pr-10 py-3 bg-white border border-neutral-100 rounded-sm text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                        >
                            <option>Newest</option>
                            <option>Oldest</option>
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                </div>

                {/* Orders list */}
                <div className="space-y-2">
                    {/* Table header — desktop only */}
                    {filtered.length > 0 && (
                        <div className="hidden md:grid grid-cols-[140px_160px_1fr_100px_120px_60px] gap-4 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            <div>Order ID</div><div>Date</div><div>Product</div>
                            <div className="text-right">Amount</div><div className="text-center">Status</div><div />
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? filtered.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="group bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center p-4 md:p-5 gap-4">
                                    {/* Mobile Header */}
                                    <div className="flex items-center justify-between md:hidden mb-2">
                                        <p className="text-sm font-black text-neutral-900">{item.order_id.split('-')[0]}...</p>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[item.orders?.status]?.classes || 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}>
                                            {statusConfig[item.orders?.status]?.label || item.orders?.status}
                                        </span>
                                    </div>

                                    {/* Order ID */}
                                    <div className="hidden md:block w-[140px]">
                                        <p className="text-sm font-black text-neutral-900 group-hover:text-brand-pink transition-colors font-inter truncate pr-4">{item.order_id}</p>
                                    </div>

                                    {/* Date */}
                                    <div className="w-[160px]">
                                        <p className="text-xs font-medium text-neutral-500">{new Date(item.orders?.created_at || item.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                                    </div>

                                    {/* Product */}
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-neutral-50 rounded-sm overflow-hidden flex-shrink-0 border border-neutral-100">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-200">
                                                    <Package size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-neutral-950 truncate">{item.product_name}</p>
                                    </div>

                                    {/* Amount */}
                                    <div className="w-[100px] md:text-right">
                                        <p className="text-sm font-black text-neutral-950 font-inter">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>

                                    {/* Status */}
                                    <div className="hidden md:flex w-[120px] justify-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[item.orders?.status]?.classes || 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}>
                                            {statusConfig[item.orders?.status]?.label || item.orders?.status}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="w-[60px] flex justify-end">
                                        <Link to={`/craftmaker/orders/${item.order_id}`} className="p-2 text-neutral-300 hover:text-brand-pink transition-colors">
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-24 px-6 flex flex-col items-center text-center bg-white border border-dashed border-neutral-200 rounded-sm">
                                <img src="https://illustrations.popsy.co/amber/falling-objects.svg" alt="Empty" className="w-48 h-48 opacity-80 mb-4" />
                                <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No orders found</h3>
                                <p className="text-neutral-500 text-sm max-w-sm mb-6">Looks like you don't have any sales yet. Keep creating and listings masterpieces!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Orders;
