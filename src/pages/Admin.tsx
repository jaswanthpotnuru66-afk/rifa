import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    LogOut,
    Trash2,
    IndianRupee,
    Clock,
    Package,
    FileText,
    User,
    Send,
    ArrowLeft,
    Handshake,
    Store
} from 'lucide-react';
import type { StoredInquiry } from './CustomOrder';
import type { CreatorApplication } from './Collaborate';
import { supabase } from '../lib/supabase';

const Admin = () => {
    // --- State Management ---
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('rifa_admin_auth') === 'true'); // Tracks if admin is logged in
    const [email, setEmail] = useState(''); // Login form email
    const [password, setPassword] = useState(''); // Login form password
    const [error, setError] = useState(''); // Login error messages
    const [inquiries, setInquiries] = useState<StoredInquiry[]>([]); // All fetched orders
    const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'in-progress' | 'completed'>('all'); // Current filter tab
    const [selectedId, setSelectedId] = useState<string | null>(null); // ID of the currently viewed order (for Detail view)
    const [searchQuery, setSearchQuery] = useState(''); // Search bar input
    const [loading, setLoading] = useState(false); // Loading spinner state
    const [activePanel, setActivePanel] = useState<'orders' | 'creators'>('orders');
    const [creatorApplications, setCreatorApplications] = useState<CreatorApplication[]>([]);
    const [creatorFilter, setCreatorFilter] = useState<'all' | 'new' | 'reviewing' | 'approved' | 'rejected'>('all');
    const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
    const [creatorSearchQuery, setCreatorSearchQuery] = useState('');

    // --- Data Fetching ---
    // Fetches all inquiries from the Supabase database
    async function loadInquiries() {
        setLoading(true);
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching inquiries:', error);
            setError('Failed to load inquiries');
        } else {
            console.log("Fetched inquiries:", data);

            const formattedData: StoredInquiry[] = (data || []).map(item => ({
                id: item.id,
                date: item.created_at,
                name: item.name,
                contact: item.contact,
                occasion: item.occasion,
                artForms: item.art_forms || [],
                budget: item.budget,
                description: item.description,
                address: item.address,
                neededBy: item.needed_by,
                fileName: item.file_name,
                status: item.status,
                confirmedPrice: item.confirmed_price,
                finalDeliveryDate: item.final_delivery_date,
                finalNotes: item.final_notes,
                paymentStatus: item.payment_status,
                shippingInfo: item.shipping_info
            }));
            setInquiries(formattedData);
        }
        setLoading(false);
    }

    async function loadCreatorApplications() {
        const { data, error } = await supabase
            .from('creator_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching creator applications:', error);
            return;
        }

        const formattedData: CreatorApplication[] = (data || []).map(item => ({
            id: item.id,
            date: item.created_at,
            creatorName: item.creator_name,
            brandName: item.brand_name || '',
            contact: item.contact,
            email: item.email || '',
            location: item.location || '',
            collaborationType: item.collaboration_type,
            productCategories: item.product_categories || [],
            priceRange: item.price_range || '',
            productDescription: item.product_description,
            socialLink: item.social_link || '',
            imageUrl: item.image_url,
            status: item.status,
            dashboardStatus: item.dashboard_status,
            commissionTerms: item.commission_terms || '',
            adminNotes: item.admin_notes || '',
            mobileNumber: item.mobile_number || item.contact || '',
            shopName: item.shop_name || item.brand_name || item.creator_name || '',
            shopSlug: item.shop_slug || '',
            primaryCraftCategory: item.primary_craft_category || item.product_categories?.[0] || '',
            homeRegion: item.home_region || item.location || '',
            craftOriginStory: item.craft_origin_story || item.product_description || '',
            shopBannerUrl: item.shop_banner_url || '',
            shopLogoUrl: item.shop_logo_url || item.image_url || '',
            shippingOriginPinCode: item.shipping_origin_pin_code || '',
        }));

        setCreatorApplications(formattedData);
    }

    useEffect(() => {
        if (isAuthenticated) {
            queueMicrotask(() => {
                loadInquiries();
                loadCreatorApplications();
            });
        }
    }, [isAuthenticated]);

    // --- Login Logic ---
    // Verifies email/password against the 'admins' table in Supabase
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Query the admins table
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) {
            console.error("Login failed:", error);
            setError('Invalid login credentials');
        } else {
            setIsAuthenticated(true);
            sessionStorage.setItem('rifa_admin_auth', 'true');
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        sessionStorage.removeItem('rifa_admin_auth');
        setIsAuthenticated(false);
        setInquiries([]);
        setCreatorApplications([]);
    };

    // --- Update Logic ---
    // Updates specific fields of an inquiry (e.g. status, price)
    const updateInquiry = async (id: string, updates: Partial<StoredInquiry>) => {
        // Optimistic update locally
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, ...updates } : inq));

        // Prepare data for DB (convert camelCase to snake_case)
        const dbUpdates: Record<string, string> = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.confirmedPrice) dbUpdates.confirmed_price = updates.confirmedPrice;
        if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.finalDeliveryDate) dbUpdates.final_delivery_date = updates.finalDeliveryDate;
        if (updates.finalNotes) dbUpdates.final_notes = updates.finalNotes;
        if (updates.shippingInfo) dbUpdates.shipping_info = updates.shippingInfo;

        const { error } = await supabase
            .from('inquiries')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating inquiry:', error);
            // Revert changes if needed or show notification
            loadInquiries();
        }
    };

    const deleteInquiry = async (id: string) => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
            // Optimistic update
            setInquiries(prev => prev.filter(inq => inq.id !== id));
            if (selectedId === id) setSelectedId(null);

            const { error } = await supabase
                .from('inquiries')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting inquiry:', error);
                loadInquiries();
            }
        }
    };

    const updateCreatorApplication = async (id: string, updates: Partial<CreatorApplication>) => {
        setCreatorApplications(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));

        const dbUpdates: Record<string, string> = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.dashboardStatus !== undefined) dbUpdates.dashboard_status = updates.dashboardStatus;
        if (updates.commissionTerms !== undefined) dbUpdates.commission_terms = updates.commissionTerms;
        if (updates.adminNotes !== undefined) dbUpdates.admin_notes = updates.adminNotes;

        const { error } = await supabase
            .from('creator_applications')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating creator application:', error);
            loadCreatorApplications();
        }
    };

    const deleteCreatorApplication = async (id: string) => {
        if (confirm('Are you sure you want to delete this creator application?')) {
            setCreatorApplications(prev => prev.filter(app => app.id !== id));
            if (selectedCreatorId === id) setSelectedCreatorId(null);

            const { error } = await supabase
                .from('creator_applications')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting creator application:', error);
                loadCreatorApplications();
            }
        }
    };

    // --- Filtering Logic ---
    // Filters the list based on the selected tab (New, Completed, etc.) AND the search bar
    const filteredInquiries = inquiries.filter(inq => {
        const matchesFilter = filter === 'all' || inq.status === filter;
        const matchesSearch = inquiryMatchesSearch(inq, searchQuery);
        return matchesFilter && matchesSearch;
    });

    const selectedInquiry = inquiries.find(inq => inq.id === selectedId);
    const filteredCreatorApplications = creatorApplications.filter(app => {
        const matchesFilter = creatorFilter === 'all' || app.status === creatorFilter;
        const matchesSearch = creatorApplicationMatchesSearch(app, creatorSearchQuery);
        return matchesFilter && matchesSearch;
    });
    const selectedCreatorApplication = creatorApplications.find(app => app.id === selectedCreatorId);

    function inquiryMatchesSearch(inq: StoredInquiry, query: string) {
        const q = query.toLowerCase();
        return (
            inq.name.toLowerCase().includes(q) ||
            inq.contact.toLowerCase().includes(q) ||
            inq.occasion.toLowerCase().includes(q)
        );
    }

    function creatorApplicationMatchesSearch(app: CreatorApplication, query: string) {
        const q = query.toLowerCase();
        const searchable = [
            app.creatorName,
            app.brandName,
            app.contact,
            app.mobileNumber || '',
            app.shopName || '',
            app.shopSlug || '',
            app.primaryCraftCategory || '',
            app.homeRegion || '',
            app.productCategories.join(' '),
        ].join(' ').toLowerCase();

        return searchable.includes(q);
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                            <User size={32} />
                        </div>
                        <h1 className="font-serif text-3xl text-gray-800 mb-2">Admin Portal</h1>
                        <p className="text-gray-500">Sign in to manage orders</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="Details provided in task"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Accessing...' : 'Access Dashboard'}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // --- Main Admin UI ---
    return (
        // Main Container: Fixed full screen (below navbar)
        <div className="fixed inset-0 top-[76px] bg-gray-100 flex flex-col overflow-hidden z-40">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm z-10 font-sans">
                <div className="flex items-center gap-3">
                    {/* Mobile: Show Back button if details open, else show Menu icon (cosmetic or for future sidebar) */}
                    {((activePanel === 'orders' && selectedId) || (activePanel === 'creators' && selectedCreatorId)) && (
                        <button
                            onClick={() => activePanel === 'orders' ? setSelectedId(null) : setSelectedCreatorId(null)}
                            className="md:hidden p-1.5 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="font-serif text-lg md:text-xl font-bold text-gray-900">Rifa Admin</h1>
                    <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
                    <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                        {activePanel === 'orders' ? <Package size={14} /> : <Handshake size={14} />}
                        {activePanel === 'orders' ? inquiries.length : creatorApplications.length}
                        <span className="hidden md:inline">{activePanel === 'orders' ? 'Orders' : 'Creators'}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActivePanel('orders')}
                            className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${activePanel === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActivePanel('creators')}
                            className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${activePanel === 'creators' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Collaborators
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs md:text-sm font-medium"
                    >
                        <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>

            <div className="sm:hidden bg-white border-b border-gray-200 p-2 grid grid-cols-2 gap-2">
                <button
                    onClick={() => setActivePanel('orders')}
                    className={`py-2 rounded-lg text-sm font-medium ${activePanel === 'orders' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    Orders
                </button>
                <button
                    onClick={() => setActivePanel('creators')}
                    className={`py-2 rounded-lg text-sm font-medium ${activePanel === 'creators' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    Collaborators
                </button>
            </div>

            {/* Split View Container */}
            <div className="flex flex-1 overflow-hidden relative">
                {activePanel === 'orders' ? (
                    <>

                {/* Left Side: Order List */}
                {/* Responsive Logic: 
                    - On Mobile: Hidden if an order is selected (Details view covers it)
                    - On Desktop: Always visible (Side-by-side view)
                */}
                <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col z-0 transition-all ${selectedId ? 'hidden md:flex' : 'flex'}`}>

                    {/* Search & Filter */}
                    <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-gold outline-none"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {(['all', 'new', 'in-progress', 'completed'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 border ${filter === f
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {f.replace('-', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && inquiries.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
                        ) : filteredInquiries.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No orders found</div>
                        ) : (
                            filteredInquiries.map(inq => (
                                <div
                                    key={inq.id}
                                    onClick={() => setSelectedId(inq.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedId === inq.id
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-sm">{inq.name}</h3>
                                        <StatusBadge status={inq.status} />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 truncate">{inq.occasion} • {inq.artForms.join(', ')}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{new Date(inq.date).toLocaleDateString()}</span>
                                        {inq.neededBy && <span className="text-blue-600 font-medium">Due: {new Date(inq.neededBy).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Order Details */}
                {/* Responsive Logic:
                    - On Mobile: Only visible if an order is selected
                    - On Desktop: Always visible (shows placeholder if nothing selected)
                */}
                <div className={`flex-1 bg-gray-50 overflow-y-auto p-4 md:p-8 pb-20 ${!selectedId ? 'hidden md:block' : 'block'}`}>
                    {selectedInquiry ? (
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Header Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => setSelectedId(null)}
                                            className="md:hidden p-1 -ml-1 text-gray-500"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                        <h2 className="text-lg font-serif font-bold text-gray-900">Order Details</h2>
                                    </div>
                                    <p className="text-sm text-gray-500">ID: {selectedInquiry.id.slice(0, 8)}</p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <select
                                        value={selectedInquiry.status}
                                        onChange={(e) => updateInquiry(selectedInquiry.id, { status: e.target.value as StoredInquiry['status'] })}
                                        className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block p-2.5"
                                    >
                                        <option value="new">New Request</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button
                                        onClick={() => deleteInquiry(selectedInquiry.id)}
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                        title="Delete Order"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Left Col: Customer Data (Read Only mainly) */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <User size={16} /> Customer Info
                                        </h3>

                                        <div className="space-y-4">
                                            <InfoRow label="Name" value={selectedInquiry.name} />
                                            <InfoRow label="Contact" value={selectedInquiry.contact} />
                                            <InfoRow label="Address" value={selectedInquiry.address || 'N/A'} />

                                            <div className="pt-4 border-t border-gray-100">
                                                <a href={`https://wa.me/${selectedInquiry.contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium">
                                                    <Send size={14} /> Open WhatsApp
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <Package size={16} /> Request Details
                                        </h3>
                                        <div className="space-y-4">
                                            <InfoRow label="Occasion" value={selectedInquiry.occasion} />
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 font-medium">Art Forms</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedInquiry.artForms.map(art => (
                                                        <span key={art} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">{art}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <InfoRow label="Budget Range" value={selectedInquiry.budget} />
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 font-medium">Customer Note</span>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 break-words whitespace-pre-wrap">
                                                    {selectedInquiry.description || 'No description provided.'}
                                                </p>
                                            </div>
                                            {selectedInquiry.fileName && (
                                                <div className="space-y-2">
                                                    <span className="text-xs text-gray-500 font-medium">Reference Image</span>
                                                    <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-h-60 w-full flex items-center justify-center">
                                                        <img
                                                            src={selectedInquiry.fileName}
                                                            alt="Reference"
                                                            className="max-h-60 object-contain w-auto mx-auto"
                                                        />
                                                        <a
                                                            href={selectedInquiry.fileName}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium backdrop-blur-sm"
                                                        >
                                                            View Full Size
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: Admin Management (Editable) */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gold/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-full -mr-10 -mt-10"></div>

                                        <h3 className="text-sm font-bold text-brand-text uppercase tracking-wide mb-6 flex items-center gap-2">
                                            <Clock size={16} /> Order Management
                                        </h3>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Final Price</label>
                                                    <div className="relative">
                                                        <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={selectedInquiry.confirmedPrice || ''}
                                                            onChange={(e) => updateInquiry(selectedInquiry.id, { confirmedPrice: e.target.value })}
                                                            placeholder="0.00"
                                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Payment Status</label>
                                                    <select
                                                        value={selectedInquiry.paymentStatus || 'pending'}
                                                        onChange={(e) => updateInquiry(selectedInquiry.id, { paymentStatus: e.target.value as StoredInquiry['paymentStatus'] })}
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none bg-white"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="partially-paid">Partially Paid</option>
                                                        <option value="paid">Paid</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Requested By</label>
                                                    <input
                                                        type="date"
                                                        disabled
                                                        value={selectedInquiry.neededBy || ''}
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Final Delivery Date</label>
                                                    <input
                                                        type="date"
                                                        value={selectedInquiry.finalDeliveryDate || ''}
                                                        onChange={(e) => updateInquiry(selectedInquiry.id, { finalDeliveryDate: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-dashed border-gray-200">
                                                <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center justify-between">
                                                    <span>Finalized Product Details (Audit)</span>
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Visible to Admin</span>
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={selectedInquiry.finalNotes || ''}
                                                    onChange={(e) => updateInquiry(selectedInquiry.id, { finalNotes: e.target.value })}
                                                    placeholder="Enter exact details of the final agreed product (Dimensions, Colors, Materials)..."
                                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Shipping / Delivery Info</label>
                                                <input
                                                    type="text"
                                                    value={selectedInquiry.shippingInfo || ''}
                                                    onChange={(e) => updateInquiry(selectedInquiry.id, { shippingInfo: e.target.value })}
                                                    placeholder="Courier Name, Tracking ID, etc."
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <FileText size={32} className="text-gray-300" />
                            </div>
                            <p className="font-medium">Select an inquiry to view details</p>
                        </div>
                    )}
                </div>
                    </>
                ) : (
                    <CreatorApplicationsPanel
                        filteredCreatorApplications={filteredCreatorApplications}
                        selectedCreatorApplication={selectedCreatorApplication}
                        selectedCreatorId={selectedCreatorId}
                        creatorSearchQuery={creatorSearchQuery}
                        creatorFilter={creatorFilter}
                        setCreatorSearchQuery={setCreatorSearchQuery}
                        setCreatorFilter={setCreatorFilter}
                        setSelectedCreatorId={setSelectedCreatorId}
                        updateCreatorApplication={updateCreatorApplication}
                        deleteCreatorApplication={deleteCreatorApplication}
                    />
                )}
            </div>
        </div>
    );
};

type CreatorApplicationsPanelProps = {
    filteredCreatorApplications: CreatorApplication[];
    selectedCreatorApplication?: CreatorApplication;
    selectedCreatorId: string | null;
    creatorSearchQuery: string;
    creatorFilter: 'all' | 'new' | 'reviewing' | 'approved' | 'rejected';
    setCreatorSearchQuery: (query: string) => void;
    setCreatorFilter: (filter: 'all' | 'new' | 'reviewing' | 'approved' | 'rejected') => void;
    setSelectedCreatorId: (id: string | null) => void;
    updateCreatorApplication: (id: string, updates: Partial<CreatorApplication>) => Promise<void>;
    deleteCreatorApplication: (id: string) => Promise<void>;
};

const CreatorApplicationsPanel = ({
    filteredCreatorApplications,
    selectedCreatorApplication,
    selectedCreatorId,
    creatorSearchQuery,
    creatorFilter,
    setCreatorSearchQuery,
    setCreatorFilter,
    setSelectedCreatorId,
    updateCreatorApplication,
    deleteCreatorApplication,
}: CreatorApplicationsPanelProps) => (
    <>
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col z-0 transition-all ${selectedCreatorId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search creators..."
                        value={creatorSearchQuery}
                        onChange={(e) => setCreatorSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-gold outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {(['all', 'new', 'reviewing', 'approved', 'rejected'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setCreatorFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 border ${creatorFilter === f
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredCreatorApplications.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">No collaborators found</div>
                ) : (
                    filteredCreatorApplications.map(app => (
                        <div
                            key={app.id}
                            onClick={() => setSelectedCreatorId(app.id)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedCreatorId === app.id
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <div className="min-w-0">
                                    <h3 className="font-medium text-gray-900 text-sm truncate">{app.shopName || app.creatorName}</h3>
                                    <p className="text-xs text-gray-500 truncate">{app.shopSlug ? `rifa.in/${app.shopSlug}` : app.brandName || 'Independent creator'}</p>
                                </div>
                                <CreatorStatusBadge status={app.status} />
                            </div>
                            <p className="text-xs text-gray-500 my-2 truncate">{app.primaryCraftCategory || app.productCategories.join(', ')} - {app.homeRegion || app.location || 'Region pending'}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{new Date(app.date).toLocaleDateString()}</span>
                                <span className="text-blue-600 font-medium">{app.dashboardStatus.replace('-', ' ')}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className={`flex-1 bg-gray-50 overflow-y-auto p-4 md:p-8 pb-20 ${!selectedCreatorId ? 'hidden md:block' : 'block'}`}>
            {selectedCreatorApplication ? (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => setSelectedCreatorId(null)}
                                    className="md:hidden p-1 -ml-1 text-gray-500"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <h2 className="text-lg font-serif font-bold text-gray-900">Collaborator Details</h2>
                            </div>
                            <p className="text-sm text-gray-500">ID: {selectedCreatorApplication.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <select
                                value={selectedCreatorApplication.status}
                                onChange={(e) => updateCreatorApplication(selectedCreatorApplication.id, { status: e.target.value as CreatorApplication['status'] })}
                                className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block p-2.5"
                            >
                                <option value="new">New</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button
                                onClick={() => deleteCreatorApplication(selectedCreatorApplication.id)}
                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                title="Delete Creator Application"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <User size={16} /> Shop Profile
                                </h3>
                                <div className="space-y-4">
                                    <InfoRow label="Shop Name" value={selectedCreatorApplication.shopName || selectedCreatorApplication.brandName || selectedCreatorApplication.creatorName} />
                                    <InfoRow label="Storefront" value={selectedCreatorApplication.shopSlug ? `rifa.in/${selectedCreatorApplication.shopSlug}` : selectedCreatorApplication.socialLink || 'N/A'} />
                                    <InfoRow label="Mobile" value={selectedCreatorApplication.mobileNumber || selectedCreatorApplication.contact} />
                                    <InfoRow label="Email" value={selectedCreatorApplication.email || 'N/A'} />
                                    <InfoRow label="Home State / Region" value={selectedCreatorApplication.homeRegion || selectedCreatorApplication.location || 'N/A'} />
                                    <InfoRow label="Shipping Origin PIN" value={selectedCreatorApplication.shippingOriginPinCode || 'N/A'} />
                                    {selectedCreatorApplication.shopLogoUrl && (
                                        <div className="space-y-2">
                                            <span className="text-xs text-gray-500 font-medium">Shop Logo</span>
                                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                <img src={selectedCreatorApplication.shopLogoUrl} alt="Shop logo" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                    {selectedCreatorApplication.shopBannerUrl && (
                                        <div className="space-y-2">
                                            <span className="text-xs text-gray-500 font-medium">Shop Banner</span>
                                            <div className="aspect-[4/1] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                <img src={selectedCreatorApplication.shopBannerUrl} alt="Shop banner" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                    {selectedCreatorApplication.socialLink && (
                                        <a
                                            href={selectedCreatorApplication.socialLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            <Store size={14} /> Open Portfolio
                                        </a>
                                    )}
                                    <a href={`https://wa.me/${(selectedCreatorApplication.mobileNumber || selectedCreatorApplication.contact).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium">
                                        <Send size={14} /> Open WhatsApp
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Package size={16} /> Craft Approval Data
                                </h3>
                                <div className="space-y-4">
                                    <InfoRow label="Collaboration" value={formatCollaborationType(selectedCreatorApplication.collaborationType)} />
                                    <InfoRow label="Primary Craft Category" value={selectedCreatorApplication.primaryCraftCategory || selectedCreatorApplication.productCategories[0] || 'N/A'} />
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500 font-medium">Categories</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedCreatorApplication.productCategories.map(category => (
                                                <span key={category} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">{category}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500 font-medium">Craft Origin Story / Bio</span>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 break-words whitespace-pre-wrap">
                                            {selectedCreatorApplication.craftOriginStory || selectedCreatorApplication.productDescription}
                                        </p>
                                    </div>
                                    {selectedCreatorApplication.imageUrl && (
                                        <div className="space-y-2">
                                            <span className="text-xs text-gray-500 font-medium">Sample Product Image</span>
                                            <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-h-60 w-full flex items-center justify-center">
                                                <img
                                                    src={selectedCreatorApplication.imageUrl}
                                                    alt="Creator product"
                                                    className="max-h-60 object-contain w-auto mx-auto"
                                                />
                                                <a
                                                    href={selectedCreatorApplication.imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium backdrop-blur-sm"
                                                >
                                                    View Full Size
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gold/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-full -mr-10 -mt-10"></div>
                                <h3 className="text-sm font-bold text-brand-text uppercase tracking-wide mb-6 flex items-center gap-2">
                                    <Handshake size={16} /> Collaboration Management
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Dashboard Status</label>
                                        <select
                                            value={selectedCreatorApplication.dashboardStatus}
                                            onChange={(e) => updateCreatorApplication(selectedCreatorApplication.id, { dashboardStatus: e.target.value as CreatorApplication['dashboardStatus'] })}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none bg-white"
                                        >
                                            <option value="not-started">Not Started</option>
                                            <option value="planning">Planning</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="live">Live</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Commission / Partnership Terms</label>
                                        <textarea
                                            rows={4}
                                            value={selectedCreatorApplication.commissionTerms || ''}
                                            onChange={(e) => updateCreatorApplication(selectedCreatorApplication.id, { commissionTerms: e.target.value })}
                                            placeholder="Example: 20% commission, payment cycle, delivery responsibility..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Admin Notes</label>
                                        <textarea
                                            rows={5}
                                            value={selectedCreatorApplication.adminNotes || ''}
                                            onChange={(e) => updateCreatorApplication(selectedCreatorApplication.id, { adminNotes: e.target.value })}
                                            placeholder="Quality notes, product readiness, dashboard ideas, next follow-up..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Handshake size={32} className="text-gray-300" />
                    </div>
                    <p className="font-medium">Select a collaborator to view details</p>
                </div>
            )}
        </div>
    </>
);

// Helper Components
const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-start border-b border-gray-50 pb-2 last:border-0 last:pb-0">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="text-sm text-gray-900 font-medium text-right max-w-[60%]">{value}</span>
    </div>
);

const StatusBadge = ({ status }: { status: StoredInquiry['status'] }) => {
    const styles = {
        new: 'bg-blue-50 text-blue-700 border-blue-100',
        contacted: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'in-progress': 'bg-purple-50 text-purple-700 border-purple-100',
        completed: 'bg-green-50 text-green-700 border-green-100'
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.new}`}>
            {status.replace('-', ' ')}
        </span>
    );
};

const CreatorStatusBadge = ({ status }: { status: CreatorApplication['status'] }) => {
    const styles = {
        new: 'bg-blue-50 text-blue-700 border-blue-100',
        reviewing: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        approved: 'bg-green-50 text-green-700 border-green-100',
        rejected: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.new}`}>
            {status}
        </span>
    );
};

const formatCollaborationType = (type: CreatorApplication['collaborationType']) => {
    const labels = {
        'sell-through-rifa': 'Sell through Rifa',
        'merchandise-dashboard': 'Creator dashboard',
        both: 'Both options',
    };

    return labels[type] || type;
};

export default Admin;

