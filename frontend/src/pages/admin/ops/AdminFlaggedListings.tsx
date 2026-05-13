import { useState, useMemo } from 'react';
import { 
    Flag, X, ExternalLink, Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockFlaggedListings } from '../../../lib/adminOps.mock';

const AdminFlaggedListings = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'open' | 'reviewed' | 'delisted'>('all');
    const [reasonFilter, setReasonFilter] = useState('All reasons');
    const [selectedListing, setSelectedListing] = useState<typeof mockFlaggedListings[0] | null>(null);

    const counts = {
        all: mockFlaggedListings.length,
        open: mockFlaggedListings.filter(l => l.status === 'open').length,
        reviewed: mockFlaggedListings.filter(l => l.status === 'reviewed').length,
        delisted: mockFlaggedListings.filter(l => l.status === 'delisted').length
    };

    const filteredListings = useMemo(() => {
        let result = [...mockFlaggedListings];
        if (activeTab !== 'all') {
            result = result.filter(l => l.status === activeTab);
        }
        if (reasonFilter !== 'All reasons') {
            result = result.filter(l => l.flagReason === reasonFilter.toLowerCase().replace(/ /g, '-'));
        }
        return result;
    }, [activeTab, reasonFilter]);

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Content Moderation</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Flagged Listings</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Review products flagged by system heuristics or buyer reports.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {(['all', 'open', 'reviewed', 'delisted'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-0.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                                }`}
                            >
                                {tab} ({counts[tab]})
                                {activeTab === tab && (
                                    <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-brand-pink" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={reasonFilter}
                            onChange={(e) => setReasonFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-white border border-neutral-100 rounded-sm text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-brand-pink/30 transition-all"
                        >
                            <option>All reasons</option>
                            <option>Copyright</option>
                            <option>Not handmade</option>
                            <option>Misleading</option>
                            <option>No material notice</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="space-y-3">
                    {/* Header */}
                    <div className="hidden lg:grid grid-cols-[80px_1.5fr_1fr_1.2fr_1fr_120px_100px_80px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div />
                        <div>Product</div>
                        <div>Maker</div>
                        <div>Flag Reason</div>
                        <div>Flagged By</div>
                        <div>Date</div>
                        <div className="text-center">Status</div>
                        <div />
                    </div>

                    {filteredListings.length > 0 ? filteredListings.map(listing => (
                        <div key={listing.id} className="bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all group shadow-sm">
                            <div className="flex flex-col lg:grid lg:grid-cols-[80px_1.5fr_1fr_1.2fr_1fr_120px_100px_80px] gap-4 p-4 lg:p-6 items-center">
                                
                                <div className="w-12 h-12 bg-neutral-50 rounded-sm flex items-center justify-center text-neutral-200">
                                    <Tag size={20} />
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-neutral-950 truncate">{listing.productName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">ID: {listing.listingId}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-neutral-700">{listing.makerShopName}</p>
                                    <Link to={`/admin/ops/makers/${listing.makerId}`} className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-brand-pink">View Maker</Link>
                                </div>

                                <div>
                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase tracking-widest rounded-sm">
                                        {listing.flagReason.replace(/-/g, ' ')}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                                        {listing.flaggedBy === 'system' ? '🤖 System Algorithm' : '👤 Buyer Report'}
                                    </span>
                                </div>

                                <div className="text-[10px] font-medium text-neutral-500">{new Date(listing.flaggedAt).toLocaleDateString()}</div>

                                <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                        listing.status === 'delisted' ? 'bg-red-50 text-red-700 border-red-100' :
                                        listing.status === 'reviewed' ? 'bg-green-50 text-green-700 border-green-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {listing.status}
                                    </span>
                                </div>

                                <div className="flex justify-center">
                                    <button 
                                        onClick={() => setSelectedListing(listing)}
                                        className="px-4 py-2 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10"
                                    >
                                        Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No flagged listings found</p>
                        </div>
                    )}
                </div>

                {/* Review Slide-over Panel */}
                {selectedListing && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <div 
                            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
                            onClick={() => setSelectedListing(null)}
                        />
                        <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                            
                            {/* Panel Header */}
                            <div className="px-8 py-6 bg-white border-b border-neutral-100 flex items-center justify-between shrink-0">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-pink mb-1">Moderation Review</p>
                                    <h2 className="text-xl font-serif font-bold text-neutral-950 tracking-tight">Review Listing</h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedListing(null)}
                                    className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-neutral-950"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                                
                                <div className="space-y-6">
                                    <div className="aspect-square w-40 mx-auto bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center text-neutral-200">
                                        <Tag size={48} strokeWidth={1} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-serif font-bold text-neutral-950">{selectedListing.productName}</h3>
                                        <p className="text-xs text-neutral-400 mt-1">Listing ID: {selectedListing.listingId}</p>
                                    </div>
                                </div>

                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-2">Violation Details</h4>
                                    <div className="bg-red-50 border border-red-100 p-6 rounded-sm space-y-3">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <Flag size={18} />
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">{selectedListing.flagReason.replace(/-/g, ' ')}</span>
                                        </div>
                                        <p className="text-sm font-medium text-red-700/70 leading-relaxed">
                                            {selectedListing.flagReason === 'copyright' ? 'Potential copyright infringement detected. Listing uses protected intellectual property without authorization.' :
                                             selectedListing.flagReason === 'not-handmade' ? 'Evidence suggests this item is factory-produced and violates the Platform\'s Handmade Policy.' :
                                             'Listing violates content quality guidelines and is misleading to potential buyers.'}
                                        </p>
                                        <div className="pt-3 border-t border-red-100 flex items-center justify-between text-[10px] font-bold text-red-600 uppercase">
                                            <span>Flagged By: {selectedListing.flaggedBy}</span>
                                            <span>{new Date(selectedListing.flaggedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-2">Maker Info</h4>
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-300">
                                                {selectedListing.makerShopName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-neutral-900">{selectedListing.makerShopName}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">Joined Jan 2025</p>
                                            </div>
                                        </div>
                                        <Link to={`/admin/ops/makers/${selectedListing.makerId}`} className="p-2 hover:bg-white rounded-full text-neutral-400 hover:text-brand-pink transition-all">
                                            <ExternalLink size={16} />
                                        </Link>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-2">Moderation History</h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-1 h-1 rounded-full bg-neutral-300 mt-1.5 shrink-0" />
                                            <p className="text-[11px] text-neutral-400 font-medium">No previous violations for this maker.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Panel Footer */}
                            <div className="p-8 bg-white border-t border-neutral-100 shrink-0 space-y-3">
                                <button className="w-full py-4 border border-neutral-200 text-neutral-950 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-50 transition-all">
                                    No Action — Mark Reviewed
                                </button>
                                {selectedListing.flagReason === 'no-material-notice' && (
                                    <button className="w-full py-4 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-amber-50 transition-all">
                                        Add Material Notice Warning
                                    </button>
                                )}
                                <button className="w-full py-4 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-50 transition-all">
                                    Delist Product
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminOpsLayout>
    );
};

export default AdminFlaggedListings;
