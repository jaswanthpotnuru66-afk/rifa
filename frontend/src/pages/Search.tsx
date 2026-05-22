import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Search, Star, ArrowRight, Sparkles, X, 
    Loader2, SlidersHorizontal, ChevronRight, ShoppingBag, 
    MapPin, Sparkle, Tag, HelpCircle
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// Popular / Trending search keywords for instant discovery
const TRENDING_SEARCHES = [
    { label: 'Tanjore Painting', query: 'Tanjore' },
    { label: 'Clay Pots', query: 'clay' },
    { label: 'Terracotta', query: 'terracotta' },
    { label: 'Bespoke Combos', query: 'combo' },
    { label: 'Wooden Sculptures', query: 'wood' },
    { label: 'Silk Textiles', query: 'silk' }
];

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>({ products: [], artisans: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Relevance');
    const [showFilters, setShowFilters] = useState(false);
    const [maxPrice, setMaxPrice] = useState(50000);
    const [readyToShipOnly, setReadyToShipOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'products' | 'artisans'>('all');
    
    // Discover states (preloaded content when search is empty)
    const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [preloading, setPreloading] = useState(true);

    // Fetch initial discover content
    useEffect(() => {
        const fetchDiscoverContent = async () => {
            try {
                setPreloading(true);
                const [artRes, prodRes, catRes] = await Promise.all([
                    fetch(`${API_URL}/artisans?limit=4`),
                    fetch(`${API_URL}/products?limit=8`),
                    fetch(`${API_URL}/categories`)
                ]);

                if (artRes.ok) {
                    const artData = await artRes.json();
                    setFeaturedArtisans(artData);
                }
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setTrendingProducts(prodData);
                }
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(['All', ...catData.map((c: any) => c.name)]);
                }
            } catch (err) {
                console.error('Error fetching discover content:', err);
            } finally {
                setPreloading(false);
            }
        };

        fetchDiscoverContent();
    }, []);

    // Debounced search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true);
                try {
                    const res = await fetch(`${API_URL}/search?q=${searchQuery}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data);
                    }
                } catch (err) {
                    console.error('Search query error:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ products: [], artisans: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Apply Client-Side Filters & Sorting
    const filteredProducts = (searchQuery.trim() ? searchResults.products : trendingProducts).filter((p: any) => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesPrice = p.price <= maxPrice;
        const matchesShipping = !readyToShipOnly || p.is_ready;
        return matchesCategory && matchesPrice && matchesShipping;
    });

    const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // Relevance / Default
    });

    const displayArtisans = searchQuery.trim() ? searchResults.artisans : featuredArtisans;

    const handleQuickSearch = (query: string) => {
        setSearchQuery(query);
    };

    const clearAllFilters = () => {
        setSelectedCategory('All');
        setMaxPrice(50000);
        setReadyToShipOnly(false);
        setSortBy('Relevance');
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-32 pb-24 selection:bg-brand-pink/20 relative overflow-hidden">
            {/* Background Aesthetic Gradients */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-rose-50/40 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-brand-pink/5 to-transparent rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Search Header Design */}
                <header className="max-w-4xl mx-auto text-center mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink flex items-center justify-center gap-1.5">
                            <Sparkle size={10} className="text-brand-pink animate-spin-slow" />
                            Discover Masterpieces
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-neutral-900 tracking-tight leading-tight">
                            Search the <span className="italic font-light text-neutral-400">Archives.</span>
                        </h1>
                        <p className="text-sm font-light text-neutral-500 max-w-lg mx-auto leading-relaxed">
                            Search across hundreds of dynamically cataloged bespoke creations, handcrafted artifacts, and regional master artisans.
                        </p>
                    </motion.div>
                </header>

                {/* Highly Dynamic Search Input Bar */}
                <section className="max-w-3xl mx-auto mb-12">
                    <div className="relative group shadow-2xl rounded-full bg-white border border-neutral-100 p-2 focus-within:border-brand-pink transition-all duration-300">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors duration-300" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Type raw materials, craft categories, or artisan names..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-24 py-4 text-lg md:text-xl font-serif bg-transparent outline-none placeholder:text-neutral-300 text-neutral-900 focus:placeholder:opacity-50"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-20 top-1/2 -translate-y-1/2 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <X size={16} className="text-neutral-400" />
                            </button>
                        )}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            {isSearching ? (
                                <Loader2 size={16} className="text-brand-pink animate-spin" />
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-300 bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-md hidden md:inline-block select-none">
                                    Dynamic
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Search Recommendations / Trending Tags */}
                    <div className="mt-6 flex flex-wrap gap-2 items-center justify-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                            <Sparkles size={10} className="text-brand-pink" /> Trending:
                        </span>
                        {TRENDING_SEARCHES.map((t) => (
                            <button
                                key={t.label}
                                onClick={() => handleQuickSearch(t.query)}
                                className={`text-[10px] font-bold tracking-wider uppercase px-4 py-2 border rounded-full transition-all duration-300 ${
                                    searchQuery === t.query 
                                    ? 'bg-neutral-900 text-white border-neutral-900' 
                                    : 'bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300 hover:text-neutral-800'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Filters Toggle and Sorting Toolbar */}
                <div className="border-t border-b border-neutral-200 py-6 mb-12 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2.5 px-6 py-3 border text-xs font-bold tracking-widest uppercase transition-all rounded-sm ${
                                showFilters 
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50'
                            }`}
                        >
                            <SlidersHorizontal size={14} />
                            <span>Filters</span>
                            { (selectedCategory !== 'All' || maxPrice < 50000 || readyToShipOnly) && (
                                <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                            )}
                        </button>

                        <div className="inline-flex bg-neutral-100 p-1 rounded-sm border border-neutral-200 text-[10px] font-black uppercase tracking-widest">
                            <button 
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-2 transition-all rounded-sm ${viewMode === 'all' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                All Results
                            </button>
                            <button 
                                onClick={() => setViewMode('products')}
                                className={`px-4 py-2 transition-all rounded-sm ${viewMode === 'products' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Masterpieces ({sortedProducts.length})
                            </button>
                            <button 
                                onClick={() => setViewMode('artisans')}
                                className={`px-4 py-2 transition-all rounded-sm ${viewMode === 'artisans' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Artisans ({displayArtisans.length})
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sort:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-3 bg-white border border-neutral-100 rounded-sm text-xs font-bold tracking-widest uppercase outline-none cursor-pointer hover:bg-neutral-50 transition-colors"
                            >
                                <option>Relevance</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Rating</option>
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</span>
                        </div>
                    </div>
                </div>

                {/* Expandable Advanced Filters drawer */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-b border-neutral-200 mb-12 bg-white rounded-sm border border-neutral-100 p-8 shadow-sm"
                        >
                            <div className="grid md:grid-cols-3 gap-8">
                                {/* Category Filters */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 pb-2 border-b border-neutral-50 flex items-center gap-1.5">
                                        <Tag size={10} className="text-brand-pink" /> Categories
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider border rounded-full transition-all ${
                                                    selectedCategory === cat
                                                    ? 'bg-brand-pink text-white border-brand-pink shadow-md'
                                                    : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 pb-2 border-b border-neutral-50 flex items-center justify-between">
                                        <span>Max Budget</span>
                                        <span className="text-neutral-900 font-bold">Rs. {maxPrice.toLocaleString()}</span>
                                    </h4>
                                    <div className="space-y-4">
                                        <input 
                                            type="range"
                                            min="500"
                                            max="100000"
                                            step="500"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                                            className="w-full h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-brand-pink"
                                        />
                                        <div className="flex justify-between text-[8px] font-bold text-neutral-400 uppercase tracking-widest">
                                            <span>Rs. 500</span>
                                            <span>Rs. 100k+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability / Features Filter */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 pb-2 border-b border-neutral-50 flex items-center gap-1.5">
                                        <ShoppingBag size={10} className="text-brand-pink" /> Preferences
                                    </h4>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 cursor-pointer group select-none">
                                            <input 
                                                type="checkbox"
                                                checked={readyToShipOnly}
                                                onChange={(e) => setReadyToShipOnly(e.target.checked)}
                                                className="w-4 h-4 rounded border-neutral-200 text-brand-pink focus:ring-brand-pink accent-brand-pink"
                                            />
                                            <span className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">
                                                Ready to Ship (Instant Fulfilment)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-neutral-50 flex justify-end gap-3">
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
                                >
                                    Reset Filters
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="px-8 py-2.5 bg-neutral-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Preloading / Discover Section when Search Query is Empty */}
                {!searchQuery.trim() && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-20"
                    >
                        {/* Featured Showcase Title */}
                        <div className="text-center py-6 border-b border-neutral-100 max-w-xl mx-auto">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
                                Discover Our Curated Collection
                            </h2>
                        </div>

                        {/* Discover Masterpieces */}
                        {(viewMode === 'all' || viewMode === 'products') && (
                            <section className="space-y-8">
                                <div className="flex justify-between items-end border-b border-neutral-100 pb-4">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-pink">Trending Right Now</span>
                                        <h3 className="text-2xl font-serif font-bold text-neutral-900">Featured Masterpieces</h3>
                                    </div>
                                    <Link to="/marketplace" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-pink transition-colors flex items-center gap-1 group">
                                        View Full Catalog <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                {preloading ? (
                                    <div className="py-20 flex justify-center"><Loader2 size={32} className="text-brand-pink animate-spin" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {sortedProducts.slice(0, 4).map((p: any) => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Discover Artisans */}
                        {(viewMode === 'all' || viewMode === 'artisans') && (
                            <section className="space-y-8">
                                <div className="flex justify-between items-end border-b border-neutral-100 pb-4">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-pink">The Soul of Rifa</span>
                                        <h3 className="text-2xl font-serif font-bold text-neutral-900">Meet Our Master Artisans</h3>
                                    </div>
                                </div>

                                {preloading ? (
                                    <div className="py-20 flex justify-center"><Loader2 size={32} className="text-brand-pink animate-spin" /></div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {displayArtisans.slice(0, 2).map((artisan: any) => (
                                            <ArtisanCard key={artisan.id} artisan={artisan} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </motion.div>
                )}

                {/* Real-time Dynamic Results Container */}
                {searchQuery.trim() && (
                    <div className="space-y-20">
                        {/* Products Results */}
                        {(viewMode === 'all' || viewMode === 'products') && (
                            <section className="space-y-8">
                                <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Found {sortedProducts.length} pieces</span>
                                        <h3 className="text-2xl font-serif font-bold text-neutral-900">Matching Masterpieces</h3>
                                    </div>
                                </div>

                                {sortedProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {sortedProducts.map((p: any) => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-light text-neutral-400 italic py-8">
                                        No matching masterpieces found in our archives for this specific filter.
                                    </p>
                                )}
                            </section>
                        )}

                        {/* Artisans Results */}
                        {(viewMode === 'all' || viewMode === 'artisans') && (
                            <section className="space-y-8">
                                <div className="border-b border-neutral-100 pb-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Found {displayArtisans.length} creators</span>
                                    <h3 className="text-2xl font-serif font-bold text-neutral-900">Master Artisans</h3>
                                </div>

                                {displayArtisans.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {displayArtisans.map((artisan: any) => (
                                            <ArtisanCard key={artisan.id} artisan={artisan} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-light text-neutral-400 italic py-8">
                                        No master artisans matched this query in our regional rosters.
                                    </p>
                                )}
                            </section>
                        )}

                        {/* Combined Empty State */}
                        {sortedProducts.length === 0 && displayArtisans.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-xl mx-auto text-center py-20 bg-white border border-neutral-100 rounded-sm p-12 shadow-sm"
                            >
                                <div className="w-16 h-16 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                    <HelpCircle size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-neutral-950 mb-2">No masterpieces found</h3>
                                <p className="text-neutral-400 font-light text-sm max-w-sm mx-auto leading-relaxed mb-8">
                                    Your current search parameters did not match any items in our archives. Perhaps commission a customized piece from our creators?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="px-8 py-3.5 border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 hover:border-neutral-950 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                    <Link 
                                        to="/custom-order"
                                        className="px-8 py-3.5 bg-neutral-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink transition-colors flex items-center justify-center gap-2"
                                    >
                                        Commission Bespoke Piece <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== SUB-COMPONENTS FOR BETTER STRUCTURE ====================

const ProductCard = ({ product }: { product: any }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white border border-neutral-100 hover:border-brand-pink/30 hover:shadow-xl transition-all duration-500 rounded-sm overflow-hidden flex flex-col h-full"
        >
            <Link to={`/product/${product.id}`} className="flex flex-col h-full">
                {/* Image Aspect ratio container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF7F2] border-b border-neutral-50">
                    <img loading="lazy" 
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {product.tag && (
                            <span className="bg-brand-pink text-white text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 shadow-lg">
                                {product.tag}
                            </span>
                        )}
                        {product.is_ready && (
                            <span className="bg-neutral-950 text-white text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 shadow-lg">
                                Ready to Ship
                            </span>
                        )}
                    </div>

                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-6 py-3 bg-white text-neutral-950 text-[9px] font-black uppercase tracking-[0.25em] translate-y-3 group-hover:translate-y-0 transition-transform duration-500 rounded-sm">
                            Examine Piece
                        </span>
                    </div>
                </div>

                {/* Text Content */}
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-brand-pink transition-colors">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star size={9} className="fill-brand-gold text-brand-gold" />
                            <span className="text-[9px] font-bold text-neutral-900">{product.rating || '4.5'}</span>
                        </div>
                    </div>

                    <h4 className="font-serif text-base text-neutral-950 leading-snug group-hover:italic transition-all duration-300 mb-3">
                        {product.name}
                    </h4>

                    {/* Artisan Reference */}
                    {product.artisans && (
                        <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <MapPin size={10} className="text-neutral-300" />
                            By {product.artisans.name} ({product.artisans.location})
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-neutral-50 flex items-baseline gap-2">
                        <span className="text-base font-bold text-neutral-900">Rs. {product.price.toLocaleString()}</span>
                        {product.original_price && (
                            <span className="text-xs text-neutral-300 line-through font-light">
                                Rs. {product.original_price.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const ArtisanCard = ({ artisan }: { artisan: any }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link 
                to={`/rifa/${artisan.id}`} 
                className="grid sm:grid-cols-5 gap-6 items-center bg-white p-6 border border-neutral-100 hover:border-brand-pink/20 hover:shadow-xl transition-all duration-500 rounded-sm"
            >
                <div className="sm:col-span-2 aspect-[4/5] overflow-hidden bg-[#FAF7F2] rounded-sm flex items-center justify-center">
                    {artisan.img ? (
                        <img loading="lazy" 
                            src={artisan.img} 
                            alt={artisan.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                    ) : (
                        <span className="text-6xl font-serif text-brand-pink/30 font-bold uppercase">{artisan.name?.charAt(0) || 'A'}</span>
                    )}
                </div>
                <div className="sm:col-span-3 space-y-4">
                    <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                            <MapPin size={8} /> {artisan.location}
                        </span>
                        <h4 className="text-2xl font-serif font-bold text-neutral-950 leading-tight">
                            {artisan.name}
                        </h4>
                    </div>

                    <p className="text-xs font-light text-neutral-500 leading-relaxed line-clamp-3 italic">
                        "{artisan.story || 'A regional master dedicated to conserving classical heritage and craft techniques.'}"
                    </p>

                    <div className="pt-2 space-y-2 border-t border-neutral-50">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                            <span className="text-neutral-400">Specialty</span>
                            <span className="text-neutral-900">{artisan.specialty}</span>
                        </div>
                        {artisan.productCount !== undefined && (
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                <span className="text-neutral-400">Collection</span>
                                <span className="text-neutral-900">{artisan.productCount} Pieces</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-pink group-hover:gap-4 transition-all duration-300">
                            Explore Studio <ArrowRight size={10} />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default SearchPage;
