import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import {
    LayoutDashboard, Users, UserPlus, Scale,
    ShoppingCart, AlertCircle, Flag,
    Truck, IndianRupee, FileBarChart, TrendingUp,
    Settings, Bell, LogOut, Menu, ChevronRight,
    X, Download
} from 'lucide-react';
import { mockShippingAlerts } from '../lib/adminOps.mock';

interface AdminOpsLayoutProps { children: React.ReactNode; title?: string; }

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/admin/ops/dashboard', icon: LayoutDashboard, section: null },

    { name: 'All Makers', path: '/admin/ops/makers', icon: Users, section: 'MAKERS' },
    { name: 'Applications', path: '/admin/ops/makers/applications', icon: UserPlus, section: 'MAKERS' },
    { name: 'Weight Mismatches', path: '/admin/ops/makers/weights', icon: Scale, section: 'MAKERS' },

    { name: 'All Orders', path: '/admin/ops/orders', icon: ShoppingCart, section: 'MARKETPLACE' },
    { name: 'Disputes', path: '/admin/ops/disputes', icon: AlertCircle, section: 'MARKETPLACE' },
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

    const isActive = (path: string) => location.pathname === path;

    // Find current page name based on path
    const activeItem = NAV_ITEMS.find(i => isActive(i.path));
    const currentPageName = activeItem?.name || 'Admin Operations';

    const unresolvedAlerts = mockShippingAlerts.filter(a => !a.resolvedAt).length;

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
                    <div className="relative h-16 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] to-transparent" />
                    </div>
                    <div className="px-4 pt-0 pb-4 -mt-6 relative z-10">
                        <div className="flex items-end gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-brand-pink/20 flex items-center justify-center text-brand-pink text-sm font-black shrink-0 shadow-lg">
                                SA
                            </div>
                            <div className="min-w-0 pb-1">
                                <p className="text-white text-xs font-bold truncate leading-tight">Super Admin</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                                    <span className="text-[8px] font-black text-green-400 uppercase tracking-[0.15em]">System Online</span>
                                </div>
                            </div>
                        </div>
                        {/* Mini stats */}
                        <div className="grid grid-cols-3 gap-1 mt-3">
                            <div className="text-center">
                                <p className="text-white text-sm font-black tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>14</p>
                                <p className="text-white/30 text-[8px] font-bold uppercase tracking-wide mt-0.5">Modules</p>
                            </div>
                            <div className="text-center border-x border-white/5">
                                <p className="text-amber-400 text-sm font-black tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{unresolvedAlerts}</p>
                                <p className="text-white/30 text-[8px] font-bold uppercase tracking-wide mt-0.5">Alerts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white text-sm font-black tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>0</p>
                                <p className="text-white/30 text-[8px] font-bold uppercase tracking-wide mt-0.5">Errors</p>
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
                    <div className="flex items-center gap-5">
                        <button className="lg:hidden text-neutral-500 hover:text-neutral-950 transition-colors" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {/* Title */}
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em]">
                            <span className="text-neutral-300 hidden md:block">Operations</span>
                            <ChevronRight size={12} className="text-neutral-200 hidden md:block" />
                            <span className="text-neutral-950">{currentPageName}</span>
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
                                                {mockShippingAlerts.filter(a => !a.resolvedAt).map(alert => (
                                                    <div key={alert.id} className="p-5 flex gap-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors cursor-pointer">
                                                        <div className="shrink-0 mt-0.5">
                                                            <AlertCircle size={16} className={alert.severity === 'high' ? 'text-red-500' : alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-neutral-950 mb-0.5">{alert.type.replace('-', ' ').toUpperCase()}</p>
                                                            <p className="text-[11px] font-medium text-neutral-500 leading-snug">{alert.description}</p>
                                                            <p className="text-[9px] font-black text-neutral-300 mt-2 uppercase tracking-widest">{alert.makerShopName}</p>
                                                        </div>
                                                    </div>
                                                ))}
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
