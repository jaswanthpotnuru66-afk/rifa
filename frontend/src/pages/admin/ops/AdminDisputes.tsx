import { useState, useMemo } from 'react';
import {
    Search, AlertCircle, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockDisputes } from '../../../lib/adminOps.mock';

const AdminDisputes = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'open' | 'under-review' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Oldest first');

    const counts = {
        all: mockDisputes.length,
        open: mockDisputes.filter(d => d.status === 'open').length,
        'under-review': mockDisputes.filter(d => d.status === 'under-review').length,
        resolved: mockDisputes.filter(d => d.status === 'resolved').length
    };

    const criticalDisputes = mockDisputes.filter(d => {
        const diff = Date.now() - new Date(d.dateRaised).getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        return d.status !== 'resolved' && days > 2;
    }).length;

    const filteredDisputes = useMemo(() => {
        let result = [...mockDisputes];
        if (activeTab !== 'all') {
            result = result.filter(d => d.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.id.toLowerCase().includes(q) ||
                d.orderId.toLowerCase().includes(q) ||
                d.buyerName.toLowerCase().includes(q) ||
                d.makerShopName.toLowerCase().includes(q)
            );
        }

        if (sortBy === 'Oldest first') result.sort((a, b) => a.dateRaised.localeCompare(b.dateRaised));
        if (sortBy === 'Newest') result.sort((a, b) => b.dateRaised.localeCompare(a.dateRaised));

        return result;
    }, [activeTab, searchQuery, sortBy]);

    const getDaysOpen = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">

                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Conflict Resolution</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Order Disputes</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Manage and resolve buyer-maker disputes. SLA: 48 hours to respond.</p>
                </div>

                {/* Summary & Alert */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-neutral-100 p-6 rounded-sm">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Open</p>
                        <p className="text-2xl font-serif font-bold text-neutral-950">{counts.open}</p>
                    </div>
                    <div className="bg-white border border-neutral-100 p-6 rounded-sm">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Under Review</p>
                        <p className="text-2xl font-serif font-bold text-neutral-950">{counts['under-review']}</p>
                    </div>
                    <div className="bg-white border border-neutral-100 p-6 rounded-sm">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Resolved</p>
                        <p className="text-2xl font-serif font-bold text-neutral-950">{counts.resolved}</p>
                    </div>
                    {criticalDisputes > 0 && (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-sm flex flex-col justify-center animate-pulse">
                            <div className="flex items-center gap-2 text-red-600 mb-1">
                                <AlertCircle size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">SLA Breach</span>
                            </div>
                            <p className="text-sm font-bold text-red-700 leading-tight">
                                {criticalDisputes} disputes open for {'>'}48h
                            </p>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {(['all', 'open', 'under-review', 'resolved'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-0.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                                    }`}
                            >
                                {tab.replace('-', ' ')}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-64 group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-xs font-bold transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 bg-white border border-neutral-100 rounded-sm text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-brand-pink/30 transition-all"
                            >
                                <option>Oldest first</option>
                                <option>Newest</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Disputes Table */}
                <div className="space-y-3">
                    <div className="hidden lg:grid grid-cols-[100px_100px_1.2fr_1.2fr_1fr_100px_80px_100px_100px_80px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div>Dispute ID</div>
                        <div>Order ID</div>
                        <div>Buyer</div>
                        <div>Maker</div>
                        <div>Category</div>
                        <div>Raised</div>
                        <div className="text-center">Days</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Outcome</div>
                        <div />
                    </div>

                    {filteredDisputes.length > 0 ? filteredDisputes.map(dispute => {
                        const daysOpen = getDaysOpen(dispute.dateRaised);
                        const isUrgent = dispute.status !== 'resolved' && daysOpen > 3;
                        const isWarning = dispute.status !== 'resolved' && daysOpen <= 3;
                        const isResolvedMaker = dispute.status === 'resolved' && dispute.outcome === 'maker-favour';

                        return (
                            <div key={dispute.id} className={`bg-white border rounded-sm transition-all shadow-sm ${isUrgent ? 'bg-red-50/50 border-red-100' :
                                    isWarning ? 'bg-amber-50/30 border-amber-50' :
                                        isResolvedMaker ? 'bg-green-50/30 border-green-50' :
                                            'border-neutral-100'
                                }`}>
                                <div className="flex flex-col lg:grid lg:grid-cols-[100px_100px_1.2fr_1.2fr_1fr_100px_80px_100px_100px_80px] gap-4 p-4 lg:p-6 items-center">

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Dispute ID</span>
                                        <div className="text-xs font-black text-neutral-950 font-inter">{dispute.id}</div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Order ID</span>
                                        <Link to={`/admin/ops/orders/${dispute.orderId}`} className="text-xs font-bold text-brand-pink hover:underline font-inter">{dispute.orderId}</Link>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Buyer</span>
                                        <div className="text-right lg:text-left">
                                            <p className="text-xs font-bold text-neutral-900">{dispute.buyerName}</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">{dispute.buyerCity}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Maker</span>
                                        <div className="text-right lg:text-left">
                                            <p className="text-xs font-bold text-neutral-900">{dispute.makerShopName}</p>
                                            <Link to={`/admin/ops/makers/${dispute.makerId}`} className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-brand-pink">View Maker</Link>
                                        </div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Category</span>
                                        <div className="text-right lg:text-left">
                                            <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-sm uppercase tracking-tight">{dispute.category.replace('-', ' ')}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Raised</span>
                                        <div className="text-[10px] font-medium text-neutral-500 font-inter">{new Date(dispute.dateRaised).toLocaleDateString()}</div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Days</span>
                                        <div className="lg:text-center">
                                            <span className={`text-xs font-black font-inter ${isUrgent ? 'text-red-600' : 'text-neutral-950'}`}>{daysOpen}d</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Status</span>
                                        <div className="lg:flex lg:justify-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                dispute.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                dispute.status === 'under-review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {dispute.status.replace('-', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Outcome</span>
                                        <div className="lg:text-center">
                                            {dispute.outcome ? (
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${dispute.outcome === 'maker-favour' ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {dispute.outcome.replace('-', ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-200">−</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between lg:block w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-0 border-neutral-50 mt-2 lg:mt-0 items-center">
                                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Actions</span>
                                        <div className="lg:flex lg:justify-center">
                                            <Link 
                                                to={`/admin/ops/disputes/${dispute.id}`} 
                                                className="px-4 py-2 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10"
                                            >
                                                Resolve
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No disputes found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default AdminDisputes;
