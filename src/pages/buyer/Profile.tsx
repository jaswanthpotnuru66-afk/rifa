import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
    User, Shield, MapPin, Bell, CreditCard, 
    LogOut, Camera, Check,
    Smartphone, Lock, Plus, Trash2,
    Globe, Clock, Heart, ShoppingBag, PenLine,
    ArrowRight, Package, Search, MessageSquare,
    Sparkles, Truck,
    ChevronRight, ArrowLeft, Loader2, CheckCircle2
} from 'lucide-react';
import { products } from '../../lib/products';
import { supabase } from '../../lib/supabase';
import type { StoredInquiry } from './CustomOrder';

/* --- Mock User Data --- */
const MOCK_USER = {
    name: 'Sai Sampath',
    email: 'sai.sampath@example.com',
    phone: '+91 98765 43210',
    username: 'sai_sampath',
    avatar: 'https://avatars.githubusercontent.com/u/511394?v=4',
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
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    React.useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab as SettingsTab);
        }
    }, [location]);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Orders state
    const [contact, setContact] = useState('');
    const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

    const combinedOrders = React.useMemo(() => [
        { id: 'ORD-8821', name: 'Heritage Jamdani Saree', status: 'completed' as const, date: '2024-04-12', price: '₹8,500', type: 'product', image: '/products/earrings.png' },
        { id: 'ORD-7742', name: 'Oceanic Resin Frame', status: 'in-progress' as const, date: '2024-03-28', price: '₹899', type: 'product', image: '/products/mandala.png' },
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
    ], [inquiries]);

    const StatusBadge = ({ status }: { status: string }) => {
        const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
            new: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Clock size={10} /> },
            contacted: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: <MessageSquare size={10} /> },
            'in-progress': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Sparkles size={10} /> },
            completed: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', icon: <CheckCircle2 size={10} /> }
        };
        const config = configs[status] || configs.new;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${config.bg} ${config.text} ${config.border}`}>
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

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General Info', icon: <User size={18} /> },
        { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
        { id: 'bag', label: 'My Bag', icon: <ShoppingBag size={18} /> },
        { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 selection:bg-brand-pink/20 font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-100 pb-12">
                    <div className="space-y-4">
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400">Personal Vault</span>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter">
                            Settings
                        </h1>
                    </div>

                    {/* Vault Summary Stats */}
                    <div className="flex items-center gap-12">
                        <div className="hidden sm:flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Acquisitions</p>
                                <p className="text-xl font-serif font-bold text-neutral-950">12 <span className="text-xs font-light text-neutral-400 italic">Pieces</span></p>
                            </div>
                            <div className="w-[1px] h-8 bg-neutral-100" />
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Custom Orders</p>
                                <p className="text-xl font-serif font-bold text-neutral-950">02 <span className="text-xs font-light text-neutral-400 italic">Active</span></p>
                            </div>
                            <div className="w-[1px] h-8 bg-neutral-100" />
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Vault Tier</p>
                                <p className="text-xl font-serif font-bold text-brand-pink italic">Elite <span className="font-sans font-black text-[10px] uppercase not-italic ml-1">Collector</span></p>
                            </div>
                        </div>

                        <button className="px-6 py-3 border border-neutral-200 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center gap-2">
                            <LogOut size={14} /> Deactivate
                        </button>
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

                        <div className="mt-12 p-8 bg-neutral-950 rounded-sm hidden lg:block overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">Collector Status</h3>
                                <p className="text-neutral-400 text-xs font-light leading-relaxed mb-6">You've been a member of the Rifa Collective since {MOCK_USER.joined}.</p>
                                <button className="w-full py-3 bg-brand-pink text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-pink/80 transition-all">
                                    View Achievements
                                </button>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-pink/20 rounded-full blur-3xl" />
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
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border border-neutral-100 shadow-xl">
                                                        <img src={MOCK_USER.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                    {isEditing && (
                                                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-neutral-950 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all animate-in zoom-in duration-300">
                                                            <Camera size={14} />
                                                        </button>
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
                                                { label: 'Legal Name', value: MOCK_USER.name, type: 'text' },
                                                { label: 'Username', value: `@${MOCK_USER.username}`, type: 'text' },
                                                { label: 'Email Workspace', value: MOCK_USER.email, type: 'email' },
                                                { label: 'Contact Number', value: MOCK_USER.phone, type: 'text' }
                                            ].map((field, i) => (
                                                <div key={i} className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">{field.label}</label>
                                                    {isEditing ? (
                                                        <input 
                                                            type={field.type} 
                                                            defaultValue={field.value.startsWith('@') ? field.value.slice(1) : field.value} 
                                                            className="w-full px-0 py-3 border-b border-neutral-100 focus:border-brand-pink outline-none text-sm text-neutral-950 font-bold transition-all bg-transparent" 
                                                        />
                                                    ) : (
                                                        <p className="py-3 text-sm text-neutral-950 font-medium border-b border-transparent">{field.value}</p>
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
                                                    {/* Combined Mock & Sync Results */}
                                                    {combinedOrders.map((order) => (
                                                        <div 
                                                            key={order.id}
                                                            onClick={() => setSelectedOrderId(order.id)}
                                                            className="flex items-center justify-between p-4 bg-white border border-neutral-50 hover:border-brand-pink/20 hover:shadow-lg transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-16 bg-neutral-50 rounded flex items-center justify-center text-neutral-300 overflow-hidden shrink-0 border border-neutral-50">
                                                                    {order.type === 'product' ? (
                                                                        <img src={order.image} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package size={20} strokeWidth={1} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-neutral-950 group-hover:text-brand-pink transition-colors">{order.name}</h4>
                                                                    <p className="text-xs text-neutral-400 font-medium mt-1">{new Date(order.date).toLocaleDateString()} • {order.price}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <StatusBadge status={order.status} />
                                                                <ChevronRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                        </div>
                                                    ))}
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
                                            {[
                                                { ...products[0], quantity: 2 },
                                                { ...products[1], quantity: 1 }
                                            ].map((item) => (
                                                <div key={item.id} className="flex items-center gap-6 p-4 bg-white border border-neutral-50 hover:border-neutral-200 transition-all group">
                                                    <Link to={`/product/${item.id}`} className="w-20 h-20 bg-neutral-100 flex-shrink-0 block overflow-hidden">
                                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </Link>
                                                    <div className="flex-1 min-w-0">
                                                        <Link to={`/product/${item.id}`}>
                                                            <h4 className="text-sm font-bold text-neutral-950 truncate hover:text-brand-pink transition-colors">{item.name}</h4>
                                                        </Link>
                                                        <p className="text-xs text-neutral-400 font-medium mt-1">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-serif font-bold text-neutral-950">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                        <button className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors mt-2">Remove</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* --- WISHLIST TAB --- */}
                                {activeTab === 'wishlist' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {MOCK_USER.wishlist.map((item) => (
                                                <div key={item.id} className="bg-white border border-neutral-100 group overflow-hidden relative shadow-sm hover:shadow-2xl transition-all duration-500">
                                                    <Link to={`/product/${item.id}`} className="aspect-[4/5] overflow-hidden relative block">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                                            <button className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                                                                <ShoppingBag size={20} />
                                                            </button>
                                                            <button className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75">
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </Link>
                                                    <div className="p-6 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <Link to={`/product/${item.id}`}>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink">{item.category}</span>
                                                                <h3 className="text-sm font-serif font-bold text-neutral-950 mt-1 hover:text-brand-pink transition-colors">{item.name}</h3>
                                                            </Link>
                                                            <p className="font-serif font-bold text-neutral-900">₹{item.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
                                            {MOCK_USER.locations.map((loc) => (
                                                <div key={loc.id} className={`p-8 border ${loc.isDefault ? 'border-neutral-950 bg-white shadow-2xl' : 'border-neutral-100 bg-neutral-50/30'} relative group transition-all`}>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <h3 className="text-sm font-bold text-neutral-950">{loc.label}</h3>
                                                            {loc.isDefault && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-pink mt-1 block">Default Archive</span>}
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 text-neutral-400 hover:text-neutral-950 transition-colors"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 font-light leading-relaxed">{loc.address}</p>
                                                </div>
                                            ))}
                                            <button className="border-2 border-dashed border-neutral-100 p-8 flex flex-col items-center justify-center gap-4 text-neutral-300 hover:border-neutral-200 hover:text-neutral-500 transition-all group">
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
        </div>
    );
};

export default Profile;
