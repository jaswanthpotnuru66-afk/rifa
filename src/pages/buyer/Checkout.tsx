import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    ChevronRight, MapPin, ShieldCheck, 
    CreditCard, CheckCircle2, 
    Lock, Plus, Minus,
    PenTool, Gift, Sparkles, Award, X,
    Navigation, Search, AlertTriangle, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../../lib/products';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isBespoke = location.state?.isBespoke || false;
    const bespokeDetails = location.state?.customization || null;
    
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isGifting, setIsGifting] = useState(false);
    const [giftMessage, setGiftMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [showMap, setShowMap] = useState(false);
    
    // Address State
    const [address, setAddress] = useState({
        name: 'Sai Sampath',
        mobile: '9876543210',
        pin: '500081',
        house: '101, Rifa Heights',
        area: 'Artisan Valley, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana'
    });

    // Temporary Address for Form
    const [tempAddress, setTempAddress] = useState({...address});

    // Use product from state if available, otherwise fallback to products[0]
    const product = products.find(p => p.id === location.state?.productId) || products[0] || null;
    const price = product?.price || 0;
    const originalPrice = product?.originalPrice || price;
    
    const totalMRP = originalPrice * quantity;
    const totalPrice = price * quantity;
    const totalSavings = totalMRP - totalPrice;
    const totalAmount = totalPrice + 29;

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        setAddress({...tempAddress});
        setShowAddressModal(false);
        setShowMap(false);
    };

    const handleDetectLocation = () => {
        setIsDetecting(true);
        // Simulate Browser Geolocation + Reverse Geocoding
        setTimeout(() => {
            setTempAddress({
                ...tempAddress,
                pin: '500032',
                area: 'Financial District, Gachibowli',
                city: 'Hyderabad',
                state: 'Telangana'
            });
            setIsDetecting(false);
            setShowMap(false);
        }, 1500);
    };

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F5F1]">
                <div className="text-center">
                    <h2 className="text-xl font-serif font-bold mb-4">Your collection is empty</h2>
                    <Link to="/" className="text-xs font-black uppercase tracking-widest text-brand-pink underline">Start Exploring</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F5F1] pt-32 pb-20 selection:bg-brand-pink/20">
            {/* Unique "Gallery" Header */}
            <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-neutral-100 z-50 py-5 px-6 md:px-12">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <Link to="/" className="text-2xl font-serif font-black tracking-tighter text-neutral-900">Rifa Arts <span className="text-brand-pink font-light italic">&</span> Crafts</Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mt-1">Acquisition Portal</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 text-green-600 font-bold text-[11px] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            <ShieldCheck size={12} /> Secure Gallery Protocol
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400 font-bold text-[11px] uppercase tracking-widest">
                            <Lock size={14} /> Encrypted
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* LEFT: The Acquisition Journey */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Step Navigation */}
                        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                            {[1, 2, 3].map((s) => (
                                <button 
                                    key={s}
                                    onClick={() => step > s && setStep(s)}
                                    className={`flex items-center gap-3 shrink-0 transition-all ${step === s ? 'scale-105' : 'opacity-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 ${step >= s ? 'border-brand-pink bg-brand-pink text-white' : 'border-neutral-200 text-neutral-300'}`}>
                                        {step > s ? <CheckCircle2 size={18} /> : `0${s}`}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Step {s}</span>
                                        <span className="text-xs font-serif font-bold text-neutral-900">{s === 1 ? 'Destination' : s === 2 ? 'Curation' : 'Payment'}</span>
                                    </div>
                                    {s < 3 && <ChevronRight size={14} className="text-neutral-300 mx-2" />}
                                </button>
                            ))}
                        </div>

                        {/* STEP 1: DESTINATION */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-serif font-bold text-neutral-950 flex items-center gap-4">Where should we send it? <MapPin className="text-brand-pink" /></h2>
                                    <button 
                                        onClick={() => setShowAddressModal(true)}
                                        className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-pink bg-brand-pink/5 px-4 py-2 rounded border border-brand-pink/20 hover:bg-brand-pink/10 transition-all"
                                    >
                                        <Plus size={14} /> Add New Artisan Point
                                    </button>
                                </div>
                                <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                    
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-lg italic">{address.name.split(' ').map(n => n[0]).join('')}</span>
                                                <div>
                                                    <h3 className="font-serif font-black text-neutral-900">{address.name}</h3>
                                                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Saved Gallery Address</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setTempAddress({...address});
                                                    setShowAddressModal(true);
                                                }}
                                                className="text-xs font-black text-brand-pink uppercase tracking-widest underline italic"
                                            >
                                                Edit Details
                                            </button>
                                        </div>
                                        
                                        <div className="p-6 bg-neutral-50/50 rounded border border-neutral-100 space-y-1">
                                            <p className="text-sm text-neutral-600 font-medium">{address.house}, {address.area}</p>
                                            <p className="text-sm text-neutral-600 font-medium">{address.city}, {address.state} - <span className="font-bold">{address.pin}</span></p>
                                            <p className="text-xs text-neutral-900 font-black mt-4">{address.mobile}</p>
                                        </div>

                                        <button 
                                            onClick={() => setStep(2)}
                                            className="w-full py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-2xl flex items-center justify-center gap-4 group"
                                        >
                                            Confirm Acquisition Point <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: CURATION & GIFTING */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h2 className="text-3xl font-serif font-bold text-neutral-950 flex items-center gap-4">Curation Details <Sparkles className="text-brand-pink" /></h2>
                                
                                <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xl space-y-8">
                                    <div className="flex items-center justify-between p-6 border border-brand-pink/20 bg-brand-pink/[0.02] rounded-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink"><Gift size={24} /></div>
                                            <div>
                                                <h4 className="font-serif font-bold text-neutral-950">Is this a curated gift?</h4>
                                                <p className="text-xs text-neutral-400 font-black uppercase tracking-widest">We'll add a hand-written note</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsGifting(!isGifting)}
                                            className={`w-14 h-7 rounded-full transition-all relative ${isGifting ? 'bg-brand-pink' : 'bg-neutral-200'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isGifting ? 'left-8' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {isGifting && (
                                        <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">
                                                <PenTool size={14} /> Handwritten Message (Calligraphy style)
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    placeholder="Write your soul into words..."
                                                    value={giftMessage}
                                                    onChange={(e) => setGiftMessage(e.target.value)}
                                                    className="w-full h-40 p-8 bg-[#FAF9F6] border-2 border-neutral-100 rounded shadow-inner font-serif text-xl italic text-neutral-800 outline-none focus:border-brand-pink/30 resize-none transition-all"
                                                />
                                                <div className="absolute bottom-4 right-4 text-[11px] font-black uppercase text-neutral-300">Rifa Artisan Stationery</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-neutral-50 flex justify-end">
                                        <button 
                                            onClick={() => setStep(3)}
                                            className="px-12 py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-xl"
                                        >
                                            Continue to Acquisition
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SECURE PAYMENT */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h2 className="text-3xl font-serif font-bold text-neutral-950 flex items-center gap-4">Final Protocol <CreditCard className="text-brand-pink" /></h2>
                                <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xl space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Digital Gateway */}
                                        <button 
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`p-6 border-2 rounded-sm flex items-center justify-between group transition-all text-left ${paymentMethod === 'upi' ? 'border-brand-pink bg-brand-pink/[0.02]' : 'border-neutral-100 hover:border-neutral-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center p-1 ${paymentMethod === 'upi' ? 'border-brand-pink' : 'border-neutral-200'}`}>
                                                    {paymentMethod === 'upi' && <div className="w-full h-full bg-brand-pink rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-neutral-950">UPI / Digital Gateway</span>
                                                    <p className="text-xs text-neutral-400 uppercase font-bold mt-1">Instant Activation</p>
                                                </div>
                                            </div>
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                                        </button>
                                        
                                        {/* Vault Credit Card */}
                                        <button 
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-6 border-2 rounded-sm flex items-center justify-between group transition-all text-left ${paymentMethod === 'card' ? 'border-brand-pink bg-brand-pink/[0.02]' : 'border-neutral-100 hover:border-neutral-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center p-1 ${paymentMethod === 'card' ? 'border-brand-pink' : 'border-neutral-200'}`}>
                                                    {paymentMethod === 'card' && <div className="w-full h-full bg-brand-pink rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-neutral-950">Vault Credit Card</span>
                                                    <p className="text-xs text-neutral-400 uppercase font-bold mt-1">Secure ISO Processing</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-8 h-5 bg-neutral-100 rounded" />
                                                <div className="w-8 h-5 bg-neutral-100 rounded" />
                                            </div>
                                        </button>

                                        {/* Cash on Delivery - Conditional for Bespoke */}
                                        <div className="relative">
                                            <button 
                                                disabled={isBespoke}
                                                onClick={() => setPaymentMethod('cod')}
                                                className={`w-full p-6 border-2 rounded-sm flex items-center justify-between group transition-all text-left ${isBespoke ? 'opacity-40 bg-neutral-50 border-neutral-100 cursor-not-allowed' : paymentMethod === 'cod' ? 'border-brand-pink bg-brand-pink/[0.02]' : 'border-neutral-100 hover:border-neutral-200'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center p-1 ${paymentMethod === 'cod' ? 'border-brand-pink' : 'border-neutral-200'}`}>
                                                        {paymentMethod === 'cod' && <div className="w-full h-full bg-brand-pink rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-neutral-950">Cash on Delivery</span>
                                                        <p className="text-xs text-neutral-400 uppercase font-bold mt-1">Payment at Gallery Gateway</p>
                                                    </div>
                                                </div>
                                                <Truck size={20} className="text-neutral-300" />
                                            </button>

                                            {isBespoke && (
                                                <div className="mt-4 p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                                    <AlertTriangle size={16} className="text-brand-gold shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black uppercase tracking-widest text-brand-gold">Bespoke Policy Alert</p>
                                                        <p className="text-[11px] text-neutral-600 leading-relaxed italic">As this is a customized masterpiece created specifically for your legacy, Cash on Delivery is disabled. Please use a digital gateway to confirm your commission.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-8 text-center">
                                        <button 
                                            onClick={() => navigate('/success')}
                                            className="w-full py-6 bg-brand-pink text-white text-xs font-black uppercase tracking-[0.5em] hover:bg-[#e6a8a8] transition-all shadow-2xl flex items-center justify-center gap-6 group overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            Complete Acquisition <Award size={20} className="group-hover:rotate-12 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT: The Gallery Dossier */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl overflow-hidden">
                            <div className="p-6 bg-neutral-950 text-white flex items-center justify-between border-b border-white/10">
                                <div className="flex flex-col">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Acquisition Dossier</h3>
                                    <span className="text-[10px] text-neutral-500 uppercase mt-1">Ref: RIFA-2024-OX</span>
                                </div>
                                <Award size={20} className="text-brand-pink" />
                            </div>
                            
                            <div className="p-6 bg-[#FAF9F6] border-b border-neutral-100 space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-20 h-24 bg-white rounded border border-neutral-200 overflow-hidden shrink-0 shadow-sm">
                                        <img src={product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                                    </div>
                                        <div className="flex flex-col justify-center space-y-1 flex-1">
                                            <h4 className="text-lg font-serif font-bold text-neutral-950 leading-tight">{product?.name}</h4>
                                            {isBespoke ? (
                                                <div className="space-y-1 mt-1">
                                                    <p className="text-[11px] font-black text-brand-pink uppercase tracking-widest italic">Bespoke Masterpiece</p>
                                                    <div className="bg-brand-pink/5 p-2 rounded border border-brand-pink/10 mt-2">
                                                        <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest mb-1">Engraving Details</p>
                                                        <p className="text-xs font-serif italic text-neutral-900" style={{ fontFamily: bespokeDetails?.font }}>"{bespokeDetails?.text || 'No Text'}"</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-[11px] font-black text-brand-pink uppercase tracking-widest italic">Hand-signed by Sonia</p>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-full px-3 py-1 shadow-sm">
                                                <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="text-neutral-400 hover:text-brand-pink transition-colors"><Minus size={14} /></button>
                                                <span className="text-xs font-black w-4 text-center">{quantity}</span>
                                                <button onClick={() => setQuantity(q => q + 1)} className="text-neutral-400 hover:text-brand-pink transition-colors"><Plus size={14} /></button>
                                            </div>
                                            <span className="text-xs font-bold text-neutral-900">₹{totalPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-5 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-repeat">
                                <div className="flex justify-between items-center text-xs text-neutral-500 font-medium italic">
                                    <span>Original Valuation ({quantity} units)</span>
                                    <span className="text-neutral-900 font-bold">₹{totalMRP}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-green-600 font-bold italic">
                                    <span>Collector's Benefit</span>
                                    <span>-₹{totalSavings}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-neutral-500 font-medium italic">
                                    <span>Packaging & Handling</span>
                                    <span className="text-neutral-900 font-bold">₹29</span>
                                </div>
                                <div className="h-[1px] bg-neutral-200 my-6 border-t border-dashed" />
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Total Valuation</span>
                                        <span className="text-4xl font-serif font-bold text-neutral-950 mt-1">₹{totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADDRESS MODAL */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddressModal(false)}
                            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden"
                        >
                            <div className="p-6 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-900 flex items-center gap-2">
                                    <MapPin size={16} className="text-brand-pink" /> Refine Destination
                                </h3>
                                <button type="button" onClick={() => setShowAddressModal(false)} className="text-neutral-400 hover:text-neutral-950 transition-colors"><X size={20} /></button>
                            </div>
                            
                            <div className="p-8 max-h-[85vh] overflow-y-auto no-scrollbar">
                                {!showMap ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Location Selector Trigger */}
                                            <button 
                                                type="button"
                                                onClick={() => setShowMap(true)}
                                                className="col-span-2 p-6 border-2 border-dashed border-neutral-100 rounded-sm flex items-center justify-between hover:border-brand-pink/30 hover:bg-brand-pink/[0.02] transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink group-hover:scale-110 transition-transform">
                                                        <Navigation size={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="text-xs font-black uppercase tracking-widest text-neutral-900">Visual Location Selector</span>
                                                        <p className="text-xs text-neutral-400 font-bold uppercase mt-1 tracking-tighter">Choose your artisan point on the map</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-neutral-300" />
                                            </button>

                                            <div className="col-span-2 space-y-1">
                                                <label htmlFor="full-name" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Recipient Name</label>
                                                <input 
                                                    id="full-name"
                                                    type="text" 
                                                    value={tempAddress.name}
                                                    onChange={(e) => setTempAddress({...tempAddress, name: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <label htmlFor="mobile" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Mobile Number</label>
                                                <input 
                                                    id="mobile"
                                                    type="tel" 
                                                    value={tempAddress.mobile}
                                                    onChange={(e) => setTempAddress({...tempAddress, mobile: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label htmlFor="pin-code" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">PIN Code</label>
                                                <input 
                                                    id="pin-code"
                                                    type="text" 
                                                    value={tempAddress.pin}
                                                    onChange={(e) => setTempAddress({...tempAddress, pin: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-2 space-y-1">
                                                <label htmlFor="house" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">House No. / Building Name</label>
                                                <input 
                                                    id="house"
                                                    type="text" 
                                                    value={tempAddress.house}
                                                    onChange={(e) => setTempAddress({...tempAddress, house: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-2 space-y-1">
                                                <label htmlFor="area" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Area / Colony / Street</label>
                                                <input 
                                                    id="area"
                                                    type="text" 
                                                    value={tempAddress.area}
                                                    onChange={(e) => setTempAddress({...tempAddress, area: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label htmlFor="city" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">City / District</label>
                                                <input 
                                                    id="city"
                                                    type="text" 
                                                    value={tempAddress.city}
                                                    onChange={(e) => setTempAddress({...tempAddress, city: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label htmlFor="state" className="text-[11px] font-black uppercase tracking-widest text-neutral-400">State</label>
                                                <input 
                                                    id="state"
                                                    type="text" 
                                                    value={tempAddress.state}
                                                    onChange={(e) => setTempAddress({...tempAddress, state: e.target.value})}
                                                    className="w-full px-4 py-3 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button 
                                                type="submit"
                                                className="w-full py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-xl"
                                            >
                                                Update Acquisition Point
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <button 
                                                onClick={() => setShowMap(false)}
                                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors"
                                            >
                                                <ArrowLeft size={14} /> Back to Form
                                            </button>
                                            <div className="text-[11px] font-black uppercase tracking-widest text-brand-pink bg-brand-pink/5 px-3 py-1 rounded">Visual Positioning Mode</div>
                                        </div>

                                        <div className="relative aspect-video bg-[#FDFBF7] rounded border-2 border-neutral-100 overflow-hidden group shadow-inner">
                                            {/* Simulated Map Background */}
                                            <div className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 bg-[url('https://api.maptiler.com/maps/basic-v2/static/78.4867,17.3850,12/800x450.png?key=get_your_own_key')] bg-cover bg-center" />
                                            
                                            {/* The Artisan Pin */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <motion.div 
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="relative flex flex-col items-center"
                                                >
                                                    <div className="w-12 h-12 bg-neutral-950 rounded-full flex items-center justify-center text-brand-pink shadow-2xl border-2 border-brand-pink/20 relative z-10">
                                                        <MapPin size={24} fill="currentColor" />
                                                    </div>
                                                    <div className="w-4 h-4 bg-black/20 rounded-full blur-[2px] mt-1 scale-x-150" />
                                                    <div className="absolute -top-12 bg-white px-4 py-2 rounded-full shadow-2xl border border-neutral-100 whitespace-nowrap">
                                                        <span className="text-xs font-black uppercase tracking-widest text-neutral-900">Artisan Delivery Point</span>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Search Overlay */}
                                            <div className="absolute top-4 left-4 right-4">
                                                <div className="relative">
                                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search Artisan Valley..."
                                                        className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-md rounded border border-white shadow-2xl outline-none text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button 
                                                onClick={handleDetectLocation}
                                                disabled={isDetecting}
                                                className="flex-1 py-5 border-2 border-neutral-950 text-neutral-950 text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-50 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isDetecting ? 'Syncing...' : 'Auto-Sync Point'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setTempAddress({
                                                        ...tempAddress,
                                                        pin: '500032',
                                                        area: 'Financial District',
                                                        city: 'Hyderabad',
                                                        state: 'Telangana'
                                                    });
                                                    setShowMap(false);
                                                }}
                                                className="flex-[2] py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-xl"
                                            >
                                                Confirm Pinned Location
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ArrowLeft = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
);

export default Checkout;
