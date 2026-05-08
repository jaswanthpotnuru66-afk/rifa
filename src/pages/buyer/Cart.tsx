import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingBag, Heart, Trash2, Plus, Minus, 
    ArrowRight, ShieldCheck, Award,
    ChevronRight, X, Clock
} from 'lucide-react';
import { products } from '../../lib/products';

const Cart = () => {
    const navigate = useNavigate();
    // Using first 2 products as mock cart items
    const [cartItems, setCartItems] = useState([
        { ...products[0], quantity: 1 },
        { ...products[1], quantity: 1 }
    ]);

    // Using next 2 products as mock wishlist items
    const [wishlistItems, setWishlistItems] = useState([
        products[2],
        products[3]
    ]);

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(items => items.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id: string) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const moveToWishlist = (item: any) => {
        setCartItems(prev => prev.filter(i => i.id !== item.id));
        if (!wishlistItems.find(i => i.id === item.id)) {
            setWishlistItems(prev => [...prev, item]);
        }
    };

    const moveToCart = (item: any) => {
        setWishlistItems(prev => prev.filter(i => i.id !== item.id));
        if (!cartItems.find(i => i.id === item.id)) {
            setCartItems(prev => [...prev, { ...item, quantity: 1 }]);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = 49;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-32 pb-20 selection:bg-brand-pink/20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Header */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-pink">Your Collection Curation</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter leading-none">
                            Acquisition <br />
                            <span className="italic font-light text-neutral-400">Bag.</span>
                        </h1>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Main Cart Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <AnimatePresence mode="popLayout">
                            {cartItems.length > 0 ? (
                                cartItems.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white border border-neutral-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 group hover:shadow-xl transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                        
                                        {/* Product Image */}
                                        <div className="w-full md:w-40 aspect-[4/5] bg-neutral-50 rounded-sm overflow-hidden shrink-0 border border-neutral-100 shadow-sm relative">
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            {item.isReady && (
                                                <div className="absolute top-2 left-2 bg-neutral-900 text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 shadow-lg">
                                                    Ready to Ship
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{item.category}</span>
                                                    <h3 className="text-2xl font-serif font-bold text-neutral-950 mt-1 hover:text-brand-pink transition-colors cursor-pointer">{item.name}</h3>
                                                </div>
                                                <span className="text-xl font-bold text-neutral-950">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                            </div>

                                            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-md line-clamp-2 mb-6">
                                                {item.description}
                                            </p>

                                            <div className="mt-auto flex flex-wrap items-center justify-between gap-6">
                                                {/* Quantity Control */}
                                                <div className="flex items-center gap-6 bg-neutral-50 rounded-full px-4 py-2 border border-neutral-100 shadow-inner">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="text-neutral-400 hover:text-brand-pink transition-colors"><Minus size={14} /></button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="text-neutral-400 hover:text-brand-pink transition-colors"><Plus size={14} /></button>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-6">
                                                    <button 
                                                        onClick={() => moveToWishlist(item)}
                                                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-pink transition-colors"
                                                    >
                                                        <Heart size={14} /> Save for Later
                                                    </button>
                                                    <button 
                                                        onClick={() => removeItem(item.id)}
                                                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-40 bg-white border border-dashed border-neutral-200 rounded-sm text-center">
                                    <ShoppingBag size={48} className="mx-auto text-neutral-100 mb-6" strokeWidth={1} />
                                    <h3 className="text-2xl font-serif font-bold text-neutral-950 mb-2">Your Bag is empty</h3>
                                    <p className="text-neutral-400 font-light mb-8">It seems you haven't selected any masterpieces yet.</p>
                                    <Link 
                                        to="/marketplace"
                                        className="inline-flex items-center gap-4 px-10 py-4 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-xl"
                                    >
                                        Explore The Boutique <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Cart Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                            <div className="p-6 bg-white border border-neutral-100 rounded-sm flex flex-col items-center text-center gap-3">
                                <ShieldCheck size={24} className="text-brand-pink" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-950">Secure Protocol</h4>
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tighter">Your data is fully encrypted.</p>
                            </div>
                            <div className="p-6 bg-white border border-neutral-100 rounded-sm flex flex-col items-center text-center gap-3">
                                <Award size={24} className="text-brand-gold" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-950">Verified Artisan</h4>
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tighter">Directly from the workshop.</p>
                            </div>
                            <div className="p-6 bg-white border border-neutral-100 rounded-sm flex flex-col items-center text-center gap-3">
                                <Clock size={24} className="text-neutral-400" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-950">Limited Reserve</h4>
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tighter">Stock is held for 30 minutes.</p>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR: Summary & Wishlist */}
                    <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                        
                        {/* Acquisition Summary */}
                        <div className="bg-neutral-950 text-white rounded-sm p-8 md:p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand-pink mb-8 border-b border-white/10 pb-4">Acquisition Summary</h3>
                            
                            {/* Bag Items Mini-List */}
                            <div className="mb-8 space-y-4 max-h-40 overflow-y-auto no-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-xs uppercase font-bold tracking-widest text-neutral-400">
                                        <span className="truncate pr-4">{item.quantity}x {item.name}</span>
                                        <span className="shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Total Valuation</span>
                                    <span className="text-sm font-bold">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Handling & Care</span>
                                    <span className="text-sm font-bold">Rs. {shipping}</span>
                                </div>
                                
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Grand Total</span>
                                            <div className="text-4xl font-serif font-bold text-white mt-1">Rs. {total.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <button 
                                        disabled={cartItems.length === 0}
                                        onClick={() => navigate('/checkout')}
                                        className="w-full py-5 bg-brand-pink text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-[#e6a8a8] transition-all shadow-xl flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Checkout <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Curated Wishlist (In sidebar as requested) */}
                        <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
                            <div className="p-6 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-950 flex items-center gap-2"><Heart size={14} /> Curated Wishlist</h4>
                                <span className="text-[11px] font-black text-neutral-400 bg-white px-2 py-1 rounded border border-neutral-100">{wishlistItems.length}</span>
                            </div>
                            
                            <div className="divide-y divide-neutral-50">
                                {wishlistItems.length > 0 ? (
                                    wishlistItems.map((item) => (
                                        <div key={item.id} className="p-4 flex gap-4 group hover:bg-neutral-50/50 transition-all">
                                            <div className="w-16 h-20 bg-neutral-100 rounded-sm overflow-hidden shrink-0">
                                                <img src={item.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-serif font-bold text-neutral-900 truncate mb-1">{item.name}</h5>
                                                <p className="text-xs font-bold text-neutral-950 mb-3">Rs. {item.price.toLocaleString()}</p>
                                                <button 
                                                    onClick={() => moveToCart(item)}
                                                    className="text-[8px] font-black uppercase tracking-widest text-brand-pink hover:text-brand-pink/70 transition-all flex items-center gap-1"
                                                >
                                                    Move to Bag <ChevronRight size={10} />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => setWishlistItems(prev => prev.filter(i => i.id !== item.id))}
                                                className="text-neutral-300 hover:text-red-500 transition-colors self-start"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <Heart size={24} className="mx-auto text-neutral-100 mb-2" strokeWidth={1} />
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest">Wishlist is empty</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </aside>
                </div>

                {/* Recommendations */}
                <section className="mt-32">
                    <div className="flex items-end justify-between mb-12">
                        <div className="space-y-1">
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-pink">Recommended</span>
                            <h2 className="text-3xl font-serif font-bold text-neutral-950 tracking-tighter">You might also admire.</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {products.slice(4, 9).map((p) => (
                            <Link key={p.id} to={`/product/${p.id}`} className="group block">
                                <div className="aspect-[3/4] bg-white border border-neutral-100 p-2 mb-4 group-hover:shadow-xl transition-all">
                                    <div className="w-full h-full bg-neutral-50 overflow-hidden relative">
                                        <img src={p.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    </div>
                                </div>
                                <h3 className="text-xs font-serif font-bold text-neutral-950 truncate mb-1">{p.name}</h3>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Rs. {p.price.toLocaleString()}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Cart;
