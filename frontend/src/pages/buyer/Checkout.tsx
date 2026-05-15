import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    ChevronRight, MapPin, ShieldCheck, 
    CreditCard, CheckCircle2, 
    Lock, Plus,
    PenTool, Gift, Sparkles, Award, X,
    Navigation, Search, AlertTriangle, Truck,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../lib/api';

// Fix Leaflet marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- MAP HELPERS ---
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isBespoke = location.state?.isBespoke || false;
    
    // Core States
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isGifting, setIsGifting] = useState(false);
    const [giftMessage, setGiftMessage] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Map & Location States
    const [mapCenter, setMapCenter] = useState<[number, number]>([17.3850, 78.4867]); // Default Hyderabad
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [addressForm, setAddressForm] = useState({
        full_name: '',
        phone: '',
        pincode: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        label: 'Home',
        latitude: 17.3850,
        longitude: 78.4867
    });

    useEffect(() => {
        const loadInitialData = async () => {
            const user = api.getUser();
            if (!user) {
                navigate('/auth', { state: { from: location } });
                return;
            }

            try {
                // 1. Fetch Items
                const productId = location.state?.productId;
                if (productId) {
                    const pData = await api.getProduct(productId);
                    if (pData) {
                        setCartItems([{
                            ...pData,
                            product_id: pData.id,
                            product_name: pData.name,
                            quantity: 1,
                            image_url: pData.image_url || pData.images?.[0],
                            artisan_id: pData.artisan_id || pData.artisans?.id
                        }]);
                    }
                } else {
                    const data = await api.getCart();
                    setCartItems(data);
                }

                // 2. Fetch User Addresses
                const aData = await api.getAddresses(user.id);
                setAddresses(aData);
                if (aData.length > 0) {
                    const def = aData.find((a: any) => a.is_default) || aData[0];
                    setSelectedAddress(def);
                }
            } catch (err) {
                console.error('Checkout data load error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [location.state, navigate]);

    // --- LOCATION HANDLERS ---
    const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        setAddressForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.address) {
                const addr = data.address;
                setAddressForm(prev => ({
                    ...prev,
                    pincode: addr.postcode || '',
                    city: addr.city || addr.town || addr.village || addr.suburb || '',
                    state: addr.state || '',
                    address_line1: addr.road || addr.suburb || data.display_name.split(',')[0]
                }));
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
        }
    }, []);

    const handleDetectLocation = () => {
        setIsDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
                    setIsDetectingLocation(false);
                },
                (err) => {
                    console.error('Geo error:', err);
                    setIsDetectingLocation(false);
                    alert("Could not detect location. Please select manually on map.");
                }
            );
        }
    };

    const handleSearchAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const first = data[0];
                handleLocationSelect(parseFloat(first.lat), parseFloat(first.lon));
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = api.getUser();
        if (!user) return;

        try {
            const newAddress = await api.saveAddress({
                ...addressForm,
                user_id: user.id
            });
            setAddresses([...addresses, newAddress]);
            setSelectedAddress(newAddress);
            setShowAddressModal(false);
        } catch (err) {
            console.error('Address save error:', err);
        }
    };

    const subtotalMRP = cartItems.reduce((acc: number, item: any) => acc + ((item.original_price || item.price) * (item.quantity || 1)), 0);
    const subtotalPrice = cartItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
    const totalSavings = subtotalMRP - subtotalPrice;
    const totalAmount = subtotalPrice + (cartItems.length > 0 ? 29 : 0);


    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a destination for this masterpiece.');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product_id: item.product_id || item.id,
                    product_name: item.product_name || item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    image_url: item.image_url || item.images?.[0],
                    artisan_id: item.artisan_id
                })),
                address: selectedAddress,
                paymentMethod,
                totalAmount,
                isGifting,
                giftMessage
            };

            const res = await api.createOrder(orderData);
            if (!res.error) {
                navigate('/success');
            } else {
                alert(`Order processing error: ${res.error}`);
            }
        } catch (err) {
            console.error('Order submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5F1] gap-4">
                <Loader2 size={40} className="text-brand-pink animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Authenticating Acquisition...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
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
                                        {addresses.length > 0 ? (
                                            <div className="space-y-4">
                                                {addresses.map((addr: any) => (
                                                    <div 
                                                        key={addr.id}
                                                        onClick={() => setSelectedAddress(addr)}
                                                        className={`p-6 rounded border transition-all cursor-pointer ${selectedAddress?.id === addr.id ? 'border-brand-pink bg-brand-pink/[0.02] shadow-md' : 'border-neutral-100 hover:border-neutral-200'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-sm italic">{addr.full_name[0]}</span>
                                                                <div>
                                                                    <h3 className="text-sm font-serif font-black text-neutral-900">{addr.full_name}</h3>
                                                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{addr.label}</p>
                                                                </div>
                                                            </div>
                                                            {selectedAddress?.id === addr.id && <CheckCircle2 size={16} className="text-brand-pink" />}
                                                        </div>
                                                        <p className="text-xs text-neutral-500 font-medium">{addr.address_line1}, {addr.city}</p>
                                                        <p className="text-[10px] text-neutral-900 font-black mt-2">{addr.phone}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 border-2 border-dashed border-neutral-100 rounded-sm">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">No acquisition points saved</p>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => setStep(2)}
                                            disabled={!selectedAddress}
                                            className={`w-full py-5 text-white text-xs font-black uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 group ${!selectedAddress ? 'bg-neutral-300' : 'bg-neutral-950 hover:bg-neutral-800'}`}
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

                                    {/* Natural Material Acknowledgement */}
                                    {cartItems.some((i: any) => i.isNatural || i.is_natural) && (
                                        <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-sm space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="pt-1">
                                                    <input 
                                                        type="checkbox" 
                                                        id="checkout-natural-acknowledgement"
                                                        checked={isAcknowledged}
                                                        onChange={(e) => setIsAcknowledged(e.target.checked)}
                                                        className="w-5 h-5 accent-brand-pink cursor-pointer"
                                                    />
                                                </div>
                                                <label htmlFor="checkout-natural-acknowledgement" className="text-[11px] font-medium text-neutral-600 leading-relaxed cursor-pointer selection:bg-brand-pink/10">
                                                    I acknowledge that some masterpieces in my curation are crafted from <span className="font-bold text-neutral-900">natural materials</span>. I understand that organic variations in grain, texture, and color are inherent to the material and are not considered defects.
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-8 text-center">
                                        <button 
                                            onClick={handlePlaceOrder}
                                            disabled={(cartItems.some((i: any) => i.isNatural || i.is_natural) && !isAcknowledged) || isSubmitting}
                                            className={`w-full py-6 text-white text-xs font-black uppercase tracking-[0.5em] transition-all shadow-2xl flex items-center justify-center gap-6 group overflow-hidden relative ${
                                                ((cartItems.some((i: any) => i.isNatural || i.is_natural) && !isAcknowledged) || isSubmitting) 
                                                ? 'bg-neutral-300 cursor-not-allowed shadow-none' 
                                                : 'bg-brand-pink hover:bg-[#e6a8a8] shadow-2xl'
                                            }`}
                                        >
                                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Complete Acquisition'} <Award size={20} className="group-hover:rotate-12 transition-transform" />
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
                            
                            <div className="p-6 bg-[#FAF9F6] border-b border-neutral-100 space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                                {cartItems.map((item: any, idx: number) => (
                                    <div key={item.id || idx} className="flex gap-4 border-b border-neutral-50 pb-4 last:border-0 last:pb-0">
                                        <div className="w-20 h-24 bg-white rounded border border-neutral-200 overflow-hidden shrink-0 shadow-sm">
                                            <img src={item.image_url || item.images?.[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col justify-center space-y-1 flex-1">
                                            <h4 className="text-sm font-serif font-bold text-neutral-950 leading-tight">{item.product_name || item.name}</h4>
                                            <p className="text-[10px] font-black text-brand-pink uppercase tracking-widest italic">Handcrafted Masterpiece</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] font-bold text-neutral-400">{item.quantity || 1} x ₹{item.price.toLocaleString()}</span>
                                                <span className="text-xs font-bold text-neutral-900">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 space-y-5 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-repeat">
                                <div className="flex justify-between items-center text-xs text-neutral-500 font-medium italic">
                                    <span>Original Valuation</span>
                                    <span className="text-neutral-900 font-bold">₹{subtotalMRP.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-green-600 font-bold italic">
                                    <span>Collector's Benefit</span>
                                    <span>-₹{totalSavings.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-neutral-500 font-medium italic">
                                    <span>Packaging & Handling</span>
                                    <span className="text-neutral-900 font-bold">₹29</span>
                                </div>
                                <div className="h-[1px] bg-neutral-200 my-6 border-t border-dashed" />
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Total Valuation</span>
                                        <span className="text-4xl font-serif font-bold text-neutral-950 mt-1">₹{totalAmount.toLocaleString()}</span>
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
                            className="relative w-full max-w-4xl bg-white shadow-2xl rounded-sm overflow-hidden"
                        >
                            <div className="p-6 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-900 flex items-center gap-2">
                                    <MapPin size={16} className="text-brand-pink" /> Archive New Location
                                </h3>
                                <button type="button" onClick={() => setShowAddressModal(false)} className="text-neutral-400 hover:text-neutral-950 transition-colors"><X size={20} /></button>
                            </div>
                            
                            <div className="flex flex-col md:flex-row h-[75vh] overflow-hidden">
                                {/* Left Side: Map Section */}
                                <div className="flex-1 relative bg-neutral-50 border-r border-neutral-100 flex flex-col min-h-[300px]">
                                    <div className="p-4 bg-white/80 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink">
                                                <Navigation size={14} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 block">Pinpoint Archive</span>
                                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">Click map to drop marker</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleDetectLocation}
                                            disabled={isDetectingLocation}
                                            className="px-4 py-2 bg-neutral-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md flex items-center gap-2"
                                        >
                                            {isDetectingLocation ? <Loader2 size={10} className="animate-spin" /> : <MapPin size={10} />}
                                            {isDetectingLocation ? 'Syncing...' : 'Use My Current'}
                                        </button>
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <MapContainer 
                                            center={mapCenter} 
                                            zoom={13} 
                                            style={{ height: '100%', width: '100%' }}
                                            zoomControl={false}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <Marker position={mapCenter} />
                                            <MapUpdater center={mapCenter} />
                                            <MapClickHandler onLocationSelect={handleLocationSelect} />
                                        </MapContainer>

                                        {/* Search Overlay */}
                                        <div className="absolute top-4 left-4 right-4 z-[1000]">
                                            <form onSubmit={handleSearchAddress} className="relative">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <input 
                                                    type="text" 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search Artisan Valley..."
                                                    className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-md rounded border border-white shadow-2xl outline-none text-xs font-bold"
                                                />
                                                {isSearching && <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-brand-pink" />}
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Form Section */}
                                <div className="w-full md:w-[400px] bg-white overflow-y-auto no-scrollbar border-l border-neutral-100 p-8">
                                    <form onSubmit={handleSaveAddress} className="space-y-6">
                                        <div className="space-y-4 pb-4 border-b border-neutral-50">
                                            <div className="flex gap-2">
                                                {['Home', 'Gallery', 'Workshop', 'Other'].map((l) => (
                                                    <button 
                                                        key={l}
                                                        type="button"
                                                        onClick={() => setAddressForm({...addressForm, label: l})}
                                                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${addressForm.label === l ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {[
                                            { label: 'Artisan Name / Recipient', key: 'full_name', type: 'text' },
                                            { label: 'Contact Sequence', key: 'phone', type: 'tel' },
                                            { label: 'PIN Archive', key: 'pincode', type: 'text' },
                                            { label: 'Address Line 1 (Visual)', key: 'address_line1', type: 'text' },
                                            { label: 'City Hub', key: 'city', type: 'text' },
                                            { label: 'State Territory', key: 'state', type: 'text' }
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{field.label}</label>
                                                <input 
                                                    type={field.type} 
                                                    value={(addressForm as any)[field.key]}
                                                    onChange={(e) => setAddressForm({ ...addressForm, [field.key]: e.target.value })}
                                                    className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                    required
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-6">
                                            <button 
                                                type="submit"
                                                className="w-full py-5 bg-neutral-950 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl"
                                            >
                                                Archive Artisan Point
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default Checkout;
