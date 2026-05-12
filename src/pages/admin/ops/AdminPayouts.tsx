import { useState, useMemo } from 'react';
import { 
    Search, ChevronDown,
    CheckCircle2, Download,
    Ban, Info, LayoutList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockAllPayouts, mockAllOrders } from '../../../lib/adminOps.mock';

const AdminPayouts = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'released' | 'pending' | 'held'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');
    const [expandedPayout, setExpandedPayout] = useState<string | null>(null);

    const stats = {
        disbursed: mockAllPayouts.filter(p => p.status === 'released').reduce((acc, curr) => acc + curr.netPaid, 0),
        pending: mockAllPayouts.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.netPaid, 0),
        held: mockAllPayouts.filter(p => p.status === 'held').reduce((acc, curr) => acc + curr.netPaid, 0),
        avgProcessing: "3.2 days"
    };

    const filteredPayouts = useMemo(() => {
        let result = [...mockAllPayouts];
        if (activeTab !== 'all') {
            result = result.filter(p => p.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.id.toLowerCase().includes(q) || 
                p.makerShopName.toLowerCase().includes(q)
            );
        }
        
        if (sortBy === 'Newest') result.sort((a, b) => b.date.localeCompare(a.date));
        if (sortBy === 'Amount High to Low') result.sort((a, b) => b.netPaid - a.netPaid);
        if (sortBy === 'Held first') result.sort((a, b) => (a.status === 'held' ? -1 : 1) - (b.status === 'held' ? -1 : 1));
        
        return result;
    }, [activeTab, searchQuery, sortBy]);

    const StatCard = ({ label, value, isRed }: { label: string; value: string; isRed?: boolean }) => (
        <div className={`p-6 rounded-sm border ${isRed && value !== '₹0' ? 'bg-red-50 border-red-100' : 'bg-white border-neutral-100'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">{label}</p>
            <p className={`text-2xl font-serif font-bold ${isRed && value !== '₹0' ? 'text-red-600' : 'text-neutral-950'}`}>{value}</p>
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Financial Treasury</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Maker Payouts</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-all">
                            Release All Pending
                        </button>
                        <button className="px-6 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10">
                            Hold All Pending
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Disbursed This Month" value={`₹${stats.disbursed.toLocaleString()}`} />
                    <StatCard label="Pending Release" value={`₹${stats.pending.toLocaleString()}`} />
                    <StatCard label="Currently On Hold" value={`₹${stats.held.toLocaleString()}`} isRed />
                    <StatCard label="Avg Processing Time" value={stats.avgProcessing} />
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {(['all', 'released', 'pending', 'held'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-0.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-brand-pink" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-64 group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Maker..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-xs font-bold transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-white border border-neutral-100 rounded-sm text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-brand-pink/30 transition-all"
                        >
                            <option>Newest</option>
                            <option>Amount High to Low</option>
                            <option>Held first</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="space-y-4">
                    {/* Header */}
                    <div className="hidden lg:grid grid-cols-[100px_1fr_100px_80px_100px_100px_100px_100px_120px_100px_120px_40px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div>ID</div>
                        <div>Maker</div>
                        <div>Date</div>
                        <div className="text-center">Orders</div>
                        <div className="text-right">Gross</div>
                        <div className="text-right">Comm.</div>
                        <div className="text-right">TCS</div>
                        <div className="text-right">Shipping</div>
                        <div className="text-right">Net Paid</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Actions</div>
                        <div />
                    </div>

                    {filteredPayouts.map(payout => (
                        <div key={payout.id} className="space-y-1">
                            <div className={`bg-white border transition-all shadow-sm ${
                                payout.status === 'held' ? 'bg-amber-50 border-amber-200' : 'border-neutral-100'
                            }`}>
                                <div className="flex flex-col lg:grid lg:grid-cols-[100px_1fr_100px_80px_100px_100px_100px_100px_120px_100px_120px_40px] gap-4 p-4 lg:p-6 items-center">
                                    
                                    <div className="text-[10px] font-black text-neutral-400">{payout.id}</div>
                                    
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">{payout.makerShopName}</p>
                                        <Link to={`/admin/ops/makers/${payout.makerId}`} className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-brand-pink">View Profile</Link>
                                    </div>

                                    <div className="text-[10px] font-medium text-neutral-500">{new Date(payout.date).toLocaleDateString()}</div>

                                    <div className="text-center text-xs font-bold text-neutral-600">{payout.orderCount}</div>

                                    <div className="text-right text-xs font-medium text-neutral-500">₹{payout.grossAmount.toLocaleString()}</div>
                                    
                                    <div className="text-right text-xs font-medium text-neutral-400 italic">−₹{payout.commission.toLocaleString()}</div>
                                    
                                    <div className="text-right text-xs font-medium text-neutral-400 italic">−₹{payout.tcs.toLocaleString()}</div>
                                    
                                    <div className="text-right text-xs font-black text-red-600">
                                        {payout.shippingAdj < 0 ? `−₹${Math.abs(payout.shippingAdj)}` : '—'}
                                    </div>

                                    <div className="text-right text-sm font-black text-neutral-950">₹{payout.netPaid.toLocaleString()}</div>

                                    <div className="flex justify-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            payout.status === 'released' ? 'bg-green-50 text-green-700 border-green-100' :
                                            payout.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {payout.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        {payout.status === 'pending' && (
                                            <>
                                                <button className="p-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-sm transition-all">
                                                    <CheckCircle2 size={14} />
                                                </button>
                                                <button className="p-2 border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-sm transition-all">
                                                    <Ban size={14} />
                                                </button>
                                            </>
                                        )}
                                        {payout.status === 'held' && (
                                            <>
                                                <button className="px-3 py-1 bg-green-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-green-700 transition-all">
                                                    Release
                                                </button>
                                                <button title="View Held Reason" className="p-2 text-neutral-400 hover:text-neutral-950">
                                                    <Info size={14} />
                                                </button>
                                            </>
                                        )}
                                        {payout.status === 'released' && (
                                            <button className="p-2 text-neutral-300 hover:text-brand-pink transition-colors" title="Download Receipt">
                                                <Download size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => setExpandedPayout(expandedPayout === payout.id ? null : payout.id)}
                                        className={`p-2 transition-transform duration-300 ${expandedPayout === payout.id ? 'rotate-180' : ''}`}
                                    >
                                        <ChevronDown size={14} className="text-neutral-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Orders */}
                            {expandedPayout === payout.id && (
                                <div className="bg-neutral-50 border border-neutral-100 border-t-0 p-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <LayoutList size={12} className="text-neutral-400" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Payout Composition ({payout.orderCount} Orders)</p>
                                    </div>
                                    <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-neutral-100 text-[8px] font-black uppercase tracking-widest text-neutral-400">
                                                    <th className="px-4 py-3">Order ID</th>
                                                    <th className="px-4 py-3">Product</th>
                                                    <th className="px-4 py-3">Buyer City</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                    <th className="px-4 py-3 text-right">Comm.</th>
                                                    <th className="px-4 py-3 text-right">TCS</th>
                                                    <th className="px-4 py-3 text-right">Shipping Adj</th>
                                                    <th className="px-4 py-3 text-right">Net</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {mockAllOrders.slice(0, 3).map(order => (
                                                    <tr key={order.id} className="text-[10px] font-medium text-neutral-600">
                                                        <td className="px-4 py-3 font-bold text-brand-pink">{order.id}</td>
                                                        <td className="px-4 py-3 truncate max-w-[150px]">{order.productName}</td>
                                                        <td className="px-4 py-3">{order.buyerCity}</td>
                                                        <td className="px-4 py-3 text-right">₹{order.amount.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right italic text-neutral-400">−₹{order.commission.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right italic text-neutral-400">−₹{order.tcs.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right text-red-500">{order.weightAdjustment ? `−₹${Math.abs(order.weightAdjustment)}` : '—'}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-neutral-900">₹{order.makerPayout.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default AdminPayouts;
