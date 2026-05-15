import { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronDown, MoreVertical,
    Star,
    IndianRupee, MapPin, AlertCircle,
    UserX, UserMinus, Eye, ArrowRight, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const Makers = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [makers, setMakers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMakers();
    }, []);

    const fetchMakers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAdminArtisans();
            // Map status correctly if it's not present or different
            const normalizedData = data.map((m: any) => ({
                ...m,
                status: m.status || 'active', // Default to active for existing ones
                joinedDate: m.created_at || new Date().toISOString()
            }));
            setMakers(normalizedData);
        } catch (error) {
            console.error('Failed to fetch makers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const counts = {
        all: makers.length,
        active: makers.filter(m => m.status === 'active').length,
        paused: makers.filter(m => m.status === 'paused').length,
        suspended: makers.filter(m => m.status === 'suspended').length
    };

    const filteredMakers = useMemo(() => {
        let result = [...makers];
        if (activeTab !== 'all') {
            result = result.filter(m => m.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m =>
                (m.brand_name || '').toLowerCase().includes(q) ||
                (m.name || '').toLowerCase().includes(q) ||
                (m.location || '').toLowerCase().includes(q)
            );
        }

        if (sortBy === 'Newest') result.sort((a, b) => b.joinedDate.localeCompare(a.joinedDate));
        
        return result;
    }, [activeTab, searchQuery, sortBy, makers]);

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Platform Partners</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">All Makers</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Manage artisan shops, verify KYC, and monitor performance.</p>
                    </div>
                    <Link to="/admin/ops/makers/applications" className="flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm hover:bg-amber-100 transition-all group">
                        <span className="w-5 h-5 rounded-full bg-brand-pink text-white flex items-center justify-center text-[10px] font-black">3</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Pending Applications</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar">
                    {(['all', 'active', 'paused', 'suspended'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                                }`}
                        >
                            {tab} ({counts[tab]})
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
                            placeholder="Search by shop, maker, or craft..."
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
                            <option>Most Revenue</option>
                            <option>Most Orders</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 size={40} className="text-brand-pink animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Synchronizing Partner Data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Header Row */}
                            <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_100px_40px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                <div>Shop</div>
                                <div>Maker</div>
                                <div>Location</div>
                                <div className="text-center">Products</div>
                                <div className="text-center">Orders</div>
                                <div className="text-right">Revenue</div>
                                <div className="text-center">Rating</div>
                                <div className="text-center">Status</div>
                                <div />
                            </div>

                            {filteredMakers.length > 0 ? filteredMakers.map(maker => (
                                <div key={maker.id} className="bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all hover:shadow-sm">
                                    <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_100px_40px] gap-4 p-4 lg:p-6 items-center">

                                        {/* Shop */}
                                        <div className="flex items-center gap-4 w-full lg:w-auto">
                                            <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink text-xs font-black border border-brand-pink/20 shrink-0">
                                                {(maker.brand_name || maker.name || 'M').charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-neutral-950 truncate leading-tight">{maker.brand_name || 'Individual'}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{maker.slug || 'no-slug'}</p>
                                            </div>
                                        </div>

                                        {/* Maker */}
                                        <div className="w-full lg:w-auto flex flex-row lg:flex-col justify-between items-center lg:items-start border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-50">
                                            <p className="text-xs font-bold text-neutral-700">{maker.name || 'Unknown'}</p>
                                        </div>

                                        {/* Location */}
                                        <div className="w-full lg:w-auto flex items-center gap-1.5 text-neutral-400">
                                            <MapPin size={10} />
                                            <span className="text-[10px] font-medium">{maker.location || 'India'}</span>
                                        </div>

                                        {/* Products (Placeholder for now) */}
                                        <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Products</span>
                                            <p className="text-xs font-bold text-neutral-950">
                                                {maker.product_count || 0}
                                            </p>
                                        </div>

                                        {/* Orders (Placeholder for now) */}
                                        <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Orders</span>
                                            <p className="text-xs font-bold text-neutral-950">0</p>
                                        </div>

                                        {/* Revenue (Placeholder for now) */}
                                        <div className="w-full lg:w-auto flex justify-between lg:block text-right">
                                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Revenue</span>
                                            <p className="text-xs font-black text-neutral-950">₹0</p>
                                        </div>

                                        {/* Rating (Placeholder for now) */}
                                        <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Rating</span>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-xs font-bold text-neutral-950">5.0</span>
                                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Status</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${maker.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    maker.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {maker.status}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="relative flex justify-center w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-50 mt-2 lg:mt-0">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === maker.id ? null : maker.id)}
                                                className="p-2 hover:bg-neutral-50 rounded-sm transition-colors text-neutral-400 hover:text-neutral-950"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {openMenuId === maker.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-0 bottom-full lg:bottom-auto lg:top-full mb-2 lg:mb-0 lg:mt-1 w-48 bg-white border border-neutral-100 shadow-xl rounded-sm z-20 py-1 animate-in zoom-in-95 duration-150">
                                                        <Link to={`/admin/ops/makers/${maker.id}`} className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-brand-pink">
                                                            <Eye size={14} /> View Details
                                                        </Link>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-amber-600 text-left">
                                                            <UserX size={14} /> {maker.status === 'paused' ? 'Resume Shop' : 'Pause Shop'}
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left">
                                                            <UserMinus size={14} /> Suspend Account
                                                        </button>
                                                        <div className="border-t border-neutral-50 my-1" />
                                                        <Link to={`/admin/ops/payouts?makerId=${maker.id}`} className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950">
                                                            <IndianRupee size={14} /> View Payouts
                                                        </Link>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                                    <AlertCircle size={48} strokeWidth={1} className="text-neutral-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No makers found</h3>
                                    <p className="text-sm text-neutral-400 font-light max-w-sm mx-auto">Try adjusting your filters or search query to find the artisan you're looking for.</p>
                                    <button onClick={() => { setActiveTab('all'); setSearchQuery(''); }} className="mt-6 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline">Clear all filters</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default Makers;
