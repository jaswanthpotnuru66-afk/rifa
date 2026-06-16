import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
    Search, ChevronDown, 
    Star, ArrowRight, Sparkles, X
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

const API_URL = 'http://localhost:3001/api';

const Marketplace = () => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const state = location.state as { category?: string } | null;
        return state?.category || 'All';
    });
    const [sortBy, setSortBy] = useState('Featured');
    const [isConciergeOpen, setIsConciergeOpen] = useState(() => {
        const state = location.state as { openConcierge?: boolean } | null;
        return !!state?.openConcierge;
    });
    const [conciergeStep, setConciergeStep] = useState(1);
    const [conciergeData, setConciergeData] = useState({
        forWhom: '',
        occasion: ''
    });



    useEffect(() => {
        const state = location.state as { openConcierge?: boolean } | null;
        if (state?.openConcierge) {
            setIsConciergeOpen(true);
            // Clean state to avoid re-opening on subsequent navigations
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Dynamic Data States
    const [products, setProducts] = useState<any[]>([]);
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const [conciergeQuestions, setConciergeQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoriesRes, conciergeRes] = await Promise.all([
                    fetch(`${API_URL}/products`),
                    fetch(`${API_URL}/categories`),
                    fetch(`${API_URL}/concierge/questions`)
                ]);

                if (!productsRes.ok) throw new Error('Failed to fetch data');

                const [productsData, categoriesData, conciergeData] = await Promise.all([
                    productsRes.json(),
                    categoriesRes.ok ? categoriesRes.json() : [],
                    conciergeRes.ok ? conciergeRes.json() : []
                ]);

                setProducts(productsData);
                setCategoriesList(categoriesData);
                setConciergeQuestions(conciergeData);
            } catch (err: any) {
                console.error('Fetch Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const categories = ['All', ...(categoriesList.length > 0 ? categoriesList.map(c => c.name) : Array.from(new Set(products.map(p => p.category))))];

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
                
                {/* ── Editorial Header with Atmospheric Blooms ── */}
                <header className="relative mb-24 md:mb-32 text-center max-w-5xl mx-auto pt-10">
                    
                    {/* Atmospheric Orbs (Behind Text) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10">
                        <motion.div 
                            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(212,84,122,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink block mb-8">
                            The Rifa Masterpieces
                        </span>
                        
                        <h1 className="text-6xl md:text-[9rem] font-serif font-bold text-neutral-950 tracking-tighter leading-[0.85] text-balance">
                            Curated <br />
                            <span className="italic font-light text-neutral-400">Brilliance.</span>
                        </h1>
                        
                        <p className="text-base md:text-lg font-light text-neutral-500 max-w-xl mx-auto leading-relaxed mt-12 px-4">
                            A sanctuary for multi-disciplinary art and personalized treasures. Where your unique visions find their form through the hands of master artisans.
                        </p>
                    </motion.div>
                </header>

                {/* ── Editorial Toolbar ── */}
                <div className="border-b border-neutral-200/50 mb-16 md:mb-24 pb-6 pt-4">
                    <div className="flex flex-col gap-8">
                        {/* Search Bar (Minimalist Line) */}
                        <div className="relative w-full max-w-2xl mx-auto group">
                            <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search the collection..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-transparent border-b-2 border-neutral-200 focus:border-brand-pink outline-none text-lg md:text-xl font-serif italic text-neutral-900 transition-colors placeholder:text-neutral-300"
                            />
                        </div>

                        {/* Horizontal Categories & Sort */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            
                            {/* Categories (Horizontal Scroll) */}
                            <div className="flex items-center gap-6 overflow-x-auto w-full no-scrollbar pb-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`shrink-0 text-[10px] font-black uppercase tracking-widest transition-all ${
                                            selectedCategory === cat 
                                            ? 'text-neutral-950 border-b-2 border-neutral-950 pb-1' 
                                            : 'text-neutral-400 hover:text-neutral-700 border-b-2 border-transparent pb-1'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Sort (Minimalist Select) */}
                            <div className="relative shrink-0 flex items-center gap-3">
                                <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Sort By</span>
                                <div className="relative">
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-transparent text-xs font-bold tracking-widest uppercase text-neutral-900 outline-none cursor-pointer pr-5 hover:text-brand-pink transition-colors"
                                    >
                                        <option>Featured</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Rating</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-900 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="flex flex-col h-full">
                            <Skeleton className="w-full aspect-[4/5] mb-8" />
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton className="w-16 h-3" />
                                <Skeleton className="w-8 h-3" />
                            </div>
                            <Skeleton className="w-3/4 h-8 mb-4" />
                            <Skeleton className="w-24 h-5 mt-auto" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="py-40 text-center">
                    <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] mb-4">Error loading collection</p>
                    <p className="text-neutral-400 font-light">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-8 px-10 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {/* Product Grid */}
                    <motion.div
                        key="products"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
                                {sortedProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx % 4) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        className="group flex flex-col"
                                    >
                                        <Link to={`/product/${product.id}`} className="flex flex-col h-full">
                                            {/* Image Container (Gallery style) */}
                                            <div className="relative aspect-[4/5] bg-white overflow-hidden mb-8 border border-neutral-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]">
                                                <img loading="lazy" 
                                                    src={product.images && product.images.length > 0 ? product.images[0] : ''} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
                                                />
                                                
                                                {/* Minimal Badges */}
                                                <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                                                    {product.tag && (
                                                        <span className="bg-white/90 backdrop-blur-sm text-neutral-950 text-[8px] font-black px-3 py-1.5 uppercase tracking-widest border border-neutral-200">
                                                            {product.tag}
                                                        </span>
                                                    )}
                                                    {product.isBespoke && (
                                                        <span className="bg-brand-pink text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Sparkles size={8} /> Bespoke
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content (Editorial Typography) */}
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-baseline mb-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                                        {product.category}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Star size={10} className="fill-brand-pink text-brand-pink" />
                                                        <span className="text-[10px] font-mono text-neutral-500">{product.rating}</span>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="font-serif text-2xl font-bold text-neutral-950 mb-1 leading-tight group-hover:text-brand-pink transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                
                                                {product.makerName && (
                                                    <p className="text-[11px] font-serif italic text-neutral-400 mb-6">
                                                        by <span className="text-neutral-600">{product.makerName}</span>
                                                    </p>
                                                )}
                                                
                                                <div className="mt-auto flex items-end justify-between pt-6 border-t border-neutral-100/50">
                                                    <p className="font-mono text-sm tracking-wider text-neutral-950">
                                                        ${product.price?.toLocaleString()}
                                                    </p>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 group-hover:text-neutral-950 transition-colors flex items-center gap-2">
                                                        View Details <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">→</span>
                                                    </span>
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
                </>
            )}

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
                                    {(conciergeQuestions.length > 0 ? conciergeQuestions : [1, 2, 3]).map((_, i) => (
                                        <div 
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${(i + 1) <= conciergeStep ? 'bg-brand-pink' : 'bg-neutral-100'}`}
                                        />
                                    ))}
                                </div>

                                {conciergeQuestions.length > 0 ? (
                                    <motion.div
                                        key={conciergeStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-serif font-bold text-neutral-900">{conciergeQuestions[conciergeStep - 1]?.question}</h3>
                                            <p className="text-xs text-neutral-400 font-light">{conciergeQuestions[conciergeStep - 1]?.subtext}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {conciergeQuestions[conciergeStep - 1]?.options?.map((opt: any) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        const key = conciergeStep === 1 ? 'forWhom' : 'occasion';
                                                        setConciergeData({ ...conciergeData, [key]: opt.value });
                                                        if (conciergeStep < conciergeQuestions.length) {
                                                            setConciergeStep(conciergeStep + 1);
                                                        } else {
                                                            setIsConciergeOpen(false);
                                                            // Filter logic would go here
                                                        }
                                                    }}
                                                    className="p-6 border text-center transition-all hover:shadow-lg border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* Fallback UI */
                                    conciergeStep === 1 && (
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
                                    )
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
                                                        <img loading="lazy" src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
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
