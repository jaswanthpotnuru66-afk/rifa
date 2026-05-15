import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    User, Shield, MapPin, Bell, CreditCard, 
    LogOut, Camera, Check,
    Smartphone, Lock, Plus, Trash2,
    Globe, Clock, Heart, ShoppingBag, PenLine,
    ArrowRight, Package, Search, MessageSquare,
    Sparkles, Truck,
    ChevronRight, ArrowLeft, Loader2, CheckCircle2, X, Navigation
} from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { StoredInquiry } from './CustomOrder';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [17.3850, 78.4867]; // Hyderabad

// Helper component to update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

/* --- Mock User Data --- */
const MOCK_USER = {
    name: 'Sai Sampath',
    email: 'sai.sampath@example.com',
    phone: '+91 98765 43210',
    username: 'sai_sampath',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    joined: 'October 2023',
    locations: [
        { id: '1', label: 'Primary Residence', address: '123 Art Lane, Jubilee Hills, Hyderabad, 500033', isDefault: true },
        { id: '2', label: 'Summer Home', address: '456 Heritage St, Banjara Hills, Hyderabad, 500034', isDefault: false }
    ],
    wishlist: [
        { id: 'resin-ocean-frame', name: 'Ceramic Lotus Bowl', price: 1200, category: 'Pottery', image: '/products/mandala.png' },
        { id: 'heritage-jamdani-saree', name: 'Silk Embroidered Tapestry', price: 4500, category: 'Textiles', image: '/products/earrings.png' }
    ]
};

type SettingsTab = 'general' | 'security' | 'addresses' | 'notifications' | 'billing' | 'wishlist' | 'bag' | 'orders';

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [user, setUser] = useState<any>(api.getUser());
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            const [u, o, a, w, c] = await Promise.all([
                api.getMe(),
                api.getOrders(),
                api.getAddresses(),
                api.getWishlist(),
                api.getCart()
            ]);
            setUser(u);
            setOrders(o);
            setAddresses(a);
            setWishlist(w);
            setCart(c);
            setIsLoadingData(false);
        };
        loadData();
    }, []);

    React.useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab as SettingsTab);
        }
    }, [location]);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, avatar_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Orders state
    const [contact, setContact] = useState('');
    const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState<any>({
        label: '',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
    });
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapCenter(newCenter);
                
                // Try to parse some components from display_name
                const parts = display_name.split(', ');
                setAddressForm({
                    ...addressForm,
                    address_line1: parts[0] || '',
                    city: parts[parts.length - 3] || '',
                    state: parts[parts.length - 2] || '',
                    pincode: parts[parts.length - 1]?.match(/\d+/)?.[0] || ''
                });
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocationSelect = async (lat: number, lng: number) => {
        const newPos: [number, number] = [lat, lng];
        setMapCenter(newPos);
        
        // Reverse Geocoding
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.address) {
                const addr = data.address;
                setAddressForm({
                    ...addressForm,
                    address_line1: addr.road || addr.suburb || addr.neighbourhood || '',
                    city: addr.city || addr.town || addr.village || '',
                    state: addr.state || '',
                    pincode: addr.postcode || ''
                });
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
        }
    };

    const handleDetectLocation = () => {
        setIsDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                handleLocationSelect(lat, lng);
                setIsDetectingLocation(false);
            }, () => {
                setIsDetectingLocation(false);
                alert("Location access denied.");
            });
        } else {
            setIsDetectingLocation(false);
            alert("Geolocation not supported.");
        }
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAddress(true);
        try {
            const res = await api.saveAddress({
                ...addressForm,
                user_id: user.id,
                is_default: addresses.length === 0 || addressForm.is_default
            });
            if (!res.error) {
                setAddresses([...addresses, res]);
                setShowAddressModal(false);
                setAddressForm({
                    label: '', full_name: '', phone: '',
                    address_line1: '', address_line2: '',
                    city: '', state: '', pincode: '',
                    is_default: false
                });
                alert('Location successfully archived in your vault.');
            } else {
                alert('Backend Error: ' + res.error);
            }
        } catch (err) {
            console.error('Error saving address:', err);
            alert('Critical Error: Could not connect to the artisan network. Please ensure the database column exists.');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleSyncOrders = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contact.trim()) return;
        setIsLoadingOrders(true);
        try {
            const { data, error } = await supabase
                .from('inquiries')
                .select('*')
                .eq('contact', contact.trim())
                .order('created_at', { ascending: false });
            if (error) throw error;
            setInquiries((data || []).map(d => ({
                ...d,
                date: d.created_at,
                confirmedPrice: d.confirmed_price
            } as StoredInquiry)));
        } catch (err) {
            console.error('Error syncing orders:', err);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleAddToCartFromWishlist = async (item: any) => {
        try {
            console.log('Adding to cart from wishlist:', item);
            const res = await api.addToCart({
                user_id: user.id,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: 1,
                image_url: item.image_url,
                artisan_id: item.artisan_id
            });
            
            if (res && !res.error) {
                console.log('Successfully added to cart:', res);
                // Update local cart state immediately so it shows in "Bag" tab
                const updatedCart = await api.getCart();
                setCart(updatedCart);
                
                // Optional: Remove from wishlist after adding to cart
                await api.removeFromWishlist(item.id);
                setWishlist(wishlist.filter(w => w.id !== item.id));
                
                // Show "Bag" tab to the user
                setActiveTab('bag');
            } else {
                console.error('Error adding to cart:', res?.error);
                alert('Failed to add to cart: ' + (res?.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error moving from wishlist to cart:', err);
        }
    };

    const handleRemoveFromWishlist = async (id: string) => {
        try {
            const success = await api.removeFromWishlist(id);
            if (success) {
                setWishlist(wishlist.filter(w => w.id !== id));
            }
        } catch (err) {
            console.error('Error removing from wishlist:', err);
        }
    };

    const combinedOrders = React.useMemo(() => [
        ...orders.map(o => ({
            id: o.id,
            name: o.order_items?.[0]?.product_name || `Order #${o.id.slice(0, 8)}`,
            status: o.status,
            date: o.created_at,
            price: `₹${o.total_amount.toLocaleString()}`,
            type: 'product',
            image: o.order_items?.[0]?.image_url
        })),
        ...inquiries.map(i => ({
            id: i.id,
            name: `${i.occasion} Custom Order`,
            status: i.status,
            date: i.date,
            price: `₹${i.confirmedPrice || i.budget}`,
            type: 'bespoke',
            image: undefined,
            data: i
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [orders, inquiries]);

    const StatusBadge = ({ status }: { status: string }) => {
        const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
            new: { bg: 'bg-neutral-50', text: 'text-neutral-900', border: 'border-neutral-200', icon: <Clock size={10} /> },
            contacted: { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-300', icon: <MessageSquare size={10} /> },
            'in-progress': { bg: 'bg-brand-pink/10', text: 'text-brand-pink', border: 'border-brand-pink/20', icon: <Sparkles size={10} /> },
            completed: { bg: 'bg-neutral-950', text: 'text-white', border: 'border-neutral-950', icon: <CheckCircle2 size={10} /> }
        };
        const config = configs[status] || configs.new;
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[9px] font-black tracking-[0.3em] uppercase border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
                {config.icon} {status.replace('-', ' ')}
            </span>
        );
    };

    const DetailRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) => (
        <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</p>
                <div className="text-xs text-neutral-900 font-medium">{value}</div>
            </div>
        </div>
    );

    const handleSave = async () => {
        setIsSaving(true);
        const res = await api.updateProfile({
            full_name: user.full_name,
            phone: user.phone,
            location: user.location,
            avatar_url: user.avatar_url
        });
        setIsSaving(false);
        if (!res.error) {
            setUser(res);
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } else {
            alert('Failed to save profile: ' + res.error);
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm('WARNING: Are you sure you want to permanently delete your account? All your order history and profile data will be purged. This action cannot be undone.')) {
            const res = await api.deleteAccount();
            if (res.error) {
                console.error('Error deactivating:', res.error);
                alert('Failed to deactivate account.');
            } else {
                navigate('/');
            }
        }
    };

    const handleLogout = () => {
        api.logout();
        navigate('/');
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'Collector Identity', icon: <User size={18} strokeWidth={1.5} /> },
        { id: 'orders', label: 'Acquisitions', icon: <Package size={18} strokeWidth={1.5} /> },
        { id: 'bag', label: 'Pending Reserves', icon: <ShoppingBag size={18} strokeWidth={1.5} /> },
        { id: 'wishlist', label: 'Curated Wishlist', icon: <Heart size={18} strokeWidth={1.5} /> },
        { id: 'addresses', label: 'Destination Vault', icon: <MapPin size={18} strokeWidth={1.5} /> },
        { id: 'billing', label: 'Member Privileges', icon: <CreditCard size={18} strokeWidth={1.5} /> },
        { id: 'security', label: 'Security & Access', icon: <Shield size={18} strokeWidth={1.5} /> },
        { id: 'notifications', label: 'Preferences', icon: <Bell size={18} strokeWidth={1.5} /> },
    ];

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-t-2 border-brand-pink/30 rounded-full"
                        />
                        <div className="absolute inset-4 flex items-center justify-center">
                            <Sparkles className="text-brand-pink animate-pulse" size={32} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-900">Synchronizing Vault</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Fetching artisan records & acquisitions</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 selection:bg-brand-pink/20 font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-100 pb-12">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400">Personal Archive</span>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter">
                            Collector's Vault
                        </h1>
                    </div>

                    {/* Vault Summary Stats */}
                    <div className="flex items-center gap-12">
                        <div className="hidden sm:flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Acquisitions</p>
                                <p className="text-xl font-serif font-bold text-neutral-950">{orders.length} <span className="text-xs font-light text-neutral-400 italic">Pieces</span></p>
                            </div>
                            <div className="w-[1px] h-8 bg-neutral-100" />
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Vault Tier</p>
                                <p className="text-xl font-serif font-bold text-brand-pink italic">{orders.length > 5 ? 'Elite' : 'Member'} <span className="font-sans font-black text-[10px] uppercase not-italic ml-1">Collector</span></p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleLogout}
                                className="px-6 py-3 bg-neutral-950 text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                            <button 
                                onClick={handleDeactivate}
                                className="px-6 py-3 border border-neutral-200 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Deactivate
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar lg:overflow-visible">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative group flex-shrink-0 ${
                                        activeTab === tab.id 
                                        ? 'text-neutral-950' 
                                        : 'text-neutral-400 hover:text-neutral-600'
                                    }`}
                                >
                                    <span className={`${activeTab === tab.id ? 'text-brand-pink' : 'text-neutral-300 group-hover:text-neutral-400'} transition-colors`}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div 
                                            layoutId="active-tab-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 lg:h-full lg:w-1 bg-brand-pink lg:left-0 lg:right-auto"
                                        />
                                    )}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-12 p-8 bg-white border border-neutral-200 rounded-sm hidden lg:block relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 bg-brand-pink rounded-full" />
                                    <h3 className="text-neutral-950 text-[10px] font-black uppercase tracking-[0.3em]">Artisan Partnership</h3>
                                </div>
                                <h4 className="text-xl font-serif font-bold text-neutral-950 mb-4 leading-tight">
                                    Your Craft. <br />
                                    <span className="italic text-neutral-400 font-light text-lg">Our Infrastructure.</span>
                                </h4>
                                <p className="text-neutral-500 text-[11px] font-medium leading-relaxed mb-8">
                                    Are you a master of your craft seeking a global audience? Join the Rifa Collective to scale your passion with our premium commerce infrastructure.
                                </p>
                                <Link 
                                    to="/collaborate" 
                                    className="w-full py-4 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink transition-all block text-center shadow-lg"
                                >
                                    Apply to Collaborate
                                </Link>
                                
                                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-6">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-neutral-950">50+</p>
                                        <p className="text-[8px] uppercase tracking-tighter text-neutral-400">Masters</p>
                                    </div>
                                    <div className="w-px h-6 bg-neutral-100" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-neutral-950">100%</p>
                                        <p className="text-[8px] uppercase tracking-tighter text-neutral-400">Fair Trade</p>
                                    </div>
                                    <div className="w-px h-6 bg-neutral-100" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-neutral-950">Global</p>
                                        <p className="text-[8px] uppercase tracking-tighter text-neutral-400">Reach</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Professional Watermark/Decoration */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                                <Globe size={120} strokeWidth={1} />
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 max-w-3xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-12"
                            >
                                {/* --- GENERAL TAB --- */}
                                {activeTab === 'general' && (
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between pb-4 border-b border-neutral-50">
                                            <div className="flex items-center gap-10">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border border-neutral-100 shadow-xl bg-neutral-50 flex items-center justify-center">
                                                        {user?.avatar_url || MOCK_USER.avatar ? (
                                                            <img src={user?.avatar_url || MOCK_USER.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={32} className="text-neutral-300" />
                                                        )}
                                                    </div>
                                                    {isEditing && (
                                                        <>
                                                            <input 
                                                                type="file" 
                                                                accept="image/*" 
                                                                className="hidden" 
                                                                ref={fileInputRef} 
                                                                onChange={handleImageUpload} 
                                                            />
                                                            <button 
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="absolute bottom-0 right-0 w-8 h-8 bg-neutral-950 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all animate-in zoom-in duration-300"
                                                            >
                                                                <Camera size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-serif font-bold text-neutral-950">Collector Profile</h3>
                                                    <p className="text-xs text-neutral-400 font-light">Your identity as a patron of handcrafted masterpieces.</p>
                                                </div>
                                            </div>
                                            {!isEditing && (
                                                <button 
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-6 py-3 border border-neutral-200 text-[11px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-950 hover:border-neutral-950 transition-all"
                                                >
                                                    <PenLine size={12} /> Edit Profile
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                            {[
                                                { label: 'Legal Name', value: user?.full_name || '', key: 'full_name' },
                                                { label: 'Email Workspace', value: user?.email || '', key: 'email', disabled: true },
                                                { label: 'Contact Number', value: user?.phone || user?.mobile_number || '', key: 'phone' },
                                                { label: 'Primary Address', value: user?.location || '', key: 'location' }
                                            ].map((field, i) => (
                                                <div key={i} className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">{field.label}</label>
                                                    {isEditing ? (
                                                        <input 
                                                            type="text" 
                                                            value={field.value} 
                                                            disabled={field.disabled}
                                                            onChange={(e) => setUser({ ...user, [field.key]: e.target.value })}
                                                            className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm text-neutral-950 font-bold transition-all bg-transparent disabled:opacity-50" 
                                                        />
                                                    ) : (
                                                        <p className="py-3 text-sm text-neutral-950 font-medium border-b border-transparent">{field.value || 'Not set'}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 pt-6">
                                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Collector's Vision</label>
                                            {isEditing ? (
                                                <textarea 
                                                    rows={4} 
                                                    placeholder="Describe your taste—what draws you to specific art forms or artisan works?" 
                                                    className="w-full px-0 py-4 border-b border-neutral-100 focus:border-brand-pink outline-none text-neutral-950 font-light leading-relaxed transition-all bg-transparent resize-none" 
                                                />
                                            ) : (
                                                <p className="py-4 text-sm font-light text-neutral-600 leading-relaxed max-w-xl italic">
                                                    "A collector of stories and handcrafted legacies. I'm particularly drawn to the intersection of modern geometry and traditional resin mastery."
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Edit Mode Controls */}
                                        <AnimatePresence>
                                            {isEditing && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="flex items-center gap-6 pt-8"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            onClick={handleSave}
                                                            disabled={isSaving}
                                                            className="px-10 py-4 bg-neutral-950 text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-3"
                                                        >
                                                            {isSaving ? <Clock size={14} className="animate-spin" /> : <Check size={14} />} Save Modifications
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsEditing(false)}
                                                            className="px-10 py-4 border border-neutral-200 text-neutral-400 text-xs font-black uppercase tracking-widest hover:text-neutral-950 transition-all"
                                                        >
                                                            Discard
                                                        </button>
                                                    </div>

                                                    <AnimatePresence>
                                                        {showSuccess && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10 }}
                                                                className="flex items-center gap-2 text-green-600"
                                                            >
                                                                <Check size={14} />
                                                                <span className="text-[11px] font-black uppercase tracking-widest">Archives Updated</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* --- ORDERS TAB --- */}
                                {activeTab === 'orders' && (
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between border-b border-neutral-50 pb-6">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-serif font-bold text-neutral-950">Acquisition Chronicle</h3>
                                                <p className="text-xs text-neutral-400 font-light">History of your handcrafted acquisitions and custom orders.</p>
                                            </div>
                                        </div>

                                        {!selectedOrderId ? (
                                            <div className="space-y-8">
                                                <form onSubmit={handleSyncOrders} className="relative group max-w-md">
                                                    <div className="absolute inset-y-0 left-4 flex items-center text-neutral-300 group-focus-within:text-brand-pink transition-colors">
                                                        <Search size={16} />
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        value={contact}
                                                        onChange={(e) => setContact(e.target.value)}
                                                        placeholder="Sync custom orders via contact..."
                                                        className="w-full pl-12 pr-24 py-4 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-xs font-bold transition-all placeholder:text-neutral-300 placeholder:font-light"
                                                    />
                                                    <button 
                                                        type="submit"
                                                        disabled={isLoadingOrders}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all"
                                                    >
                                                        {isLoadingOrders ? <Loader2 size={10} className="animate-spin" /> : 'Sync'}
                                                    </button>
                                                </form>

                                                <div className="space-y-4">
                                                    {combinedOrders.length > 0 ? (
                                                        combinedOrders.map((order) => (
                                                            <div 
                                                                key={order.id}
                                                                onClick={() => setSelectedOrderId(order.id)}
                                                                className="flex items-center justify-between p-4 bg-white border border-neutral-50 hover:border-brand-pink/20 hover:shadow-lg transition-all cursor-pointer group"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-16 bg-neutral-50 rounded flex items-center justify-center text-neutral-300 overflow-hidden shrink-0 border border-neutral-50">
                                                                        {order.image ? (
                                                                            <img src={order.image} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <Package size={20} strokeWidth={1} />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-neutral-950 group-hover:text-brand-pink transition-colors">
                                                                            {order.name}
                                                                        </h4>
                                                                        <p className="text-xs text-neutral-400 font-medium mt-1">
                                                                            {new Date(order.date).toLocaleDateString()} • {order.price}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <StatusBadge status={order.status} />
                                                                    <ChevronRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-20 text-center border-2 border-dashed border-neutral-50">
                                                            <Package size={32} className="mx-auto text-neutral-200 mb-4" />
                                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">No Orders in the Archive</p>
                                                            <Link to="/marketplace" className="text-brand-pink text-[11px] font-bold mt-2 inline-block hover:underline">Begin your first acquisition</Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Simple Detail View (Internal State) */
                                            <div className="bg-white border border-neutral-50 p-8 space-y-8 animate-in fade-in slide-in-from-right-4">
                                                <button 
                                                    onClick={() => setSelectedOrderId(null)}
                                                    className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors"
                                                >
                                                    <ArrowLeft size={12} /> Back to Chronicle
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div className="space-y-6">
                                                        <DetailRow label="Order Reference" icon={<Package size={14} />} value={selectedOrderId} />
                                                        <DetailRow label="Dispatch Status" icon={<Truck size={14} />} value="Premium Courier Tracking" />
                                                        <DetailRow label="Authentication" icon={<CheckCircle2 size={14} />} value="Verified Artisan Piece" />
                                                    </div>
                                                    <div className="p-6 bg-neutral-50/50 border border-neutral-100 space-y-4">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-neutral-950">Next Milestone</h4>
                                                        <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                                            Your masterpiece is undergoing final inspection. Anticipated delivery is within 3-5 business cycles.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* --- BAG TAB --- */}
                                {activeTab === 'bag' && (
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between border-b border-neutral-50 pb-6">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-serif font-bold text-neutral-950">Acquisition Bag</h3>
                                                <p className="text-xs text-neutral-400 font-light">Your selected masterpieces awaiting final confirmation.</p>
                                            </div>
                                            <Link 
                                                to="/cart"
                                                className="flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all"
                                            >
                                                Go to Checkout <ArrowRight size={12} />
                                            </Link>
                                        </div>

                                        <div className="space-y-6">
                                            {cart.length > 0 ? (
                                                cart.map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-6 p-4 bg-white border border-neutral-50 hover:border-neutral-200 transition-all group">
                                                        <Link to={`/product/${item.product_id}`} className="w-20 h-20 bg-neutral-100 flex-shrink-0 block overflow-hidden">
                                                            <img src={item.image_url || 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=800'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </Link>
                                                        <div className="flex-1 min-w-0">
                                                            <Link to={`/product/${item.product_id}`}>
                                                                <h4 className="text-sm font-bold text-neutral-950 truncate hover:text-brand-pink transition-colors">{item.product_name}</h4>
                                                            </Link>
                                                            <p className="text-xs text-neutral-400 font-medium mt-1">Quantity: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-serif font-bold text-neutral-950">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                            <button 
                                                                onClick={async () => {
                                                                    const success = await api.removeFromCart(item.id);
                                                                    if (success) {
                                                                        setCart(cart.filter(c => c.id !== item.id));
                                                                    }
                                                                }}
                                                                className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors mt-2"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center border-2 border-dashed border-neutral-50 flex flex-col items-center gap-4">
                                                    <ShoppingBag size={32} className="text-neutral-100" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Your bag is empty</p>
                                                        <p className="text-[11px] text-neutral-300 font-light">Acquire your first masterpiece today.</p>
                                                    </div>
                                                    <Link to="/marketplace" className="mt-2 px-8 py-3 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all">Go to Gallery</Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* --- WISHLIST TAB --- */}
                                {activeTab === 'wishlist' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {wishlist.length > 0 ? (
                                                wishlist.map((item: any) => (
                                                    <div key={item.id} className="bg-white border border-neutral-100 group overflow-hidden relative shadow-sm hover:shadow-2xl transition-all duration-500">
                                                        <Link to={`/product/${item.product_id}`} className="aspect-[4/5] overflow-hidden relative block">
                                                            <img src={item.image_url || 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=800'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                            <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                                                <button 
                                                                    onClick={(e) => { e.preventDefault(); handleAddToCartFromWishlist(item); }}
                                                                    className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                                                                >
                                                                    <ShoppingBag size={20} />
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => { e.preventDefault(); handleRemoveFromWishlist(item.id); }}
                                                                    className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
                                                        </Link>
                                                        <div className="p-6 space-y-2">
                                                            <div className="flex justify-between items-start">
                                                                <Link to={`/product/${item.product_id}`}>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink">{item.category || 'Masterpiece'}</span>
                                                                    <h3 className="text-sm font-serif font-bold text-neutral-950 mt-1 hover:text-brand-pink transition-colors">{item.product_name || 'Handmade Creation'}</h3>
                                                                </Link>
                                                                <p className="font-serif font-bold text-neutral-900">₹{item.price?.toLocaleString() || '---'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-32 text-center border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center gap-4">
                                                    <Heart size={32} className="text-neutral-100" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Vault Wishlist Empty</p>
                                                        <p className="text-[11px] text-neutral-300 font-light">Curate your personal collection from our gallery.</p>
                                                    </div>
                                                    <Link to="/marketplace" className="mt-2 px-8 py-3 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all">Explore Creations</Link>
                                                </div>
                                            )}
                                            <div className="border-2 border-dashed border-neutral-100 p-8 flex flex-col items-center justify-center text-center gap-4 group hover:border-neutral-200 transition-all">
                                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 group-hover:text-brand-pink group-hover:scale-110 transition-all">
                                                    <Plus size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Add from Collection</p>
                                                    <p className="text-[11px] text-neutral-300 font-light mt-1">Discover more masterpieces to your vault.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- SECURITY TAB --- */}
                                {activeTab === 'security' && (
                                    <div className="space-y-10">
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between py-6 border-b border-neutral-50 group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 bg-neutral-50 flex items-center justify-center text-neutral-400">
                                                        <Lock size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-neutral-950">Password Archive</h3>
                                                        <p className="text-xs text-neutral-400 font-light mt-1">Last rotated 3 months ago.</p>
                                                    </div>
                                                </div>
                                                <button className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-pink transition-colors">Change Password</button>
                                            </div>

                                            <div className="flex items-center justify-between py-6 border-b border-neutral-50">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 bg-neutral-50 flex items-center justify-center text-neutral-400">
                                                        <Smartphone size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-neutral-950">Two-Step Verification</h3>
                                                        <p className="text-xs text-neutral-400 font-light mt-1">Add an extra layer of protection to your vault.</p>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-6 bg-neutral-200 rounded-full relative cursor-pointer">
                                                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between py-6 border-b border-neutral-50">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 bg-neutral-50 flex items-center justify-center text-neutral-400">
                                                        <Globe size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-neutral-950">Browser Sessions</h3>
                                                        <p className="text-xs text-neutral-400 font-light mt-1">Currently active on 2 devices.</p>
                                                    </div>
                                                </div>
                                                <button className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors">Manage Sessions</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- ADDRESSES TAB --- */}
                                {activeTab === 'addresses' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {addresses.length > 0 ? (
                                                addresses.map((loc: any) => (
                                                    <div key={loc.id} className={`p-8 border ${loc.is_default ? 'border-neutral-950 bg-white shadow-2xl' : 'border-neutral-100 bg-neutral-50/30'} relative group transition-all`}>
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div>
                                                                <h3 className="text-sm font-bold text-neutral-950">{loc.label}</h3>
                                                                {loc.is_default && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-pink mt-1 block">Default Archive</span>}
                                                            </div>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (window.confirm('Delete this location?')) {
                                                                            await api.deleteAddress(loc.id);
                                                                            setAddresses(addresses.filter(a => a.id !== loc.id));
                                                                        }
                                                                    }}
                                                                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-neutral-900 mb-2">{loc.full_name}</p>
                                                        <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                                            {loc.address_line1}, {loc.address_line2 && `${loc.address_line2}, `}{loc.city}, {loc.state} - {loc.pincode}
                                                        </p>
                                                        <p className="text-xs text-neutral-400 mt-4 font-medium">{loc.phone}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-50">
                                                    <MapPin size={32} className="mx-auto text-neutral-100 mb-4" />
                                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">No saved locations</p>
                                                </div>
                                            )}
                                            
                                            {/* Add Address Form Trigger */}
                                            <button 
                                                onClick={() => {
                                                    setAddressForm({
                                                        label: '', full_name: user?.full_name || '', phone: user?.phone || '',
                                                        address_line1: '', address_line2: '',
                                                        city: '', state: '', pincode: '',
                                                        is_default: addresses.length === 0
                                                    });
                                                    setShowAddressModal(true);
                                                }}
                                                className="border-2 border-dashed border-neutral-100 p-8 flex flex-col items-center justify-center gap-4 text-neutral-300 hover:border-neutral-200 hover:text-neutral-500 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Plus size={18} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest">Add New Location</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* --- NOTIFICATIONS TAB --- */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-8">
                                        <div className="bg-white border border-neutral-100 p-8 space-y-8">
                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-4">Transactional</h3>
                                                {[
                                                    { title: 'Order Status Updates', desc: 'Real-time progress on your commissions.' },
                                                    { title: 'Artisan Messages', desc: 'Direct communications from the studio.' },
                                                    { title: 'Delivery Dispatch', desc: 'Notified when your piece begins its journey.' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="max-w-md">
                                                            <h4 className="text-sm font-bold text-neutral-950">{item.title}</h4>
                                                            <p className="text-xs text-neutral-400 font-light mt-0.5">{item.desc}</p>
                                                        </div>
                                                        <div className="w-10 h-5 bg-neutral-950 rounded-full relative cursor-pointer">
                                                            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-6 pt-4">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-4">Discovery</h3>
                                                {[
                                                    { title: 'New Artisan Spotlights', desc: 'Meet the latest masters to join Rifa.' },
                                                    { title: 'Seasonal Catalogues', desc: 'Exclusive access to our editorial collections.' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="max-w-md">
                                                            <h4 className="text-sm font-bold text-neutral-950">{item.title}</h4>
                                                            <p className="text-xs text-neutral-400 font-light mt-0.5">{item.desc}</p>
                                                        </div>
                                                        <div className="w-10 h-5 bg-neutral-200 rounded-full relative cursor-pointer">
                                                            <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- BILLING TAB --- */}
                                {activeTab === 'billing' && (
                                    <div className="space-y-8">
                                        <div className="bg-neutral-900 p-8 rounded-sm overflow-hidden relative group">
                                            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                                                <div className="flex justify-between items-start">
                                                    <CreditCard size={32} className="text-neutral-700" />
                                                    <span className="text-neutral-500 text-xs font-black tracking-widest uppercase">Member Card</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-white font-serif text-2xl tracking-widest font-bold">•••• •••• •••• 4321</p>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Holder</p>
                                                            <p className="text-xs text-white uppercase font-bold tracking-widest">{MOCK_USER.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Expiry</p>
                                                            <p className="text-xs text-white font-bold tracking-widest">12 / 28</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:scale-125" />
                                        </div>

                                        <button className="w-full py-6 border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center gap-3 text-neutral-300 hover:border-neutral-200 hover:text-neutral-500 transition-all">
                                            <Plus size={20} strokeWidth={1} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Register New Payment Method</span>
                                        </button>
                                    </div>
                                )}

                              
                            </motion.div>
                        </AnimatePresence>
                    </main>
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
                                    <MapPin size={16} className="text-brand-pink" /> Archive New Location
                                </h3>
                                <button type="button" onClick={() => setShowAddressModal(false)} className="text-neutral-400 hover:text-neutral-950 transition-colors"><X size={20} /></button>
                            </div>
                            
                            <div className="flex flex-col md:flex-row h-[85vh] overflow-hidden">
                                {/* Left Side: Map Section */}
                                <div className="flex-1 relative bg-neutral-50 border-r border-neutral-100 flex flex-col">
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
                                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Address Label</label>
                                                <input 
                                                    type="text" 
                                                    value={addressForm.label}
                                                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                    className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                    placeholder="e.g. Primary Residence"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Recipient Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={addressForm.full_name}
                                                        onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                                        className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Contact Number</label>
                                                    <input 
                                                        type="tel" 
                                                        value={addressForm.phone}
                                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                        className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Address Line 1</label>
                                                <input 
                                                    type="text" 
                                                    value={addressForm.address_line1}
                                                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                                    className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                    placeholder="House No, Building, Street"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Address Line 2 (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={addressForm.address_line2}
                                                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                                    className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                    placeholder="Landmark, Area"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">City</label>
                                                    <input 
                                                        type="text" 
                                                        value={addressForm.city}
                                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                        className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">PIN Code</label>
                                                    <input 
                                                        type="text" 
                                                        value={addressForm.pincode}
                                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                        className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all bg-transparent"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <input 
                                                    type="checkbox" 
                                                    id="set-default"
                                                    checked={addressForm.is_default}
                                                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                                    className="accent-brand-pink"
                                                />
                                                <label htmlFor="set-default" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Set as primary archive point</label>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button 
                                                type="submit"
                                                disabled={isSavingAddress}
                                                className="w-full py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-3"
                                            >
                                                {isSavingAddress ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
                                                Save Artisan Point
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

export default Profile;
