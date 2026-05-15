import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import {
    LayoutDashboard, Users, UserPlus, Scale,
    ShoppingCart, AlertCircle, Flag,
    Truck, IndianRupee, FileBarChart, TrendingUp,
    Settings, Bell, LogOut, Menu, ChevronRight,
    X, Download, Check
} from 'lucide-react';
import { api } from '../lib/api';

interface AdminOpsLayoutProps { children: React.ReactNode; title?: string; }

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/admin/ops/dashboard', icon: LayoutDashboard, section: null },

    { name: 'All Makers', path: '/admin/ops/makers', icon: Users, section: 'MAKERS' },
    { name: 'Applications', path: '/admin/ops/makers/applications', icon: UserPlus, section: 'MAKERS' },
    { name: 'Weight Mismatches', path: '/admin/ops/makers/weights', icon: Scale, section: 'MAKERS' },

    { name: 'All Orders', path: '/admin/ops/orders', icon: ShoppingCart, section: 'MARKETPLACE' },
    { name: 'Disputes', path: '/admin/ops/disputes', icon: AlertCircle, section: 'MARKETPLACE' },
    { name: 'Product Review', path: '/admin/ops/listings/review', icon: Check, section: 'MARKETPLACE' },
    { name: 'Flagged Listings', path: '/admin/ops/listings/flagged', icon: Flag, section: 'MARKETPLACE' },

    { name: 'Shipping Oversight', path: '/admin/ops/shipping', icon: Truck, section: 'SHIPPING' },

    { name: 'All Payouts', path: '/admin/ops/payouts', icon: IndianRupee, section: 'FINANCIALS' },
    { name: 'TCS Reports', path: '/admin/ops/tax', icon: FileBarChart, section: 'FINANCIALS' },
    { name: 'Platform Revenue', path: '/admin/ops/revenue', icon: TrendingUp, section: 'FINANCIALS' },

    { name: 'Settings', path: '/admin/ops/settings', icon: Settings, section: 'PLATFORM' },
];

const SECTIONS = ['MAKERS', 'MARKETPLACE', 'SHIPPING', 'FINANCIALS', 'PLATFORM'];

const AdminOpsLayout: React.FC<AdminOpsLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [systemStats, setSystemStats] = React.useState({ modules: NAV_ITEMS.length, alerts: 0, errors: 0 });
    const [liveAlerts, setLiveAlerts] = React.useState<any[]>([]);

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        fetchSystemHealth();
    }, []);

    const fetchSystemHealth = async () => {
        try {
            const [shippingAlerts, disputes] = await Promise.all([
                api.getAdminShippingAlerts(),
                api.getAdminDisputes()
            ]);
            
            const openShipping = shippingAlerts.filter((a: any) => a.status !== 'resolved');
            const openDisputes = disputes.filter((d: any) => d.status !== 'resolved' && d.status !== 'closed');
            
            setLiveAlerts([...openShipping, ...openDisputes]);
            setSystemStats(prev => ({
                ...prev,
                alerts: openShipping.length + openDisputes.length
            }));
        } catch (error) {
            console.error('Failed to fetch system health:', error);
        }
    };

    // Find current page name based on path
    const activeItem = NAV_ITEMS.find(i => isActive(i.path));
    const currentPageName = activeItem?.name || 'Admin Operations';

    const unresolvedAlerts = systemStats.alerts;

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
                            <p className="text-brand-pink text-[9px] font-black uppercase tracking-[0.25em] leading-tight">Admin Ops</p>
                        </div>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/30 hover:text-white transition-colors p-1">
                        <X size={16} />
                    </button>
                </div>

                {/* ── Admin identity card ── */}
                <div className="mx-4 mb-4 rounded-sm overflow-hidden shrink-0" style={{ backgroundColor: '#171717' }}>
                    <div className="px-5 pt-8 pb-6 relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-full bg-[#3D252C] flex items-center justify-center text-[#D4547A] text-xl font-bold shrink-0 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-neutral-900/10" />
                                <span className="relative z-10">SA</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-base font-bold tracking-tight leading-none mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Super Admin</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#4A8C6F] shrink-0" />
                                    <span className="text-[9px] font-black text-[#4A8C6F] uppercase tracking-[0.2em]">System Online</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Metrics */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="flex-1 text-center">
                                <p className="text-white text-lg font-black tracking-tighter leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{systemStats.modules}</p>
                                <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mt-1.5">Modules</p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/5" />
                            <div className="flex-1 text-center">
                                <p className="text-[#F59E0B] text-lg font-black tracking-tighter leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{unresolvedAlerts}</p>
                                <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mt-1.5">Alerts</p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/5" />
                            <div className="flex-1 text-center">
                                <p className="text-white text-lg font-black tracking-tighter leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>0</p>
                                <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mt-1.5">Errors</p>
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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-bold tracking-wide transition-all group mb-4 ${active ? 'bg-brand-pink text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
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
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-bold tracking-wide transition-all group ${active
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <item.icon size={14} className={active ? 'text-brand-pink' : 'text-white/25 group-hover:text-white/60'} strokeWidth={active ? 2.5 : 2} />
                                                <span className="flex-1">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Bottom Info Card (Just Logout now) ── */}
                <div className="px-4 pb-6 shrink-0 pt-4 border-t border-white/5">
                    <button onClick={() => navigate('/')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-white/25 hover:text-red-400 text-[10px] font-bold tracking-wide transition-colors rounded-sm hover:bg-white/5">
                        <LogOut size={13} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── Topbar ── */}
                <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40">
                    <div className="flex items-center h-full gap-6">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-neutral-400 hover:text-neutral-950 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] h-full">
                            <span className="text-neutral-400 hidden md:block">Operations</span>
                            <ChevronRight size={10} className="text-neutral-300 hidden md:block" />
                            <span className="text-neutral-950 font-bold">{currentPageName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="hidden md:block text-neutral-400 text-[10px] font-bold uppercase tracking-widest">Super Admin</span>

                        <div className="flex items-center gap-4">
                            {/* Export Report */}
                            <button className="hidden md:flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-500 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-neutral-50 transition-all rounded-sm">
                                <Download size={13} /> Export Report
                            </button>

                            {/* Notifications / Alerts */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="relative cursor-pointer text-neutral-400 hover:text-neutral-950 transition-colors p-2"
                                >
                                    <Bell size={20} strokeWidth={1.75} />
                                    {unresolvedAlerts > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                                            {unresolvedAlerts}
                                        </span>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-sm shadow-2xl border border-neutral-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                            <div className="px-5 py-4 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-950">System Alerts</span>
                                                <button className="text-[9px] font-bold text-neutral-400 hover:text-brand-pink uppercase tracking-widest">Mark all read</button>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto no-scrollbar">
                                                {liveAlerts.length > 0 ? liveAlerts.map(alert => (
                                                    <div key={alert.id} className="p-5 flex gap-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors cursor-pointer">
                                                        <div className="shrink-0 mt-0.5">
                                                            <AlertCircle size={16} className={alert.severity === 'high' ? 'text-red-500' : alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-neutral-950 mb-0.5">{(alert.type || alert.category || 'Dispute').replace('-', ' ').toUpperCase()}</p>
                                                            <p className="text-[11px] font-medium text-neutral-500 leading-snug">{alert.description}</p>
                                                            <p className="text-[9px] font-black text-neutral-300 mt-2 uppercase tracking-widest">{alert.artisans?.brand_name || alert.brand_name || 'System'}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="p-12 text-center">
                                                        <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">All systems clear</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Scrollable page content ── */}
                <main className="flex-1 overflow-y-auto no-scrollbar" style={{ backgroundColor: '#FAF7F2' }}>
                    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminOpsLayout;
