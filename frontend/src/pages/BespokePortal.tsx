import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Star, 
    Upload, 
    Gift, 
    Info, 
    ChevronRight, 
    ChevronDown, 
    ArrowRight, 
    Type,
    AlertCircle,
    Clock,
    Sparkles
} from 'lucide-react';
import { products } from '../lib/products';

const BespokePortal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const product = useMemo(() => products.find(p => p.id === id) || null, [id]);
    
    const [engravingText, setEngravingText] = useState('');
    const [fontStyle, setFontStyle] = useState("'Playfair Display', serif");
    const [isGift, setIsGift] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAcknowledged, setIsAcknowledged] = useState(false);

    useEffect(() => {
        if (product && !selectedImage) {
            const timer = setTimeout(() => setSelectedImage(product.images[0]), 0);
            return () => clearTimeout(timer);
        }
    }, [product, selectedImage]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        // Navigate to checkout with bespoke state
        navigate('/checkout', { 
            state: { 
                isBespoke: true, 
                productId: id,
                customization: {
                    text: engravingText,
                    font: fontStyle
                }
            } 
        });
    };

    const fonts = [
        { label: "Elegant Serif (Classic)", value: "'Playfair Display', serif" },
        { label: "Modern Sans (Clean)", value: "'Outfit', sans-serif" },
        { label: "Handwritten Script", value: "'Dancing Script', cursive" },
        { label: "Minimalist Mono", value: "monospace" }
    ];

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FAF7F2]">
                <h2 className="text-2xl font-serif mb-4 text-neutral-900">Masterpiece Not Found</h2>
                <Link to="/" className="text-brand-pink underline font-black uppercase tracking-widest text-[10px]">Back to Gallery</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF7F2] selection:bg-brand-pink/20 pb-20 pt-20 md:pt-28">
            {/* Editorial Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                    <Link to="/" className="hover:text-brand-pink transition-colors">Shop</Link>
                    <ChevronRight size={10} />
                    <Link to="/craftmakers" className="hover:text-brand-pink transition-colors">Artisans</Link>
                    <ChevronRight size={10} />
                    <span className="text-neutral-900">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    
                    {/* LEFT: Masterpiece Preview Area */}
                    <div className="space-y-8 sticky top-32">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative group"
                        >
                            {/* Live Preview Badge */}
                            <div className="absolute top-6 left-6 z-20">
                                <span className="bg-white/95 backdrop-blur-md text-neutral-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-none shadow-lg border border-neutral-100 flex items-center gap-2">
                                    <Sparkles size={12} className="text-brand-pink fill-brand-pink animate-pulse" />
                                    Live Preview Area
                                </span>
                            </div>

                            <div className="relative aspect-square rounded-none overflow-hidden bg-white shadow-2xl border border-neutral-100">
                                <img loading="lazy" 
                                    src={selectedImage || product.images[0]} 
                                    alt="Masterpiece Preview" 
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Editorial Dynamic Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                                    <p 
                                        style={{ 
                                            fontFamily: fontStyle,
                                            letterSpacing: fontStyle.includes('Display') ? '0.02em' : '0.05em'
                                        }}
                                        className="text-4xl md:text-5xl font-bold text-neutral-800/40 mix-blend-multiply uppercase text-center break-words leading-tight"
                                    >
                                        {engravingText}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Thumbnail Boutique */}
                        <div className="flex gap-4 px-2">
                            {product.images.map((img, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-20 h-20 rounded-none overflow-hidden border transition-all ${selectedImage === img ? 'border-brand-pink shadow-lg scale-105' : 'border-neutral-200 opacity-60 hover:opacity-100'}`}
                                >
                                    <img loading="lazy" src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Personalization Suite */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-none border border-emerald-100">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Takes 7 Days to Handcraft</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-300">
                                    <Star size={12} className="fill-brand-gold text-brand-gold" />
                                    <Star size={12} className="fill-brand-gold text-brand-gold" />
                                    <Star size={12} className="fill-brand-gold text-brand-gold" />
                                    <Star size={12} className="fill-brand-gold text-brand-gold" />
                                    <Star size={12} className="fill-neutral-100 text-neutral-100" />
                                    <span className="ml-1">(128 Reviews)</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 tracking-tight leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-2xl font-serif font-bold text-brand-pink">Rs. {product.price.toLocaleString()}.00</p>
                            </div>

                            <p className="text-neutral-500 font-light leading-relaxed max-w-lg">
                                {product.description} This signature creation is individually hand-carved and finished with heritage precision to ensure a lifetime of beauty.
                            </p>
                        </motion.div>

                        {/* Customization Controls */}
                        <div className="space-y-8 pt-8 border-t border-neutral-100">
                            {/* Engraving Input */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                                        <Type size={14} className="text-brand-pink" /> Engraving Text
                                    </label>
                                    <Info size={14} className="text-neutral-300" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Enter your custom message..."
                                    value={engravingText}
                                    onChange={(e) => setEngravingText(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-none focus:border-brand-pink outline-none transition-all placeholder:text-neutral-300 text-sm"
                                />
                            </div>

                            {/* Font Selection */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-900">
                                    Select Font Style
                                </label>
                                <div className="relative">
                                    <select 
                                        value={fontStyle}
                                        onChange={(e) => setFontStyle(e.target.value)}
                                        className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-none focus:border-brand-pink outline-none transition-all appearance-none text-sm text-neutral-600"
                                    >
                                        {fonts.map(f => (
                                            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                                {f.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Image Upload Box */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-900">
                                        Upload Reference Image
                                    </label>
                                    <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">Optional</span>
                                </div>
                                <input 
                                    type="file" 
                                    id="bespoke-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setSelectedImage(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <label 
                                    htmlFor="bespoke-upload"
                                    className="block border border-dashed border-neutral-200 rounded-none p-12 text-center space-y-4 bg-white hover:bg-neutral-50 hover:border-brand-pink transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Upload size={20} className="text-neutral-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">Drop masterpiece assets here</p>
                                        <p className="text-[9px] text-neutral-400 mt-2 uppercase tracking-widest">High-resolution PNG or JPG preferred</p>
                                    </div>
                                </label>
                            </div>

                            {/* Premium Gifting Suite */}
                            <div className="p-8 bg-white border border-neutral-100 rounded-none flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center">
                                        <Gift size={20} className="text-brand-pink" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">Bespoke Video Message</p>
                                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest mt-1">Recipient scans a heritage QR code</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsGift(!isGift)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isGift ? 'bg-brand-pink' : 'bg-neutral-200'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isGift ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>

                            {/* Natural Material Acknowledgement */}
                            {product.isNatural && (
                                <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-none space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="pt-1">
                                            <input 
                                                type="checkbox" 
                                                id="natural-acknowledgement"
                                                checked={isAcknowledged}
                                                onChange={(e) => setIsAcknowledged(e.target.checked)}
                                                className="w-5 h-5 accent-brand-pink cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="natural-acknowledgement" className="text-[11px] font-medium text-neutral-600 leading-relaxed cursor-pointer selection:bg-brand-pink/10">
                                            I acknowledge that this piece is crafted from <span className="font-bold text-neutral-900">natural materials</span>. I understand that organic variations in grain, texture, and color are inherent to the material and are not considered defects, but rather signatures of authenticity.
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Action Button Suite */}
                            <div className="space-y-4 pt-8">
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={product.isNatural && !isAcknowledged}
                                    className={`w-full py-6 text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 group ${
                                        (product.isNatural && !isAcknowledged) 
                                        ? 'bg-neutral-300 cursor-not-allowed shadow-none' 
                                        : 'bg-neutral-950 hover:bg-neutral-800 shadow-xl'
                                    }`}
                                >
                                    Confirm Masterpiece <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                                <div className="flex items-center justify-center gap-3 text-[9px] font-bold text-brand-gold uppercase tracking-[0.2em]">
                                    <AlertCircle size={14} />
                                    Custom commissions require heritage deposit.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BespokePortal;
