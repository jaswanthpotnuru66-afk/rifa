import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Plus, 
    Package, Edit2,
    Trash2, ChevronDown, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';
import MagneticButton from '../../components/MagneticButton';

type FilterStatus = 'all' | 'active' | 'pending' | 'paused' | 'draft' | 'customisable';

const Listings = () => {
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        setIsLoading(true);
        try {
            const data = await api.getArtisanProducts();
            setListings(data);
        } catch (err) {
            console.error('Error loading listings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this masterpiece?')) return;
        const success = await api.deleteProduct(id);
        if (success) {
            setListings(prev => prev.filter(l => l.id !== id));
        }
    };

    // Compute counts for tabs
    const counts = useMemo(() => {
        return {
            all: listings.length,
            active: listings.filter(l => l.status === 'active' || !l.status).length,
            pending: listings.filter(l => l.status === 'pending').length,
            paused: listings.filter(l => l.status === 'paused').length,
            draft: listings.filter(l => l.status === 'draft').length,
            customisable: listings.filter(l => l.is_custom).length,
        };
    }, [listings]);

    // Filter and Sort logic
    const filteredListings = useMemo(() => {
        let result = [...listings];

        // Status Filter
        if (activeTab === 'active') result = result.filter(l => l.status === 'active' || !l.status);
        if (activeTab === 'pending') result = result.filter(l => l.status === 'pending');
        if (activeTab === 'paused') result = result.filter(l => l.status === 'paused');
        if (activeTab === 'draft') result = result.filter(l => l.status === 'draft');
        if (activeTab === 'customisable') result = result.filter(l => l.is_custom);

        // Search
        if (searchQuery) {
            result = result.filter(l => 
                l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortBy === 'Oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortBy === 'Price: High to Low') return b.price - a.price;
            return 0;
        });

        return result;
    }, [listings, activeTab, searchQuery, sortBy]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredListings.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredListings.map(l => l.id));
        }
    };

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
        <CraftMakerLayout title="My Listings">
            <div className="space-y-8 animate-in fade-in duration-700">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Archives</h1>
                        <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest mt-1">Manage your collection of masterpieces</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <MagneticButton>
                            <Link 
                                to="/craftmaker/combos/new"
                                className="inline-flex items-center gap-2 px-6 py-4 bg-white border-2 border-brand-pink text-brand-pink text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-brand-pink hover:text-white transition-all"
                            >
                                <Package size={14} strokeWidth={3} /> Create Combo
                            </Link>
                        </MagneticButton>
                        <MagneticButton>
                            <Link 
                                to="/craftmaker/listings/new"
                                className="inline-flex items-center gap-2 px-6 py-4 bg-brand-pink border-2 border-brand-pink text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-pink/90 transition-all"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Listing
                            </Link>
                        </MagneticButton>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar pb-1">
                    {(['all', 'active', 'pending', 'paused', 'draft', 'customisable'] as FilterStatus[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-950'
                            }`}
                        >
                            {tab} <span className="ml-1 opacity-50">({counts[tab]})</span>
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="activeTab" 
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" 
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                    <div className="relative w-full md:w-96 group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-sm font-medium transition-all shadow-sm"
                        />
                    </div>

                    <div className="relative w-full md:w-auto">
                        <button 
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="w-full md:w-64 flex items-center justify-between px-6 py-3 bg-white border border-neutral-100 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm"
                        >
                            <span className="text-neutral-400 mr-2">Sort by:</span>
                            <span className="text-neutral-950">{sortBy}</span>
                            <ChevronDown size={14} className={`ml-2 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                            {showSortDropdown && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 left-0 md:left-auto md:w-64 mt-2 bg-white border border-neutral-100 rounded-sm shadow-2xl z-50 overflow-hidden"
                                >
                                    {['Newest', 'Oldest', 'Price: High to Low'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setSortBy(option);
                                                setShowSortDropdown(false);
                                            }}
                                            className="w-full px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors border-b last:border-0 border-neutral-50"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Listings Table */}
                <div className="space-y-2">
                    {/* Header */}
                    <div className="hidden md:flex items-center gap-4 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div className="w-4">
                            <input 
                                type="checkbox" 
                                checked={selectedIds.length === filteredListings.length && filteredListings.length > 0}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded border-neutral-300 text-brand-pink focus:ring-brand-pink"
                            />
                        </div>
                        <div className="w-12" />
                        <div className="flex-1">Product</div>
                        <div className="w-24 text-right">Price</div>
                        <div className="w-32 text-center">Status</div>
                        <div className="w-10 text-right">Actions</div>
                    </div>

                    {/* Rows */}
                    <AnimatePresence mode="popLayout">
                        {filteredListings.length > 0 ? (
                            filteredListings.map((listing) => (
                                <motion.div
                                    key={listing.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white border rounded-sm transition-all hover:shadow-md ${
                                        selectedIds.includes(listing.id) ? 'border-brand-pink/30 bg-brand-pink/[0.02]' : 'border-neutral-100'
                                    }`}
                                >
                                    {/* Mobile/Checkbox/Thumbnail */}
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(listing.id)}
                                            onChange={() => toggleSelection(listing.id)}
                                            className="w-4 h-4 rounded border-neutral-300 text-brand-pink focus:ring-brand-pink cursor-pointer"
                                        />
                                        <div className="w-12 h-12 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0 border border-neutral-100">
                                            {listing.images && listing.images[0] ? (
                                                <img loading="lazy" src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:hidden flex-1">
                                            <h3 className="text-sm font-bold text-neutral-950 truncate">{listing.name}</h3>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{listing.category}</span>
                                        </div>
                                    </div>

                                    {/* Desktop Product Info */}
                                    <div className="hidden md:block flex-1 min-w-0">
                                        <Link to={`/product/${listing.id}`}>
                                            <h3 className="text-sm font-bold text-neutral-950 truncate group-hover:text-brand-pink transition-colors">{listing.name}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">
                                                {listing.category}
                                            </span>
                                            {listing.is_custom && (
                                                <span className="inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
                                                    Customisable
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-6 md:gap-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-neutral-50">
                                        <div className="w-24 md:text-right">
                                            <span className="md:hidden text-[9px] font-black uppercase text-neutral-400 block mb-1 tracking-widest">Price</span>
                                            <span className="text-sm font-bold text-neutral-950 font-inter">₹{listing.price.toLocaleString()}</span>
                                        </div>
                                        <div className="w-28 flex md:justify-center">
                                            <span className="md:hidden text-[9px] font-black uppercase text-neutral-400 block mb-1 tracking-widest">Status</span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                (listing.status === 'active' || !listing.status) ? 'bg-green-50 text-green-700 border-green-100' :
                                                listing.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                listing.status === 'paused' ? 'bg-neutral-50 text-neutral-400 border-neutral-100' :
                                                'bg-neutral-50 text-neutral-500 border-neutral-100'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    (listing.status === 'active' || !listing.status) ? 'bg-green-500' :
                                                    listing.status === 'pending' ? 'bg-amber-500' :
                                                    listing.status === 'paused' ? 'bg-neutral-400' :
                                                    'bg-neutral-400'
                                                }`} />
                                                {listing.status === 'pending' ? 'Under Review' : (listing.status || 'active')}
                                            </span>
                                        </div>
                                        <div className="w-16 flex items-center justify-end gap-1">
                                            <Link 
                                                to={`/craftmaker/listings/${listing.id}/edit`}
                                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-brand-pink"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(listing.id)}
                                                className="p-2 hover:bg-red-50 rounded-full transition-colors text-neutral-300 hover:text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            /* Empty State */
                            <div className="py-24 px-6 flex flex-col items-center text-center bg-white border border-dashed border-neutral-200 rounded-sm">
                                <img loading="lazy" src="https://illustrations.popsy.co/amber/falling-objects.svg" alt="Empty" className="w-48 h-48 opacity-80 mb-4" />
                                <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No listings found</h3>
                                <p className="text-neutral-500 text-sm max-w-sm mb-6">Looks like you don't have any listings matching these filters. Add a new listing to start selling!</p>
                                <button 
                                    onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                                    className="bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-sm shadow-md hover:bg-brand-pink-dark transition-all"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Listings;
