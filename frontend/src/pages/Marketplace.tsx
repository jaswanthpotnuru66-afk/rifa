import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
    Search, Filter, ChevronDown, 
    Star, ArrowRight, Sparkles, X, User as UserIcon, Gift as GiftIcon
} from 'lucide-react';
import { products } from '../lib/products';
import { artisans } from '../lib/artisans';

const Marketplace = () => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const state = location.state as { category?: string } | null;
        return state?.category || 'All';
    });
    const [sortBy, setSortBy] = useState('Featured');
    const [showFilters, setShowFilters] = useState(false);
    const [view, setView] = useState<'products' | 'artisans'>('products');
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);
    const [conciergeStep, setConciergeStep] = useState(1);
    const [conciergeData, setConciergeData] = useState({
        forWhom: '',
        occasion: ''
    });

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        if (sortBy === 'Rating') return b.rating - a.rating;
        return 0; // Featured
    });

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-32 pb-20 selection:bg-brand-pink/20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Editorial Header */}
                <header className="mb-16 md:mb-24 text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink">Bespoke Artistry</span>
                        <h1 className="text-6xl md:text-8xl font-serif font-bold text-neutral-950 tracking-tighter leading-none">
                            The <br />
                            <span className="italic font-light text-neutral-400 text-5xl md:text-7xl">Collective.</span>
                        </h1>
                        <p className="text-lg font-light text-neutral-500 max-w-xl mx-auto leading-relaxed mt-8">
                            A curated sanctuary for multi-disciplinary art and personalized treasures. Where your unique visions find their form through the hands of master artisans.
                        </p>
                    </motion.div>
                </header>

                {/* View Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex bg-white p-1.5 rounded-full border border-neutral-100 shadow-sm">
                        <button
                            onClick={() => setView('products')}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                view === 'products'
                                    ? 'bg-neutral-950 text-white shadow-lg'
                                    : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                        >
                            Masterpieces
                        </button>
                        <button
                            onClick={() => setView('artisans')}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                view === 'artisans'
                                    ? 'bg-neutral-950 text-white shadow-lg'
                                    : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                        >
                            The Artisans
                        </button>
                    </div>
                </div>

                {/* Refined Toolbar */}
                <div className="z-30 bg-transparent border-b border-neutral-200 mb-16">
                    <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96 group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search the collection..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-sm font-medium transition-all"
                            />
                        </div>

                        {/* Filters & Sorting */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white border border-neutral-100 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-all"
                            >
                                <Filter size={14} /> 
                                <span>{selectedCategory}</span>
                                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            <div className="relative flex-1 md:flex-none">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full appearance-none px-6 py-3 bg-white border border-neutral-100 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 outline-none transition-all cursor-pointer pr-12"
                                >
                                    <option>Featured</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Rating</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Category Drawer */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-neutral-100"
                            >
                                <div className="py-6 flex flex-wrap gap-3">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setShowFilters(false);
                                            }}
                                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                selectedCategory === cat 
                                                ? 'bg-neutral-950 text-white border-neutral-950' 
                                                : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Product/Artisan Grid */}
                <AnimatePresence mode="wait">
                    {view === 'products' ? (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                                {sortedProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx % 4) * 0.1, duration: 0.6 }}
                                        viewport={{ once: true }}
                                        className="group flex flex-col"
                                    >
                                        <Link to={`/product/${product.id}`} className="flex flex-col h-full">
                                            {/* Image Container */}
                                            <div className="relative aspect-[4/5] bg-white overflow-hidden mb-6 border border-neutral-100">
                                                <img 
                                                    src={product.images && product.images.length > 0 ? product.images[0] : ''} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                
                                                {/* Badges */}
                                                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                                    {product.tag && (
                                                        <span className="bg-brand-pink text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl">
                                                            {product.tag}
                                                        </span>
                                                    )}
                                                    {product.isReady && (
                                                        <span className="bg-neutral-950 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl">
                                                            Ready to Ship
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <span className="px-8 py-4 bg-white text-neutral-950 text-[10px] font-black uppercase tracking-[0.3em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                        Examine Piece
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-col flex-grow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-brand-pink transition-colors">
                                                        {product.category}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <Star size={10} className="fill-brand-gold text-brand-gold" />
                                                        <span className="text-[10px] font-bold text-neutral-950">{product.rating}</span>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="font-serif text-xl text-neutral-950 mb-4 leading-snug group-hover:italic transition-all">
                                                    {product.name}
                                                </h3>
                                                
                                                <div className="mt-auto flex items-baseline gap-3">
                                                    <span className="text-xl font-bold text-neutral-950">Rs. {product.price.toLocaleString()}</span>
                                                    {product.originalPrice && (
                                                        <span className="text-sm text-neutral-300 line-through font-light">Rs. {product.originalPrice.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {sortedProducts.length === 0 && (
                                <div className="py-40 text-center">
                                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8 text-neutral-300">
                                        <Search size={32} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-neutral-950 mb-2">No masterpieces found</h3>
                                    <p className="text-neutral-400 font-light max-w-sm mx-auto">Your current search parameters did not return any pieces from our archives.</p>
                                    <button 
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('All');
                                        }}
                                        className="mt-8 px-10 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 hover:border-neutral-950 transition-all"
                                    >
                                        Reset Archives
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="artisans"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {artisans.map((artisan, idx) => (
                                    <motion.div
                                        key={artisan.id}
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8 }}
                                        viewport={{ once: true }}
                                        className="group"
                                    >
                                        <Link to={`/artisan/${artisan.id}`} className="grid md:grid-cols-2 gap-8 items-center bg-white p-8 border border-neutral-100 hover:border-brand-pink/30 transition-all duration-500">
                                            <div className="aspect-[4/5] overflow-hidden">
                                                <img 
                                                    src={artisan.img} 
                                                    alt={artisan.name}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                                                />
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{artisan.location}</span>
                                                    <h3 className="text-3xl font-serif font-bold text-neutral-950 leading-tight">
                                                        {artisan.name}
                                                    </h3>
                                                </div>
                                                <p className="text-sm font-light text-neutral-500 leading-relaxed line-clamp-3 italic">
                                                    "{artisan.story}"
                                                </p>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-neutral-50 pb-2">
                                                        <span className="text-neutral-300">Specialty</span>
                                                        <span className="text-neutral-950">{artisan.specialty}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-neutral-50 pb-2">
                                                        <span className="text-neutral-300">Collection</span>
                                                        <span className="text-neutral-950">{artisan.productCount} Pieces</span>
                                                    </div>
                                                </div>
                                                <div className="pt-4">
                                                    <span className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-pink group-hover:gap-5 transition-all">
                                                        Explore Studio <ArrowRight size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CTA Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 md:p-24 bg-neutral-950 text-white text-center relative overflow-hidden"
                >
                    <div className="relative z-10 space-y-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink">Bespoke Portal</span>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold max-w-3xl mx-auto tracking-tighter">
                            Can't find exactly what you're imagining?
                        </h2>
                        <p className="text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed">
                            Our artisans specialize in materializing unique visions. If you have a specific concept in mind, we can build it from the ground up just for you.
                        </p>
                        <Link 
                            to="/custom-order"
                            className="inline-flex items-center gap-4 px-12 py-5 bg-white text-neutral-950 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink hover:text-white transition-all group"
                        >
                            Commission a Piece <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-pink/10 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-pink/5 rounded-full blur-[100px]" />
                </motion.section>
            </div>

            {/* --- GIFT CONCIERGE FLOATING UI --- */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsConciergeOpen(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-neutral-950 text-white rounded-full shadow-2xl hover:bg-neutral-800 transition-all group"
                >
                    <div className="relative">
                        <Sparkles size={18} className="text-brand-pink animate-pulse" />
                        <div className="absolute inset-0 bg-brand-pink/40 blur-lg group-hover:blur-xl transition-all" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gifting Concierge</span>
                </motion.button>
            </div>

            <AnimatePresence>
                {isConciergeOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConciergeOpen(false)}
                            className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-[110]"
                        />
                        
                        {/* Concierge Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[120] flex flex-col"
                        >
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-[#FAF7F2]">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink">Curated Service</span>
                                    <h2 className="text-2xl font-serif font-bold text-neutral-950">Gift Concierge</h2>
                                </div>
                                <button 
                                    onClick={() => setIsConciergeOpen(false)}
                                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-12">
                                {/* Step Indicator */}
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(step => (
                                        <div 
                                            key={step}
                                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${step <= conciergeStep ? 'bg-brand-pink' : 'bg-neutral-100'}`}
                                        />
                                    ))}
                                </div>

                                {conciergeStep === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-serif font-bold text-neutral-900">Who are we celebrating?</h3>
                                            <p className="text-xs text-neutral-400 font-light">Select the recipient of this artisan treasure.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Partner', 'Parents', 'Friends', 'Colleague', 'Self', 'Other'].map(item => (
                                                <button
                                                    key={item}
                                                    onClick={() => {
                                                        setConciergeData({ ...conciergeData, forWhom: item });
                                                        setConciergeStep(2);
                                                    }}
                                                    className={`p-6 border text-center transition-all hover:shadow-lg ${
                                                        conciergeData.forWhom === item 
                                                        ? 'border-neutral-950 bg-neutral-950 text-white' 
                                                        : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {conciergeStep === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <button 
                                            onClick={() => setConciergeStep(1)}
                                            className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2 hover:text-neutral-950 transition-colors"
                                        >
                                            <ArrowRight size={10} className="rotate-180" /> Back to Recipient
                                        </button>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-serif font-bold text-neutral-900">What is the occasion?</h3>
                                            <p className="text-xs text-neutral-400 font-light">Every moment deserves a unique craft.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Birthday', 'Wedding', 'Anniversary', 'Housewarming', 'Just Because', 'Seasonal'].map(item => (
                                                <button
                                                    key={item}
                                                    onClick={() => setConciergeData({ ...conciergeData, occasion: item })}
                                                    className={`p-6 border text-center transition-all hover:shadow-lg ${
                                                        conciergeData.occasion === item 
                                                        ? 'border-neutral-950 bg-neutral-950 text-white' 
                                                        : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {conciergeStep === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-serif font-bold text-neutral-900">Curated for {conciergeData.forWhom}</h3>
                                            <p className="text-xs text-neutral-400 font-light">Handpicked from our archives for a {conciergeData.occasion}.</p>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {products.slice(0, 3).map((product) => (
                                                <Link 
                                                    key={product.id}
                                                    to={`/product/${product.id}`}
                                                    className="flex gap-4 group/item"
                                                >
                                                    <div className="w-20 h-24 bg-neutral-100 overflow-hidden shrink-0">
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink mb-1">{product.category}</p>
                                                        <h4 className="text-sm font-serif font-bold text-neutral-900 leading-tight mb-1">{product.name}</h4>
                                                        <p className="text-xs font-bold text-neutral-950">Rs. {product.price.toLocaleString()}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="p-6 bg-brand-rose-50 border border-brand-rose-100 rounded-sm">
                                            <p className="text-[10px] text-brand-pink font-bold uppercase tracking-widest leading-relaxed">
                                                These pieces are trending for {conciergeData.occasion} gifts.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-8 bg-neutral-50 border-t border-neutral-100">
                                {conciergeStep < 3 ? (
                                    <button
                                        disabled={!conciergeData.forWhom || !conciergeData.occasion}
                                        onClick={() => setConciergeStep(3)}
                                        className="w-full py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.4em] disabled:bg-neutral-200 transition-all hover:bg-brand-pink"
                                    >
                                        Reveal Recommendations
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsConciergeOpen(false)}
                                        className="w-full py-5 border-2 border-neutral-950 text-neutral-950 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-950 hover:text-white transition-all"
                                    >
                                        Close Concierge
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Marketplace;
