import { useState, useMemo } from 'react';
import {
    Search, ChevronDown,
    AlertCircle, ArrowRight,
    Calendar, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockAllOrders } from '../../../lib/adminOps.mock';

const AdminOrders = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'awaiting-proof' | 'in-production' | 'shipped' | 'delivered' | 'disputed' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');

    const counts = {
        all: mockAllOrders.length,
        new: mockAllOrders.filter(o => o.status === 'new').length,
        'awaiting-proof': mockAllOrders.filter(o => o.status === 'awaiting-proof').length,
        'in-production': mockAllOrders.filter(o => o.status === 'in-production').length,
        shipped: mockAllOrders.filter(o => o.status === 'shipped').length,
        delivered: mockAllOrders.filter(o => o.status === 'delivered').length,
        disputed: mockAllOrders.filter(o => o.status === 'disputed').length,
        cancelled: mockAllOrders.filter(o => o.status === 'cancelled').length
    };

    const filteredOrders = useMemo(() => {
        let result = [...mockAllOrders];
        if (activeTab !== 'all') {
            result = result.filter(o => o.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(q) ||
                o.buyerName.toLowerCase().includes(q) ||
                o.makerShopName.toLowerCase().includes(q)
            );
        }

        if (sortBy === 'Newest') result.sort((a, b) => b.date.localeCompare(a.date));
        if (sortBy === 'Amount High to Low') result.sort((a, b) => b.amount - a.amount);
        if (sortBy === 'Disputed first') result.sort((a, b) => (a.status === 'disputed' ? -1 : 1) - (b.status === 'disputed' ? -1 : 1));

        return result;
    }, [activeTab, searchQuery, sortBy]);

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Marketplace Management</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Platform Orders</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Platform-wide order oversight, compliance monitoring, and manual overrides.</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar">
                    {(['all', 'new', 'awaiting-proof', 'in-production', 'shipped', 'delivered', 'disputed', 'cancelled'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                                }`}
                        >
                            {tab.replace('-', ' ')} ({counts[tab]})
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search & Sort */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Order ID, Buyer, or Maker..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-sm font-medium transition-all placeholder:text-neutral-300"
                        />
                    </div>
                    <div className="relative w-full md:w-auto md:ml-auto">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full md:w-auto appearance-none pl-4 pr-12 py-3.5 bg-white border border-neutral-100 rounded-sm text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-brand-pink/30 transition-all"
                        >
                            <option>Newest</option>
                            <option>Amount High to Low</option>
                            <option>Disputed first</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="space-y-3">
                    {/* Header Row */}
                    <div className="hidden lg:grid grid-cols-[120px_1fr_1.2fr_1.2fr_1fr_100px_100px_120px_100px_40px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div>Order ID</div>
                        <div>Date</div>
                        <div>Buyer</div>
                        <div>Maker</div>
                        <div>Product</div>
                        <div className="text-right">Amount</div>
                        <div className="text-center">Zone</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Weight Adj</div>
                        <div />
                    </div>

                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <div key={order.id} className="bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all group shadow-sm">
                            <div className="flex flex-col lg:grid lg:grid-cols-[120px_1fr_1.2fr_1.2fr_1fr_100px_100px_120px_100px_40px] gap-4 p-4 lg:p-6 items-center">

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Order ID</span>
                                    <div className="text-xs font-bold text-neutral-950 font-inter">{order.id}</div>
                                </div>
                                
                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Date</span>
                                    <div className="flex items-center gap-2 text-neutral-500 font-inter">
                                        <Calendar size={12} />
                                        <span className="text-[10px] font-medium">{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Buyer</span>
                                    <div className="text-right lg:text-left">
                                        <p className="text-xs font-bold text-neutral-900">{order.buyerName}</p>
                                        <div className="flex items-center justify-end lg:justify-start gap-1.5 mt-0.5 text-neutral-400">
                                            <MapPin size={10} />
                                            <span className="text-[10px] font-medium">{order.buyerCity}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Maker</span>
                                    <div className="text-right lg:text-left min-w-0">
                                        <p className="text-xs font-bold text-neutral-700 truncate">{order.makerShopName}</p>
                                        <Link to={`/admin/ops/makers/${order.makerId}`} className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-brand-pink">View Maker</Link>
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Product</span>
                                    <div className="text-right lg:text-left min-w-0">
                                        <p className="text-xs font-medium text-neutral-600 truncate">{order.productName}</p>
                                        {order.isCustom && <span className="text-[8px] font-black uppercase tracking-widest text-brand-pink">Custom</span>}
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Amount</span>
                                    <div className="lg:text-right">
                                        <p className="text-xs font-black text-neutral-950 font-inter">₹{order.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Zone</span>
                                    <div className="lg:text-center text-[10px] font-bold text-neutral-400">{order.shippingZone}</div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Status</span>
                                    <div className="lg:flex lg:justify-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                            order.status === 'disputed' ? 'bg-red-50 text-red-700 border-red-100' :
                                            order.status === 'cancelled' ? 'bg-neutral-50 text-neutral-500 border-neutral-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Weight Adj</span>
                                    <div className="lg:text-center">
                                        {order.weightAdjustment && order.weightAdjustment < 0 ? (
                                            <span className="text-[10px] font-black text-red-600 font-inter">−₹{Math.abs(order.weightAdjustment)}</span>
                                        ) : (
                                            <span className="text-neutral-200">−</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between lg:block w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-0 border-neutral-50 mt-2 lg:mt-0 items-center">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Actions</span>
                                    <div className="lg:flex lg:justify-center">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/admin/ops/orders/${order.id}`} className="p-2 hover:bg-neutral-50 rounded-sm transition-colors text-neutral-300 hover:text-brand-pink">
                                                <ArrowRight size={16} />
                                            </Link>
                                            {order.status === 'disputed' && (
                                                <Link to={`/admin/ops/disputes/${order.disputeId}`} className="p-2 hover:bg-red-50 rounded-sm transition-colors text-red-400 hover:text-red-600">
                                                    <AlertCircle size={16} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default AdminOrders;
