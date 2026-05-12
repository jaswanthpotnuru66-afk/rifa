import { useState, useMemo } from 'react';
import { 
    Search, ChevronDown, MoreVertical,
    Star,
    IndianRupee, MapPin, AlertCircle,
    UserX, UserMinus, Eye, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockAllMakers } from '../../../lib/adminOps.mock';

const Makers = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const counts = {
        all: mockAllMakers.length,
        active: mockAllMakers.filter(m => m.status === 'active').length,
        paused: mockAllMakers.filter(m => m.status === 'paused').length,
        suspended: mockAllMakers.filter(m => m.status === 'suspended').length
    };

    const filteredMakers = useMemo(() => {
        let result = [...mockAllMakers];
        if (activeTab !== 'all') {
            result = result.filter(m => m.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.shopName.toLowerCase().includes(q) || 
                m.makerName.toLowerCase().includes(q) || 
                m.originState.toLowerCase().includes(q) ||
                m.craftCategories.some(c => c.toLowerCase().includes(q))
            );
        }
        
        if (sortBy === 'Newest') result.sort((a, b) => b.joinedDate.localeCompare(a.joinedDate));
        if (sortBy === 'Most Revenue') result.sort((a, b) => b.totalRevenue - a.totalRevenue);
        if (sortBy === 'Most Orders') result.sort((a, b) => b.totalOrders - a.totalOrders);
        if (sortBy === 'Most Complaints') result.sort((a, b) => b.weightMismatchStrikes - a.weightMismatchStrikes);
        
        return result;
    }, [activeTab, searchQuery, sortBy]);

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
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
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
                            <option>Most Complaints</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="space-y-3">
                    {/* Header Row */}
                    <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_100px_80px_40px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div>Shop</div>
                        <div>Maker</div>
                        <div>Categories</div>
                        <div className="text-center">Listings</div>
                        <div className="text-center">Orders</div>
                        <div className="text-right">Revenue</div>
                        <div className="text-center">Rating</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Strikes</div>
                        <div />
                    </div>

                    {filteredMakers.length > 0 ? filteredMakers.map(maker => (
                        <div key={maker.id} className="bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all hover:shadow-sm">
                            <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_100px_80px_40px] gap-4 p-4 lg:p-6 items-center">
                                
                                {/* Shop */}
                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                    <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink text-xs font-black border border-brand-pink/20 shrink-0">
                                        {maker.shopName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-neutral-950 truncate leading-tight">{maker.shopName}</p>
                                        <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{maker.shopSlug}</p>
                                    </div>
                                </div>

                                {/* Maker */}
                                <div className="w-full lg:w-auto flex flex-row lg:flex-col justify-between items-center lg:items-start border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-50">
                                    <p className="text-xs font-bold text-neutral-700">{maker.makerName}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-neutral-400">
                                        <MapPin size={10} />
                                        <span className="text-[10px] font-medium">{maker.originState}</span>
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="w-full lg:w-auto flex flex-wrap gap-1.5 py-2 lg:py-0 border-y lg:border-y-0 border-neutral-50 my-1 lg:my-0">
                                    {maker.craftCategories.slice(0, 2).map(cat => (
                                        <span key={cat} className="px-2 py-0.5 bg-neutral-50 text-[8px] font-black uppercase tracking-widest text-neutral-500 rounded-sm border border-neutral-100">
                                            {cat}
                                        </span>
                                    ))}
                                    {maker.craftCategories.length > 2 && (
                                        <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">+{maker.craftCategories.length - 2} more</span>
                                    )}
                                </div>

                                {/* Listings */}
                                <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Listings</span>
                                    <p className="text-xs font-bold text-neutral-950">
                                        {maker.activeListings} <span className="text-neutral-300 font-normal">/ {maker.totalListings}</span>
                                    </p>
                                </div>

                                {/* Orders */}
                                <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Orders</span>
                                    <p className="text-xs font-bold text-neutral-950">{maker.totalOrders}</p>
                                </div>

                                {/* Revenue */}
                                <div className="w-full lg:w-auto flex justify-between lg:block text-right">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Revenue</span>
                                    <p className="text-xs font-black text-neutral-950">₹{maker.totalRevenue.toLocaleString()}</p>
                                </div>

                                {/* Rating */}
                                <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Rating</span>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-xs font-bold text-neutral-950">{maker.avgRating}</span>
                                        <Star size={10} className="text-amber-400 fill-amber-400" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                        maker.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                                        maker.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {maker.status}
                                    </span>
                                </div>

                                {/* Strikes */}
                                <div className="w-full lg:w-auto flex justify-between lg:block text-center">
                                    <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Strikes</span>
                                    <div className="flex items-center justify-center gap-0.5">
                                        {maker.weightMismatchStrikes > 0 ? (
                                            <span className="text-[10px] font-black text-red-500">🔴 ×{maker.weightMismatchStrikes}</span>
                                        ) : (
                                            <span className="text-neutral-200">−</span>
                                        )}
                                    </div>
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
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default Makers;
