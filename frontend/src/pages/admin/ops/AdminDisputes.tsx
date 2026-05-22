import { useState, useMemo, useEffect } from 'react';
import {
    Search, AlertCircle, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'open' | 'under-review' | 'resolved'>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy] = useState('Newest');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAdminDisputes();
            setDisputes(data);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const counts = {
        all: disputes.length,
        open: disputes.filter(d => d.status === 'open').length,
        'under-review': disputes.filter(d => d.status === 'under-review').length,
        resolved: disputes.filter(d => d.status === 'resolved').length
    };

    const criticalDisputes = disputes.filter(d => {
        const diff = Date.now() - new Date(d.created_at).getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        return d.status !== 'resolved' && days > 2;
    }).length;

    const filteredDisputes = useMemo(() => {
        let result = [...disputes];
        if (activeTab !== 'all') {
            result = result.filter(d => d.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.id.toLowerCase().includes(q) ||
                (d.order_id || '').toLowerCase().includes(q) ||
                (d.artisans?.brand_name || '').toLowerCase().includes(q) ||
                (d.buyer?.full_name || '').toLowerCase().includes(q) ||
                (d.buyer?.email || '').toLowerCase().includes(q)
            );
        }

        if (sortBy === 'Oldest first') result.sort((a, b) => a.created_at.localeCompare(b.created_at));
        if (sortBy === 'Newest') result.sort((a, b) => b.created_at.localeCompare(a.created_at));

        return result;
    }, [activeTab, searchQuery, sortBy, disputes]);

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
                    </div>
                </div>

                {/* Disputes Table */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 size={40} className="text-brand-pink animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Synchronizing Complaints...</p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:grid grid-cols-[120px_1fr_1fr_1fr_100px_80px_100px_100px_80px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                <div>Dispute ID</div>
                                <div>Order ID</div>
                                <div>Buyer</div>
                                <div>Maker</div>
                                <div>Category</div>
                                <div>Raised</div>
                                <div className="text-center">Days</div>
                                <div className="text-center">Status</div>
                                <div />
                            </div>

                            {filteredDisputes.length > 0 ? filteredDisputes.map(dispute => {
                                const daysOpen = getDaysOpen(dispute.created_at);
                                const isUrgent = dispute.status !== 'resolved' && daysOpen > 3;

                                return (
                                    <div key={dispute.id} className={`bg-white border rounded-sm transition-all shadow-sm ${isUrgent ? 'bg-red-50/50 border-red-100' : 'border-neutral-100'}`}>
                                        <div className="flex flex-col lg:grid lg:grid-cols-[120px_1fr_1fr_1fr_100px_80px_100px_100px_80px] gap-4 p-4 lg:p-6 items-center">

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">ID</span>
                                                <div className="text-xs font-black text-neutral-950 font-inter">{dispute.id.slice(0, 8)}</div>
                                            </div>

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Order</span>
                                                <Link to={`/admin/ops/orders/${dispute.order_id}`} className="text-xs font-bold text-brand-pink hover:underline font-inter truncate block">{dispute.order_id}</Link>
                                            </div>

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Buyer</span>
                                                <div className="text-right lg:text-left">
                                                    <p className="text-xs font-bold text-neutral-900">{dispute.buyer?.full_name || '—'}</p>
                                                    <p className="text-[10px] text-neutral-400 font-light">{dispute.buyer?.email || ''}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Maker</span>
                                                <div className="text-right lg:text-left">
                                                    <p className="text-xs font-bold text-neutral-900">{dispute.artisans?.brand_name || 'Individual'}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Category</span>
                                                <div className="text-right lg:text-left">
                                                    <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-sm uppercase tracking-tight">{dispute.category}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Raised</span>
                                                <div className="text-[10px] font-medium text-neutral-500 font-inter">{new Date(dispute.created_at).toLocaleDateString()}</div>
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
                                                        {dispute.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between lg:block w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-0 border-neutral-50 mt-2 lg:mt-0 items-center">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Actions</span>
                                                <div className="lg:flex lg:justify-center">
                                                    <Link 
                                                        to={`/admin/ops/disputes/${dispute.id}`} 
                                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                                                            dispute.status === 'resolved'
                                                            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 shadow-none'
                                                            : 'bg-brand-pink text-white hover:bg-brand-pink-dark shadow-lg shadow-brand-pink/10'
                                                        }`}
                                                    >
                                                        {dispute.status === 'resolved' ? 'View' : 'Resolve'}
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
                        </>
                    )}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default AdminDisputes;
