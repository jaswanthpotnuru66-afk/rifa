import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Star, Truck,
    ChevronRight, 
    ShoppingBag, 
    Heart, Tag, MapPin, 
    Zap, ShieldAlert, CheckCircle2, Info, MessageSquare,
    RefreshCw, ThumbsUp
} from 'lucide-react';
import { products, type Product } from '../lib/products';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdded] = useState(false);
    const [pinCode, setPinCode] = useState('');
    const [isPinChecked, setIsPinChecked] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const foundProduct = products.find(p => p.id === id);
        if (foundProduct) {
            setProduct(foundProduct);
            setSelectedImage(foundProduct.images[0]);
        }
        window.scrollTo(0, 0);
        setIsLoading(false);
    }, [id, products, setIsLoading, setProduct, setSelectedImage]);

    const handleAddToCart = () => {
        navigate('/cart');
    };

    const handleBuyNow = () => {
        navigate('/checkout');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4 text-center"><div><h1 className="text-2xl font-serif font-bold">Piece Not Found</h1></div></div>;

    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#F8F5F1] pt-24 pb-12 selection:bg-brand-pink/20">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: VISUALS & PRIMARY ACTIONS */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-sm">
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 w-14 shrink-0">
                                    {product.images.map((img, idx) => (
                                        <button 
                                            key={idx} 
                                            onMouseEnter={() => setSelectedImage(img)}
                                            className={`aspect-square rounded border-2 transition-all ${selectedImage === img ? 'border-brand-pink shadow-md' : 'border-neutral-100 grayscale hover:grayscale-0'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 aspect-[4/5] bg-neutral-50 overflow-hidden rounded-sm relative group">
                                    <img src={selectedImage} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-110" />
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-brand-pink transition-all"><Heart size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleAddToCart} className={`flex items-center justify-center gap-3 py-4 rounded font-black text-[11px] tracking-widest uppercase transition-all shadow-md ${isAdded ? 'bg-green-600 text-white' : 'bg-neutral-950 text-white hover:bg-neutral-800'}`}>
                                <ShoppingBag size={16} /> {isAdded ? 'Added' : 'Add to Cart'}
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                className="flex items-center justify-center gap-3 py-4 bg-brand-pink text-white rounded font-black text-[11px] tracking-widest uppercase hover:bg-[#e6a8a8] transition-all shadow-md"
                            >
                                <Zap size={16} fill="currentColor" /> Buy Now
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INFORMATION STREAM */}
                    <div className="lg:col-span-7 space-y-3">
                        
                        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-sm">
                            <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-neutral-400 mb-4">
                                <Link to="/marketplace" className="hover:text-brand-pink">Marketplace</Link>
                                <ChevronRight size={10} />
                                <span className="text-neutral-900">{product.name}</span>
                            </nav>
                            <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-2 leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-50">
                                <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-[11px] font-bold gap-1">
                                    {product.rating} <Star size={10} fill="currentColor" />
                                </div>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{product.reviewCount} Ratings</span>
                                <div className="h-4 w-[1px] bg-neutral-200" />
                                <span className="text-[10px] font-black text-brand-pink tracking-[0.2em] uppercase">Rifa Verified</span>
                            </div>
                            <div className="flex items-baseline gap-4 mb-1">
                                <span className="text-3xl font-serif font-bold text-neutral-900">₹{product.price}</span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-lg text-neutral-300 line-through font-light">₹{product.originalPrice}</span>
                                        <span className="text-sm font-bold text-green-600 uppercase tracking-tighter">{discount}% off</span>
                                    </>
                                )}
                            </div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-6 italic border-l-2 border-brand-pink/20 pl-6">{product.description}</p>
                        </div>

                        {/* Offers */}
                        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-sm">
                            <h4 className="text-[10px] font-black tracking-widest uppercase text-neutral-900 mb-4 flex items-center gap-2"><Tag size={14} /> Bank Offers</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-neutral-50/50 rounded border border-neutral-100">
                                    <Zap size={12} className="text-brand-pink mt-0.5" />
                                    <p className="text-xs text-neutral-600"><span className="font-bold">10% Instant Discount</span> on HDFC Credit Cards. <span className="text-brand-pink font-bold underline cursor-pointer">T&C</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-sm">
                            <h4 className="text-[10px] font-black tracking-widest uppercase text-neutral-900 mb-4 flex items-center gap-2"><MapPin size={14} /> Check Delivery</h4>
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1 max-w-xs">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input type="text" placeholder="Enter PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-neutral-50 border-b-2 border-neutral-200 focus:border-brand-pink outline-none text-xs font-bold" />
                                </div>
                                <button onClick={() => setIsPinChecked(true)} className="px-6 py-2 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">Check</button>
                            </div>
                            {isPinChecked && <div className="flex items-center gap-3 text-xs text-green-700 font-bold bg-green-50 p-3 rounded border border-green-100"><Truck size={16} /> Fast Delivery by Tomorrow 5 PM</div>}
                        </div>

                        {/* Ratings & Reviews Section (NEW MARKETPLACE MODULE) */}
                        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-neutral-50 flex justify-between items-center bg-neutral-50">
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-neutral-950 flex items-center gap-2"><MessageSquare size={14} /> Ratings & Reviews</h4>
                                <button className="px-4 py-2 bg-white border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-900 hover:border-brand-pink transition-all">Rate Product</button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-8 border-b border-neutral-50">
                                <div className="md:col-span-4 flex flex-col items-center justify-center border-r border-neutral-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-4xl font-serif font-bold text-neutral-950">{product.rating}</span>
                                        <Star size={24} fill="currentColor" className="text-green-600" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{product.reviewCount} Ratings</p>
                                </div>
                                <div className="md:col-span-8 space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold w-2">{star}</span>
                                            <Star size={10} fill="currentColor" className="text-neutral-300" />
                                            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-600" 
                                                    style={{ width: star === 5 ? '75%' : star === 4 ? '15%' : '5%' }} 
                                                />
                                            </div>
                                            <span className="text-[10px] text-neutral-400 font-bold w-8">{star === 5 ? '92' : star === 4 ? '12' : '4'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Individual Reviews */}
                            <div className="divide-y divide-neutral-50">
                                {product.reviews.map(review => (
                                    <div key={review.id} className="p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold gap-1">
                                                    {review.rating} <Star size={8} fill="currentColor" />
                                                </div>
                                                <span className="text-xs font-bold text-neutral-900">{review.user}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-neutral-400">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-neutral-600 font-light leading-relaxed">"{review.comment}"</p>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-green-600">
                                                <CheckCircle2 size={12} /> Verified Purchase
                                            </div>
                                            <button className="flex items-center gap-1.5 text-[9px] font-black uppercase text-neutral-400 hover:text-brand-pink transition-colors">
                                                <ThumbsUp size={12} /> Helpful (12)
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Specifications Table */}
                        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-neutral-50 bg-neutral-50"><h4 className="text-[10px] font-black tracking-widest uppercase text-neutral-950 flex items-center gap-2"><Info size={14} /> Product Specifications</h4></div>
                            <table className="w-full text-xs">
                                <tbody className="divide-y divide-neutral-50">
                                    <tr><td className="w-32 p-4 text-neutral-400 font-bold uppercase tracking-tight italic">Material</td><td className="p-4 text-neutral-900 font-medium">Epoxy Resin, Natural Wood</td></tr>
                                    <tr><td className="w-32 p-4 text-neutral-400 font-bold uppercase tracking-tight italic">Artisan</td><td className="p-4 text-brand-pink font-bold underline cursor-pointer">Sonia's Boutique</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Service Grid */}
                        <div className="grid grid-cols-3 gap-2 pb-4">
                            <div className="bg-white p-4 rounded-sm border border-neutral-200 text-center space-y-2"><RefreshCw size={18} className="mx-auto text-neutral-400" /><div className="text-[9px] font-black uppercase text-neutral-900">7 Days Return</div></div>
                            <div className="bg-white p-4 rounded-sm border border-neutral-200 text-center space-y-2"><ShieldAlert size={18} className="mx-auto text-neutral-400" /><div className="text-[9px] font-black uppercase text-neutral-900">Verified Quality</div></div>
                            <div className="bg-white p-4 rounded-sm border border-neutral-200 text-center space-y-2"><CheckCircle2 size={18} className="mx-auto text-neutral-400" /><div className="text-[9px] font-black uppercase text-neutral-900">COD Available</div></div>
                        </div>

                    </div>
                </div>

                {/* Bottom Section: Recommended */}
                <div className="mt-8 pt-8 border-t border-neutral-200">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black tracking-widest uppercase text-brand-pink">Recommended</h2>
                            <h3 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight leading-none">Similar Artistic Creations</h3>
                        </div>
                        <Link to="/marketplace" className="text-xs font-black tracking-widest uppercase text-neutral-950 hover:text-brand-pink flex items-center gap-2">View Marketplace <ChevronRight size={14} /></Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {products.filter(p => p.id !== id).slice(0, 5).map(p => (
                            <Link key={p.id} to={`/product/${p.id}`} className="group block bg-white border border-neutral-100 p-2 rounded hover:border-neutral-300 transition-all shadow-sm">
                                <div className="aspect-[3/4] bg-neutral-50 overflow-hidden rounded mb-3"><img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                                <h4 className="text-sm font-bold text-neutral-900 truncate mb-1">{p.name}</h4>
                                <div className="flex items-center gap-2"><span className="text-sm font-bold">₹{p.price}</span><span className="text-[10px] text-green-600 font-bold uppercase">Free Delivery</span></div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetail;
