import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, ArrowRight, ChevronDown, 
    Zap, Clock} from 'lucide-react';
import { Link } from 'react-router-dom';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockOrders, type OrderStatus } from '../../lib/craftmaker';

const STATUS_TABS: (OrderStatus | 'all')[] = ['all','new','awaiting-proof','proof-sent','in-production','shipped','delivered','cancelled','disputed'];

const statusConfig: Record<string, { label: string; classes: string }> = {
    'new':             { label: 'New',          classes: 'bg-blue-50 text-blue-700 border-blue-100' },
    'awaiting-proof':  { label: 'Awaiting',     classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    'proof-sent':      { label: 'Proof Sent',   classes: 'bg-teal-50 text-teal-700 border-teal-100' },
    'in-production':   { label: 'In Production', classes: 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' },
    'shipped':         { label: 'Shipped',      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'delivered':       { label: 'Delivered',    classes: 'bg-green-50 text-green-700 border-green-100' },
    'cancelled':       { label: 'Cancelled',    classes: 'bg-neutral-50 text-neutral-400 border-neutral-100' },
    'disputed':        { label: 'Disputed',     classes: 'bg-red-50 text-red-700 border-red-100' },
};

const Orders = () => {
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: mockOrders.length };
        STATUS_TABS.forEach(t => { if (t !== 'all') c[t] = mockOrders.filter(o => o.status === t).length; });
        return c;
    }, []);

    const filtered = useMemo(() => {
        let r = [...mockOrders];
        if (activeTab !== 'all') r = r.filter(o => o.status === activeTab);
        if (searchQuery) r = r.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()));
        if (sortBy === 'Newest') r.sort((a,b) => b.id.localeCompare(a.id));
        if (sortBy === 'Oldest') r.sort((a,b) => a.id.localeCompare(b.id));
        if (sortBy === 'Amount: High to Low') r.sort((a,b) => b.amount - a.amount);
        return r;
    }, [activeTab, searchQuery, sortBy]);

    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const toggleOrderSelection = (id: string) => {
        setSelectedOrders(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedOrders.length === filtered.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filtered.map(o => o.id));
        }
    };

    return (
        <CraftMakerLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Fulfillment Center</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Order Logs</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Track fulfillment, proof approvals, and shipments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{mockOrders.length} Total Orders</span>
                        <div className="w-px h-4 bg-neutral-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{counts['awaiting-proof'] + counts['proof-sent']} Need Action</span>
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
                            placeholder="Search order ID or buyer name..."
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
                            <option>Amount: High to Low</option>
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                </div>

                {/* Orders list */}
                <div className="space-y-2">
                    {/* Table header — desktop only */}
                    {filtered.length > 0 && (
                        <div className="hidden md:grid grid-cols-[40px_120px_160px_1fr_100px_100px_120px_40px] gap-4 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    className="accent-brand-pink w-4 h-4 rounded-sm cursor-pointer"
                                    checked={selectedOrders.length === filtered.length && filtered.length > 0}
                                    onChange={toggleAll}
                                />
                            </div>
                            <div>Order ID</div><div>Date</div><div>Product</div>
                            <div className="text-right">Amount</div><div className="text-center">Zone</div>
                            <div className="text-center">Status</div><div />
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? filtered.map(order => (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`group bg-white border rounded-sm transition-all overflow-hidden ${selectedOrders.includes(order.id) ? 'border-brand-pink shadow-md' : 'border-neutral-100 hover:border-brand-pink/30 hover:shadow-md'}`}
                            >
                                {/* Left accent bar */}
                                <div className="flex flex-col md:flex-row">
                                    <div className={`hidden md:block w-1 shrink-0 ${order.status === 'proof-sent' ? 'bg-amber-400' : order.status === 'new' ? 'bg-blue-400' : order.status === 'disputed' ? 'bg-red-400' : 'bg-transparent'}`} />
                                    
                                    <div className="flex-1 flex flex-col md:grid md:grid-cols-[40px_120px_160px_1fr_100px_100px_120px_40px] gap-4 md:items-center p-4 md:p-5">
                                        
                                        {/* Mobile Header: Checkbox + Status + ID */}
                                        <div className="flex items-center justify-between md:hidden mb-2">
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-brand-pink w-4 h-4 rounded-sm cursor-pointer"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => toggleOrderSelection(order.id)}
                                                />
                                                <p className="text-sm font-black text-neutral-900">{order.id}</p>
                                            </div>
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[order.status]?.classes || 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}>
                                                {statusConfig[order.status]?.label || order.status}
                                            </span>
                                        </div>

                                        {/* Desktop Checkbox */}
                                        <div className="hidden md:flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="accent-brand-pink w-4 h-4 rounded-sm cursor-pointer"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleOrderSelection(order.id)}
                                            />
                                        </div>

                                        <div className="hidden md:block">
                                            <p className="text-sm font-black text-neutral-900 group-hover:text-brand-pink transition-colors font-inter">{order.id}</p>
                                            {order.isCustom && (
                                                <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-brand-pink">
                                                    <Zap size={8} /> Bespoke
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between md:block">
                                            <div className="md:hidden text-[10px] font-black uppercase text-neutral-400">Date</div>
                                            <div className="text-right md:text-left">
                                                <p className="text-xs font-medium text-neutral-500">{order.date}</p>
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">{order.buyerName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 min-w-0 py-2 md:py-0 border-y border-neutral-50 md:border-0 my-2 md:my-0">
                                            <img src={order.productThumbnail} alt="" className="w-12 h-12 md:w-10 md:h-10 rounded-sm object-cover border border-neutral-50 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-neutral-950 truncate">{order.productName}</p>
                                                {order.isCustom && <span className="md:hidden text-[9px] font-bold text-brand-pink mt-0.5 block">Custom Order</span>}
                                            </div>
                                        </div>

                                        <div className="flex justify-between md:block">
                                            <div className="md:hidden text-[10px] font-black uppercase text-neutral-400">Amount</div>
                                            <div className="md:text-right">
                                                <p className="text-sm font-black text-neutral-950 font-inter">₹{order.amount.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between md:block">
                                            <div className="md:hidden text-[10px] font-black uppercase text-neutral-400">Zone</div>
                                            <div className="md:text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400">{order.shippingZone}</p>
                                            </div>
                                        </div>

                                        <div className="hidden md:flex md:justify-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[order.status]?.classes || 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}>
                                                {statusConfig[order.status]?.label || order.status}
                                            </span>
                                        </div>

                                        <div className="pt-3 md:pt-0 border-t border-neutral-50 md:border-0 md:flex md:justify-end mt-2 md:mt-0">
                                            <Link to={`/craftmaker/orders/${order.id}`} className="w-full md:w-auto p-2 bg-neutral-50 md:bg-transparent text-neutral-600 md:text-neutral-300 hover:text-brand-pink transition-colors flex items-center justify-center gap-2 rounded-sm text-xs font-bold md:block">
                                                <span className="md:hidden">View Full Order</span>
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                {/* Deadline warning */}
                                {order.deadline && (
                                    <div className="bg-amber-50 border-t border-amber-100 px-4 md:px-6 py-2 flex items-center gap-2">
                                        <Clock size={11} className="text-amber-600 shrink-0" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Proof deadline: {order.deadline}</p>
                                    </div>
                                )}
                            </motion.div>
                        )) : (
                            <div className="py-24 px-6 flex flex-col items-center text-center bg-white border border-dashed border-neutral-200 rounded-sm">
                                <img src="https://illustrations.popsy.co/amber/falling-objects.svg" alt="Empty" className="w-48 h-48 opacity-80 mb-4" />
                                <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No orders found</h3>
                                <p className="text-neutral-500 text-sm max-w-sm mb-6">Looks like you don't have any orders matching these filters. Stay creative, the next one is just around the corner!</p>
                                <button onClick={() => { setActiveTab('all'); setSearchQuery(''); }} className="bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-sm shadow-md hover:bg-brand-pink-dark transition-all">
                                    View All Orders
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Bulk Action Bar */}
            <AnimatePresence>
                {selectedOrders.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a] text-white px-6 py-4 rounded-sm shadow-2xl flex items-center gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center text-xs font-black">{selectedOrders.length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Selected</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-sm text-[10px] font-black uppercase tracking-widest">
                                Download Labels
                            </button>
                            <button className="px-4 py-2 bg-brand-pink hover:bg-brand-pink-dark transition-colors rounded-sm text-[10px] font-black uppercase tracking-widest">
                                Mark as Shipped
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CraftMakerLayout>
    );
};

export default Orders;
