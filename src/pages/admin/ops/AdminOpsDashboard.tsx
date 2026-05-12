import { Link } from 'react-router-dom';
import { 
    AlertTriangle, ArrowRight, UserPlus, 
    MessageSquare, Truck, Download,
    TrendingUp
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { 
    mockPlatformStats, 
    mockAllOrders, 
    mockDisputes, 
    mockShippingAlerts,
    mockFlaggedListings
} from '../../../lib/adminOps.mock';

const StatCard = ({ title, value, sub, subColor = "text-neutral-400", alert = false }: { title: string; value: string | number; subText?: string; sub?: string; subColor?: string; alert?: boolean }) => (
    <div className={`bg-white p-8 flex flex-col justify-between transition-all hover:shadow-2xl relative group overflow-hidden border border-neutral-100 ${alert ? 'ring-1 ring-red-100' : ''}`}>
        {/* Editorial Frame Markers */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-neutral-200 group-hover:border-brand-pink transition-colors" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-neutral-200 group-hover:border-brand-pink transition-colors" />
        
        <div className="relative z-10">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-8">{title}</p>
            <h3 
                className="text-5xl font-extrabold text-neutral-950 tracking-tighter leading-none mb-4 group-hover:scale-[1.02] transition-transform origin-left"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {value}
            </h3>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
            <div className={`h-[1px] w-4 ${subColor.replace('text-', 'bg-')} opacity-30`} />
            <p 
                className={`text-[10px] font-bold uppercase tracking-widest ${subColor}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {sub}
            </p>
        </div>
    </div>
);

const AdminOpsDashboard = () => {
    const recentOrders = mockAllOrders.slice(0, 8);
    const activeDisputes = mockDisputes.filter(d => d.status === 'open' || d.status === 'under-review');
    const unresolvedShipping = mockShippingAlerts.filter(a => !a.resolvedAt).slice(0, 4);
    
    const showBanner = mockPlatformStats.openDisputes > 0 || mockPlatformStats.pendingApprovals > 0;

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-700 pb-20">
                
                {/* Section 1 — Alert Banner */}
                {showBanner && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-950">
                                    {mockPlatformStats.openDisputes} open disputes require resolution · {mockPlatformStats.pendingApprovals} maker applications awaiting approval
                                </p>
                                <p className="text-xs text-red-700/70 font-medium">Platform operations require immediate attention to maintain SLA.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link to="/admin/ops/disputes" className="flex-1 md:flex-none text-center px-8 py-3.5 bg-white border border-red-100 text-red-600 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-50 transition-all shadow-sm">
                                Open Disputes
                            </Link>
                            <Link to="/admin/ops/makers/applications" className="flex-1 md:flex-none text-center px-8 py-3.5 bg-neutral-950 text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-950/20">
                                Review Queue
                            </Link>
                        </div>
                    </div>
                )}

                {/* Section 2 — Platform Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Platform GMV (This Month)" 
                        value={`₹${mockPlatformStats.gmvThisMonth.toLocaleString()}`} 
                        sub="↑ 15% vs last month" 
                        subColor="text-green-600"
                    />
                    <StatCard 
                        title="Orders This Month" 
                        value={mockPlatformStats.ordersThisMonth} 
                        sub="↑ 8 vs last month" 
                        subColor="text-green-600"
                    />
                    <StatCard 
                        title="Active Makers" 
                        value={mockPlatformStats.activeMakers} 
                        sub={`${mockPlatformStats.pendingApprovals} applications pending`} 
                        subColor={mockPlatformStats.pendingApprovals > 0 ? "text-amber-600" : "text-neutral-400"}
                    />
                    <StatCard 
                        title="Open Disputes" 
                        value={mockPlatformStats.openDisputes} 
                        sub="Needs resolution" 
                        subColor="text-red-600"
                        alert={mockPlatformStats.openDisputes > 0}
                    />
                    <StatCard 
                        title="Commission Earned" 
                        value={`₹${mockPlatformStats.platformCommissionThisMonth.toLocaleString()}`} 
                        sub="5% of GMV this month" 
                    />
                    <StatCard 
                        title="TCS Collected" 
                        value={`₹${mockPlatformStats.tcsCollectedThisMonth.toLocaleString()}`} 
                        sub="1% — auto-submitted" 
                    />
                    <StatCard 
                        title="Active Listings" 
                        value={mockPlatformStats.activeListings} 
                        sub={`${mockFlaggedListings.length} flagged for review`} 
                        subColor={mockFlaggedListings.length > 0 ? "text-amber-600" : "text-neutral-400"}
                    />
                    <StatCard 
                        title="Avg Platform Rating" 
                        value={`${mockPlatformStats.avgPlatformRating} ★`} 
                        sub={`${mockPlatformStats.totalReviews.toLocaleString()} total reviews`} 
                    />
                </div>

                {/* Section 3 — Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/admin/ops/makers/applications" className="flex flex-col justify-between p-8 bg-white border border-neutral-100 group hover:shadow-2xl transition-all relative">
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-12 bg-brand-pink/5 flex items-center justify-center text-brand-pink rounded-sm group-hover:scale-110 transition-transform">
                                <UserPlus size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-2">Maker Review</span>
                            <span className="text-xl font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors leading-tight">Review Pending Applications</span>
                        </div>
                    </Link>
                    
                    <Link to="/admin/ops/disputes" className={`flex flex-col justify-between p-8 group hover:shadow-2xl transition-all border relative ${mockPlatformStats.openDisputes > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-neutral-100'}`}>
                        <div className="flex justify-between items-start mb-12">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform ${mockPlatformStats.openDisputes > 0 ? 'bg-red-100 text-red-600' : 'bg-neutral-50 text-neutral-400'}`}>
                                <MessageSquare size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className={`${mockPlatformStats.openDisputes > 0 ? 'text-red-300' : 'text-neutral-200'} group-hover:translate-x-1 transition-all`} />
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-2">Resolutions</span>
                            <span className={`text-xl font-serif font-bold transition-colors leading-tight ${mockPlatformStats.openDisputes > 0 ? 'text-red-700' : 'text-neutral-950 group-hover:text-brand-pink'}`}>
                                {mockPlatformStats.openDisputes} Active Disputes
                            </span>
                        </div>
                    </Link>

                    <Link to="/admin/ops/shipping" className="flex flex-col justify-between p-8 bg-white border border-neutral-100 group hover:shadow-2xl transition-all relative">
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-12 bg-neutral-50 text-neutral-400 flex items-center justify-center rounded-sm group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all group-hover:scale-110">
                                <Truck size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-2">Logistics Control</span>
                            <span className="text-xl font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors leading-tight">8 Shipping Alerts</span>
                        </div>
                    </Link>

                    <Link to="/admin/ops/tax" className="flex flex-col justify-between p-8 bg-white border border-neutral-100 group hover:shadow-2xl transition-all relative">
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-12 bg-neutral-50 text-neutral-400 flex items-center justify-center rounded-sm group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all group-hover:scale-110">
                                <Download size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={16} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-2">Compliance</span>
                            <span className="text-xl font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors leading-tight">Export TCS Records</span>
                        </div>
                    </Link>
                </div>

                {/* Section 4 — Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-end justify-between px-1">
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-pink">Settlements</p>
                                <h2 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight">Recent Activity</h2>
                            </div>
                            <Link to="/admin/ops/orders" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-brand-pink transition-colors border-b border-neutral-100 pb-1">View Archives →</Link>
                        </div>
                        <div className="bg-white border border-neutral-100 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-[100px_1fr_1fr_100px_110px] gap-4 px-8 py-5 border-b border-neutral-50 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300">
                                <div>Log ID</div>
                                <div>Origin</div>
                                <div>Recipient</div>
                                <div className="text-right">Value</div>
                                <div className="text-center">State</div>
                            </div>
                            <div className="divide-y divide-neutral-50">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="grid grid-cols-[100px_1fr_1fr_100px_110px] gap-4 px-8 py-6 items-center hover:bg-neutral-50 transition-all cursor-pointer group">
                                        <div className="text-xs font-bold text-neutral-900">{order.id}</div>
                                        <div className="text-xs text-neutral-500 font-light truncate">{order.makerShopName}</div>
                                        <div className="text-xs text-neutral-400 font-light truncate">{order.buyerName}</div>
                                        <div 
                                            className="text-xs font-bold text-neutral-950 text-right tracking-tight"
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                        >
                                            ₹{order.amount.toLocaleString()}
                                        </div>
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border ${
                                                order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                                order.status === 'disputed' ? 'bg-red-50 text-red-700 border-red-100' :
                                                order.status === 'shipped' ? 'bg-neutral-50 text-neutral-400 border-neutral-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Disputes */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-end justify-between px-1">
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-red-500">Critical Resolution</p>
                                <h2 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight">Dispute Queue</h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {activeDisputes.length > 0 ? activeDisputes.map(dispute => (
                                <div key={dispute.id} className={`p-8 border bg-white flex flex-col justify-between h-56 transition-all hover:shadow-2xl relative group ${dispute.status === 'open' ? 'border-red-100' : 'border-neutral-100'}`}>
                                    {/* Small Accent Pill */}
                                    <div className={`absolute top-0 right-0 w-12 h-[2px] ${dispute.status === 'open' ? 'bg-red-500' : 'bg-brand-pink'}`} />
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-300">{dispute.id}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 ${dispute.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-neutral-50 text-neutral-400'}`}>
                                                {dispute.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-serif font-bold text-neutral-900 leading-tight mb-2">{dispute.productName}</h4>
                                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">{dispute.category.replace('-', ' ')}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-50">
                                        <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">{dispute.dateRaised.split('T')[0]}</span>
                                        <Link to={`/admin/ops/disputes/${dispute.id}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink hover:text-neutral-950 transition-colors">
                                            Execute Resolve →
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-56 border border-dashed border-neutral-200 rounded-sm flex flex-col items-center justify-center text-center p-8 bg-white">
                                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.5em]">System status: Stable</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 5 — Shipping Alerts */}
                <div className="space-y-8">
                    <div className="flex items-end justify-between px-1">
                        <div className="space-y-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-pink">Operations</p>
                            <h2 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight">Logistics Oversight</h2>
                        </div>
                        <Link to="/admin/ops/shipping" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-brand-pink transition-colors border-b border-neutral-100 pb-1">Full Shipping Logs →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {unresolvedShipping.map(alert => (
                            <div key={alert.id} className="bg-white border border-neutral-100 p-8 flex items-start justify-between group hover:shadow-2xl transition-all relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-neutral-50 group-hover:bg-brand-pink transition-colors" />
                                <div className="flex gap-6">
                                    <div className={`w-1.5 h-12 shrink-0 ${alert.severity === 'high' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : alert.severity === 'medium' ? 'bg-brand-pink shadow-[0_0_15px_rgba(212,84,122,0.2)]' : 'bg-neutral-200'}`} />
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="px-3 py-1 bg-neutral-950 text-white text-[7px] font-black uppercase tracking-[0.3em]">{alert.type}</span>
                                            <span className="text-[10px] font-black text-neutral-900 tracking-widest font-inter">{alert.orderId}</span>
                                        </div>
                                        <p className="text-sm font-light text-neutral-500 leading-relaxed mb-6 italic">"{alert.description}"</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-[1px] bg-brand-pink/30" />
                                            <p className="text-[10px] font-black text-neutral-950 uppercase tracking-[0.2em]">{alert.makerShopName}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/admin/ops/shipping" className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-300 group-hover:text-brand-pink transition-colors underline decoration-neutral-100 group-hover:decoration-brand-pink/30 underline-offset-8">Review</Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 6 — Revenue Chart Placeholder */}
                <div className="space-y-8 pb-12">
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-pink">Analytics</p>
                        <h2 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight">Platform Revenue Engine</h2>
                    </div>
                    <div className="bg-white border border-neutral-100 p-16 h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        {/* High-Fashion Frame Markers for Chart */}
                        <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-neutral-100 group-hover:border-brand-pink/30 transition-colors" />
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-neutral-100 group-hover:border-brand-pink/30 transition-colors" />
                        
                        {/* Faux Chart visualization */}
                        <div className="absolute inset-x-24 bottom-32 top-32 flex items-end justify-between gap-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                            {[40, 65, 45, 80, 95, 70, 85, 60, 75, 90, 55, 80].map((h, i) => (
                                <div key={i} className="flex-1 bg-neutral-950 transition-all duration-1000 group-hover:bg-brand-pink" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-[#FAF7F2] flex items-center justify-center mx-auto mb-10 border border-neutral-100 shadow-sm group-hover:scale-110 transition-transform">
                                <TrendingUp size={32} strokeWidth={1} className="text-brand-pink" />
                            </div>
                            <h3 className="text-3xl font-serif italic text-neutral-950 mb-4 font-light">Projected Growth Analysis</h3>
                            <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.6em] mb-8">Neural Platform Forecasting</p>
                            <div className="h-[1px] w-24 bg-brand-pink/20 mx-auto mb-8" />
                            <p className="text-xs text-neutral-400 font-light max-w-sm mx-auto italic leading-relaxed">Integration of the Rifa Settlement Engine is currently processing live transaction nodes. Visual data representation pending deployment.</p>
                        </div>
                        
                        <div className="absolute bottom-12 inset-x-24 flex justify-between text-[8px] font-black text-neutral-200 uppercase tracking-[0.4em] border-t border-neutral-50 pt-10 font-inter">
                            <span>Q1 FY25</span>
                            <span>Q2 FY25</span>
                            <span>Q3 FY25</span>
                            <span>Q4 FY25</span>
                        </div>
                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminOpsDashboard;
