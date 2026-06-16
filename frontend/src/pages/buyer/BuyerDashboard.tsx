import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Sparkles, ArrowRight, Star, ShoppingBag, 
    Heart, Clock, LayoutGrid, Users, Zap
} from 'lucide-react';

import { api } from '../../lib/api';
import GiftingConciergePanel from '../../components/GiftingConciergePanel';

const API_URL = 'http://localhost:3001/api';

const BuyerDashboard = () => {
    const [user] = useState<any>(api.getUser() || {});
    const [products, setProducts] = useState<any[]>([]);
    const [artisans, setArtisans] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingArtisans, setIsLoadingArtisans] = useState(true);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/products?limit=12`)
            .then(res => res.json())
            .then(data => { setProducts(data); setIsLoadingProducts(false); })
            .catch(err => { console.error(err); setIsLoadingProducts(false); });

        fetch(`${API_URL}/artisans?limit=6`)
            .then(res => res.json())
            .then(data => { setArtisans(data); setIsLoadingArtisans(false); })
            .catch(err => { console.error(err); setIsLoadingArtisans(false); });

        api.getOrders()
            .then(data => { setOrders(Array.isArray(data) ? data : []); setIsLoadingOrders(false); })
            .catch(err => { console.error(err); setIsLoadingOrders(false); });

        api.getWishlist()
            .then(data => { setWishlist(Array.isArray(data) ? data : []); setIsLoadingWishlist(false); })
            .catch(err => { console.error(err); setIsLoadingWishlist(false); });

        api.getCart()
            .then(data => { setCart(Array.isArray(data) ? data : []); setIsLoadingCart(false); })
            .catch(err => { console.error(err); setIsLoadingCart(false); });
    }, []);

    const fadeInUp: any = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    const handleAddToCart = async (product: any) => {
        const currentUser = api.getUser();
        if (!currentUser) {
            window.location.href = '/auth';
            return;
        }

        try {
            await api.addToCart({
                user_id: currentUser.id,
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1,
                image_url: product.images[0],
                artisan_id: product.artisan_id || product.artisanId
            });
            window.location.href = '/cart';
        } catch (err) {
            console.error('Quick add to cart error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-32 pb-20 selection:bg-brand-pink/20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Digital Proof Notifications */}
                {orders.some(o => o.proofStatus === 'sent') && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 p-6 bg-brand-pink text-white rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse shrink-0">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80 block">🎨 Bespoke Design Alert</span>
                                <p className="text-sm font-serif font-bold mt-1 text-white leading-relaxed">
                                    An artisan has submitted a digital mockup proof for your order. Please review it now to approve production.
                                </p>
                            </div>
                        </div>
                        <Link 
                            to="/profile" 
                            onClick={() => {
                                const target = orders.find(o => o.proofStatus === 'sent');
                                if (target) {
                                    sessionStorage.setItem('active_tab', 'orders');
                                    sessionStorage.setItem('selected_order_id', target.id);
                                }
                            }}
                            className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-950 text-[10px] font-black uppercase tracking-widest shrink-0 transition-all shadow-md relative z-10"
                        >
                            Review Proof
                        </Link>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 skew-x-12 transform translate-x-12 select-none pointer-events-none" />
                    </motion.div>
                )}
                
                {/* 1. Personalized Header */}
                <header className="mb-16">
                    <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-pink mb-4 block">Exclusive Access</span>
                            <h1 className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 tracking-tighter leading-none">
                                Welcome, <span className="italic font-light text-neutral-400">{user.full_name?.split(' ')[0] || 'Collector'}</span>.
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            {user?.role === 'artisan' && (
                                <Link 
                                    to="/craftmaker/dashboard" 
                                    className="flex items-center gap-3 px-6 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-950 transition-all shadow-xl"
                                >
                                    Maker Dashboard
                                </Link>
                            )}
                            <Link to="/profile" className="flex items-center gap-3 px-6 py-4 bg-white border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:border-neutral-950 transition-all">
                                <Clock size={14} /> Acquisition History
                            </Link>
                            <Link to="/custom-order" className="flex items-center gap-3 px-6 py-4 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl">
                                <Sparkles size={14} className="text-brand-pink" /> Bespoke Request
                            </Link>
                        </div>
                    </motion.div>
                </header>
            </div>

            {/* 1.2 Infinite Marquee */}
            <div className="w-full bg-brand-pink text-white py-4 overflow-hidden mb-16 rotate-1 scale-105 origin-center">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(6)].map((_, i) => (
                        <span key={i} className="text-sm font-black uppercase tracking-[0.4em] mx-8 flex items-center gap-8">
                            PRESERVING HERITAGE CRAFTS <Star size={10} className="fill-white" /> 
                            CURATED BESPOKE ACQUISITIONS <Star size={10} className="fill-white" /> 
                            THE COLLECTOR'S VAULT <Star size={10} className="fill-white" />
                        </span>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

                {/* 1.5 Editorial Hero Banner */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    className="relative w-full h-[400px] mb-16 overflow-hidden group border border-neutral-100"
                >
                    <img 
                        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop" 
                        alt="Curator Pick" 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[2px] transition-all duration-500 group-hover:bg-neutral-900/40" />
                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 mb-3 block">Curator's Spotlight</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl leading-tight">
                            The Earthen Collection. <br />
                            <span className="italic font-light text-white/90">A study in raw ceramics.</span>
                        </h2>
                        <div className="mt-8">
                            <Link to="/marketplace" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-950 text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all shadow-xl">
                                Explore Collection <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* 2. The Bento Grid (Maximalist Stats) */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 mb-24 h-[400px]"
                >
                    {/* Big Feature Tile — Wishlist */}
                    <Link to="/profile" state={{ activeTab: 'wishlist' }} className="col-span-1 md:col-span-2 row-span-2 relative group overflow-hidden border border-neutral-100 p-8 flex flex-col justify-between cursor-pointer">
                        <img src="/artisan_studio.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="" />
                        <div className="absolute inset-0 bg-neutral-950/60 transition-colors group-hover:bg-neutral-950/70" />
                        <div className="relative z-10 flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink">My Wishlist</span>
                            <Heart size={20} className="text-brand-pink" />
                        </div>
                        <div className="relative z-10">
                            {isLoadingWishlist ? (
                                <div className="h-20 w-24 bg-white/20 animate-pulse rounded-sm mb-2" />
                            ) : (
                                <p className="text-7xl font-serif font-bold text-white mb-2">{wishlist.length.toString().padStart(2, '0')}</p>
                            )}
                            <p className="text-sm font-light text-neutral-300">Items you saved for later.</p>
                        </div>
                    </Link>

                    {/* Standard Tiles — Cart / Pending Reserves */}
                    <Link to="/profile" state={{ activeTab: 'bag' }} className="col-span-1 bg-white p-8 border border-neutral-100 flex flex-col justify-between group cursor-pointer hover:border-brand-pink transition-colors">
                        <div className="flex justify-between items-start text-neutral-400 group-hover:text-brand-pink transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-950">My Cart</span>
                            <ShoppingBag size={16} />
                        </div>
                        {isLoadingCart ? (
                            <div className="h-12 w-16 bg-neutral-100 animate-pulse rounded-sm mt-4" />
                        ) : (
                            <p className="text-5xl font-serif font-bold text-neutral-950 mt-4">{cart.length.toString().padStart(2, '0')}</p>
                        )}
                    </Link>

                    {/* Active Chronicles — Orders */}
                    <Link to="/profile" state={{ activeTab: 'orders' }} className="col-span-1 bg-neutral-950 p-8 flex flex-col justify-between group cursor-pointer hover:bg-neutral-900 transition-colors">
                        <div className="flex justify-between items-start text-neutral-500 group-hover:text-white transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">My Orders</span>
                            <Clock size={16} />
                        </div>
                        {isLoadingOrders ? (
                            <div className="h-12 w-16 bg-neutral-800 animate-pulse rounded-sm mt-4" />
                        ) : (
                            <p className="text-5xl font-serif font-bold text-white mt-4">{orders.length.toString().padStart(2, '0')}</p>
                        )}
                    </Link>

                    {/* Collector Status — Member Privileges */}
                    <Link to="/profile" state={{ activeTab: 'billing' }} className="col-span-1 md:col-span-2 bg-[#F3ECE0] p-8 border border-neutral-200 flex items-center justify-between group cursor-pointer">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">My Membership</span>
                            {isLoadingOrders ? (
                                <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded-sm" />
                            ) : (
                                <p className="text-2xl font-serif font-bold text-neutral-950">{orders.length > 5 ? 'Elite Member' : 'New Member'}</p>
                            )}
                        </div>
                        <div className="w-16 h-16 rounded-full border border-neutral-950 flex items-center justify-center bg-white transform group-hover:rotate-45 transition-transform duration-500">
                            <Star size={20} className="text-neutral-950" />
                        </div>
                    </Link>
                </motion.div>

                {/* 3. Latest Drops (Product Grid) */}
                <section className="mb-24">
                    <div className="flex items-end justify-between mb-10 border-b border-neutral-200 pb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-serif font-bold text-neutral-950 tracking-tight">Curated Acquisitions</h2>
                            <span className="px-3 py-1 bg-neutral-950 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">Featured Drops</span>
                        </div>
                        <Link to="/marketplace" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-950 flex items-center gap-2 group transition-all">
                            Explore Gallery <LayoutGrid size={14} className="group-hover:rotate-90 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {isLoadingProducts ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[4/5] bg-neutral-100 rounded-sm" />
                                <div className="h-4 bg-neutral-100 w-1/2" />
                            </div>
                        )) : products.slice(0, 4).map((product, idx) => (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="relative aspect-[4/5] bg-white overflow-hidden mb-6 border border-neutral-100">
                                        <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                className="w-10 h-10 bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-950 hover:bg-neutral-950 hover:text-white transition-all"
                                            >
                                                <ShoppingBag size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                                    <h3 className="font-serif text-lg text-neutral-900 group-hover:text-brand-pink transition-colors">{product.name}</h3>
                                    <p className="text-sm font-bold text-neutral-950 mt-2">₹{product.price.toLocaleString()}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3.5 Editorial Quote Block */}
                <section className="mb-16 py-16 border-y border-neutral-200">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <Sparkles size={24} className="text-brand-pink mx-auto opacity-50" />
                        <h3 className="text-2xl md:text-3xl font-serif font-light text-neutral-950 leading-relaxed italic">
                            "True luxury is not defined by the price tag, but by the hands that crafted it and the heritage it preserves."
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">— The Rifa Philosophy</p>
                    </div>
                </section>

                {/* 3.8 Horizontal Curated Gallery */}
                <section className="mb-24 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-serif font-bold text-neutral-950 tracking-tight">Trending in Heritage</h2>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-950 hover:border-neutral-950 transition-all"><ArrowRight size={14} className="rotate-180" /></button>
                            <button className="w-10 h-10 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-950 hover:border-neutral-950 transition-all"><ArrowRight size={14} /></button>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
                        {(isLoadingProducts ? Array.from({ length: 4 }).map((_, i) => ({ id: `skel-${i}` } as any)) : (products.length > 4 ? products.slice(4, 12) : [...products, ...products])).map((product, idx) => (
                            <Link to={product.id.startsWith('skel') ? '#' : `/product/${product.id}`} key={`${product.id}-${idx}`} className="min-w-[280px] w-[280px] snap-start group">
                                <div className="aspect-square bg-neutral-100 overflow-hidden mb-4 border border-neutral-100 relative">
                                    {isLoadingProducts ? (
                                        <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
                                    ) : (
                                        <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    )}
                                </div>
                                {isLoadingProducts ? (
                                    <>
                                        <div className="h-4 bg-neutral-200 w-3/4 animate-pulse mb-2" />
                                        <div className="h-3 bg-neutral-200 w-1/4 animate-pulse" />
                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-serif text-base text-neutral-900 truncate group-hover:text-brand-pink transition-colors">{product.name}</h3>
                                        <p className="text-[11px] font-bold text-neutral-500 mt-1">₹{product.price.toLocaleString()}</p>
                                    </>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 4. Featured Artisans (Full Bleed Asymmetrical) */}
            </div>
            
            <section className="bg-neutral-950 py-24 mb-20 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-neutral-800 pb-8 gap-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-pink mb-4 block">The Hands Behind</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tighter">Artisan Spotlight</h2>
                        </div>
                        <Link to="/marketplace" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 hover:text-white flex items-center gap-2 group transition-all">
                            Meet The Visionaries <Users size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {isLoadingArtisans ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 bg-neutral-900 animate-pulse" />
                        )) : artisans.slice(0, 3).map((artisan) => (
                            <div key={artisan.id} className="group relative flex flex-col">
                                <div className="aspect-square w-full overflow-hidden grayscale transition-all duration-700 relative">
                                    <img src={artisan.img} alt={artisan.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" />
                                    <div className="absolute inset-0 bg-neutral-950/20 transition-colors" />
                                </div>
                                <div className="mt-6 border-l border-brand-pink pl-6">
                                    <h4 className="font-serif text-2xl text-white mb-2">{artisan.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{artisan.specialty}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 text-brand-pink text-[10px] font-black uppercase tracking-widest">
                                        Artisan Partner
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Subtle Background Typography */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[20vw] font-serif font-black text-neutral-900/40 select-none pointer-events-none whitespace-nowrap z-10 tracking-tighter leading-none">
                    RIFA
                </div>
            </section>

            {/* 5. Gifting Concierge CTA (Full Bleed Cap) */}
            <section className="bg-[#F3ECE0] border-t border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-24">
                    <motion.div 
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <Zap size={24} className="text-brand-pink" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 tracking-tighter mb-6">
                            Bespoke Gifting Service
                        </h2>
                        <p className="text-neutral-500 font-light leading-relaxed text-lg mb-10">
                            Can't decide? Our concierge is ready to help you curate the perfect artisan collection based on your recipient's unique personality.
                        </p>
                        <button onClick={() => setIsConciergeOpen(true)} className="inline-flex items-center gap-4 px-12 py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-2xl">
                            Open Gifting Concierge <ArrowRight size={14} />
                        </button>
                    </motion.div>
                </div>
            </section>
            {/* Gifting Concierge Side Panel */}
            <GiftingConciergePanel 
                isOpen={isConciergeOpen}
                onClose={() => setIsConciergeOpen(false)}
                products={products}
            />
        </div>
    );
};

export default BuyerDashboard;
