import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, ClipboardList, 
    AlertTriangle, Truck, IndianRupee, BarChart3, Star, 
    Settings, Bell, LogOut, Menu, PlusCircle, ChevronRight,
    X, TrendingUp, Megaphone, CheckCircle2, MessageSquare, Info
} from 'lucide-react';
import { mockMakerProfile, mockOrders } from '../lib/craftmaker';

interface CraftMakerLayoutProps { children: React.ReactNode; title?: string; }

// Flat nav structure — no more repeated groups
const NAV_ITEMS = [
    { name: 'Dashboard',     path: '/craftmaker/dashboard',     icon: LayoutDashboard, section: null },
    { name: 'My Listings',   path: '/craftmaker/listings',      icon: Package,         section: 'Shop' },
    { name: 'All Orders',    path: '/craftmaker/orders',        icon: ShoppingCart,    section: 'Shop' },
    { name: 'Custom Orders', path: '/craftmaker/orders/custom', icon: ClipboardList,   section: 'Shop', badge: null as number | null },
    { name: 'Disputes',      path: '/craftmaker/disputes',      icon: AlertTriangle,   section: 'Shop', badge: null as number | null },
    { name: 'Shipping',      path: '/craftmaker/shipping',      icon: Truck,           section: 'Finance' },
    { name: 'Earnings',      path: '/craftmaker/earnings',      icon: IndianRupee,     section: 'Finance' },
    { name: 'Tax Reports',   path: '/craftmaker/tax',           icon: BarChart3,       section: 'Finance' },
    { name: 'Marketing',     path: '/craftmaker/marketing',     icon: Megaphone,       section: 'Grow' },
    { name: 'Analytics',     path: '/craftmaker/analytics',     icon: TrendingUp,      section: 'Grow' },
    { name: 'Reviews',       path: '/craftmaker/reviews',       icon: Star,            section: 'Grow' },
    { name: 'Settings',      path: '/craftmaker/settings',      icon: Settings,        section: 'Account' },
];

const SECTIONS = ['Shop', 'Finance', 'Grow', 'Account'];

// Mock Notifications
const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'success', title: 'Payout Initiated', desc: '₹12,450 is on the way to your bank.', time: '2m ago', read: false },
    { id: 2, type: 'alert', title: 'Proof Deadline', desc: 'Order #ORD-882 needs a design proof today.', time: '1h ago', read: false },
    { id: 3, type: 'message', title: 'New Message', desc: 'Meera asked about "Ceramic Vase Set".', time: '3h ago', read: false },
    { id: 4, type: 'info', title: 'Listing Paused', desc: 'Handwoven Scarf is out of stock.', time: '1d ago', read: true },
];

const CraftMakerLayout: React.FC<CraftMakerLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

    const isActive = (path: string) => location.pathname === path;
    const currentPageName = NAV_ITEMS.find(i => isActive(i.path))?.name || 'Artisan Portal';

    // Live stat counters
    const activeOrders = mockOrders.filter(o => !['delivered','cancelled','disputed'].includes(o.status)).length;
    const pendingProofs = mockOrders.filter(o => o.status === 'proof-sent').length;

    return (
        <div className="fixed inset-0 z-50 flex bg-[#FAF7F2] font-sans overflow-hidden">

            {/* ── Mobile overlay ── */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-neutral-950/60 z-[60] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ═══════════════════ SIDEBAR ═══════════════════ */}
            <aside
                className={`fixed inset-y-0 left-0 z-[70] w-60 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundColor: '#0a0a0a' }}
            >
                {/* ── Top: Brand + Close ── */}
                <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        {/* Logo mark */}
                        <div className="relative w-8 h-8 shrink-0">
                            <div className="absolute inset-0 bg-brand-pink rounded-sm" />
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-serif font-black">R</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-serif font-bold leading-tight tracking-tight">Rifa</p>
                            <p className="text-brand-pink text-[9px] font-black uppercase tracking-[0.25em] leading-tight">CraftMaker</p>
                        </div>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/30 hover:text-white transition-colors p-1">
                        <X size={16} />
                    </button>
                </div>

                {/* ── Shop identity card ── */}
                <div className="mx-4 mb-4 rounded-sm overflow-hidden shrink-0" style={{ backgroundColor: '#171717' }}>
                    <div className="relative h-16 overflow-hidden">
                        <img src={mockMakerProfile.bannerUrl} alt="" className="w-full h-full object-cover opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] to-transparent" />
                    </div>
                    <div className="px-4 pt-0 pb-4 -mt-6 relative z-10">
                        <div className="flex items-end gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] overflow-hidden shrink-0 shadow-lg">
                                <img src={mockMakerProfile.logoUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 pb-1">
                                <p className="text-white text-xs font-bold truncate leading-tight">{mockMakerProfile.shopName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                                    <span className="text-[8px] font-black text-green-400 uppercase tracking-[0.15em]">Active Shop</span>
                                </div>
                            </div>
                        </div>
                        {/* Mini stats */}
                        <div className="grid grid-cols-3 gap-1 mt-3">
                            <div className="text-center">
                                <p className="text-white text-sm font-black font-serif leading-none">{activeOrders}</p>
                                <p className="text-white/30 text-[8px] font-bold uppercase tracking-wide mt-0.5">Orders</p>
                            </div>
                            <div className="text-center border-x border-white/5">
                                <p className={`text-sm font-black font-serif leading-none ${pendingProofs > 0 ? 'text-amber-400' : 'text-white'}`}>{pendingProofs}</p>
                                <p className="text-white/30 text-[8px] font-bold uppercase tracking-wide mt-0.5">Proofs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white text-sm font-black font-serif leading-none">4.8</p>
                                <p className="text-white/30 text-[8px] font-bold uppercase tracking-wide mt-0.5">Rating</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>

                    {/* Dashboard — always first, standalone */}
                    {(() => {
                        const item = NAV_ITEMS[0];
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-bold tracking-wide transition-all group mb-4 ${
                                    active ? 'bg-brand-pink text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <item.icon size={15} className={active ? 'text-white' : 'text-white/30 group-hover:text-white/70'} />
                                {item.name}
                                {active && <ChevronRight size={11} className="ml-auto text-white/60" />}
                            </Link>
                        );
                    })()}

                    {/* Sectioned nav */}
                    {SECTIONS.map(section => {
                        const items = NAV_ITEMS.filter(i => i.section === section);
                        return (
                            <div key={section} className="mb-5">
                                <p className="px-3 mb-1.5 text-[8px] font-black uppercase tracking-[0.35em] text-white/20">{section}</p>
                                <div className="space-y-0.5">
                                    {items.map(item => {
                                        const active = isActive(item.path);
                                        return (
                                            <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-bold tracking-wide transition-all group ${
                                                    active
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                <item.icon size={14} className={active ? 'text-brand-pink' : 'text-white/25 group-hover:text-white/60'} strokeWidth={active ? 2.5 : 2} />
                                                <span className="flex-1">{item.name}</span>
                                                {/* Badge for disputes */}
                                                {item.path === '/craftmaker/disputes' && mockOrders.filter(o => o.status === 'disputed').length > 0 && (
                                                    <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-black text-white shrink-0">
                                                        {mockOrders.filter(o => o.status === 'disputed').length}
                                                    </span>
                                                )}
                                                {active && <div className="w-1 h-1 rounded-full bg-brand-pink shrink-0" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Bottom actions ── */}
                <div className="px-3 pb-5 shrink-0 border-t border-white/5 pt-4">
                    <button onClick={() => navigate('/')}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-white/25 hover:text-red-400 text-[10px] font-bold tracking-wide transition-colors rounded-sm hover:bg-white/5">
                        <LogOut size={13} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── Topbar ── */}
                <header className="h-14 bg-white border-b border-neutral-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-neutral-500 hover:text-neutral-950 transition-colors" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={22} />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-neutral-300 hidden md:block">CraftMaker</span>
                            <ChevronRight size={10} className="text-neutral-200 hidden md:block" />
                            <span className="text-neutral-950">{currentPageName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Pending proofs alert */}
                        {pendingProofs > 0 && (
                            <Link to="/craftmaker/orders" className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 text-[9px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-all">
                                <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black">{pendingProofs}</span>
                                Proof{pendingProofs > 1 ? 's' : ''} Due
                            </Link>
                        )}

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative cursor-pointer text-neutral-400 hover:text-neutral-950 transition-colors p-2"
                            >
                                <Bell size={18} strokeWidth={1.75} />
                                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-pink rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black text-white">
                                    {MOCK_NOTIFICATIONS.filter(n => !n.read).length}
                                </span>
                            </button>

                            {/* Dropdown */}
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-sm shadow-2xl border border-neutral-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                        <div className="px-5 py-4 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Notifications</span>
                                            <button className="text-[9px] font-bold text-neutral-400 hover:text-brand-pink uppercase tracking-widest">Mark all read</button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto no-scrollbar">
                                            {MOCK_NOTIFICATIONS.map(notif => (
                                                <div key={notif.id} className={`p-5 flex gap-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors cursor-pointer ${!notif.read ? 'bg-brand-pink/[0.02]' : ''}`}>
                                                    <div className="shrink-0 mt-0.5">
                                                        {notif.type === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                                                        {notif.type === 'alert' && <AlertTriangle size={16} className="text-amber-500" />}
                                                        {notif.type === 'message' && <MessageSquare size={16} className="text-brand-pink" />}
                                                        {notif.type === 'info' && <Info size={16} className="text-blue-500" />}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold mb-0.5 ${!notif.read ? 'text-neutral-950' : 'text-neutral-700'}`}>{notif.title}</p>
                                                        <p className="text-[11px] font-medium text-neutral-500 leading-snug">{notif.desc}</p>
                                                        <p className="text-[9px] font-black text-neutral-300 mt-2 uppercase tracking-widest">{notif.time}</p>
                                                    </div>
                                                    {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0 ml-auto mt-1.5" />}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 border-t border-neutral-50 text-center bg-neutral-50/50">
                                            <button className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-950 transition-colors">View All History</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Add Listing */}
                        <Link to="/craftmaker/listings/new"
                            className="hidden md:flex items-center gap-2 bg-brand-pink text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 hover:bg-brand-pink-dark transition-all shadow-md shadow-brand-pink/20">
                            <PlusCircle size={13} /> Add Listing
                        </Link>
                    </div>
                </header>

                {/* ── Scrollable page content ── */}
                <main className="flex-1 overflow-y-auto no-scrollbar" style={{ backgroundColor: '#FAF7F2' }}>
                    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CraftMakerLayout;
