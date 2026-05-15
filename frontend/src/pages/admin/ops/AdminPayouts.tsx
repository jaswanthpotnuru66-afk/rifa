import { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronDown, Loader2
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'released' | 'pending' | 'held'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy] = useState('Newest');
    const [expandedPayout, setExpandedPayout] = useState<string | null>(null);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAdminPayouts();
            setPayouts(data);
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        disbursed: payouts.filter(p => p.status === 'released').reduce((acc, curr) => acc + Number(curr.net_amount), 0),
        pending: payouts.filter(p => p.status === 'pending').reduce((acc, curr) => acc + Number(curr.net_amount), 0),
        held: payouts.filter(p => p.status === 'held').reduce((acc, curr) => acc + Number(curr.net_amount), 0),
        avgProcessing: "3.2 days"
    };

    const filteredPayouts = useMemo(() => {
        let result = [...payouts];
        if (activeTab !== 'all') {
            result = result.filter(p => p.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.id.toLowerCase().includes(q) ||
                (p.artisans?.brand_name || '').toLowerCase().includes(q)
            );
        }

        if (sortBy === 'Newest') result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        if (sortBy === 'Amount High to Low') result.sort((a, b) => Number(b.net_amount) - Number(a.net_amount));

        return result;
    }, [activeTab, searchQuery, sortBy, payouts]);

    const StatCard = ({ label, value, isRed }: { label: string; value: string; isRed?: boolean }) => (
        <div className={`p-6 rounded-sm border ${isRed && value !== '₹0' ? 'bg-red-50 border-red-100' : 'bg-white border-neutral-100'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">{label}</p>
            <p className={`text-2xl font-inter font-bold ${isRed && value !== '₹0' ? 'text-red-600' : 'text-neutral-950'}`}>{value}</p>
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
                                className={`relative pb-0.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
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
                    </div>
                </div>

                {/* Table */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 size={40} className="text-brand-pink animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Synchronizing Ledger...</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="hidden lg:grid grid-cols-[100px_1fr_100px_100px_100px_100px_120px_100px_40px] gap-4 px-6 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 items-center border border-transparent">
                                <div>ID</div>
                                <div>Maker</div>
                                <div>Date</div>
                                <div className="lg:flex lg:justify-end w-full">Gross</div>
                                <div className="lg:flex lg:justify-end w-full">Comm.</div>
                                <div className="lg:flex lg:justify-end w-full">TCS</div>
                                <div className="lg:flex lg:justify-end w-full">Net Paid</div>
                                <div className="lg:flex lg:justify-center w-full">Status</div>
                                <div></div>
                            </div>

                            {filteredPayouts.length > 0 ? filteredPayouts.map(payout => (
                                <div key={payout.id} className="space-y-1">
                                    <div 
                                        className={`bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all group shadow-sm cursor-pointer ${expandedPayout === payout.id ? 'border-brand-pink/30 ring-1 ring-brand-pink/10' : ''}`}
                                        onClick={() => setExpandedPayout(expandedPayout === payout.id ? null : payout.id)}
                                    >
                                        <div className="flex flex-col lg:grid lg:grid-cols-[100px_1fr_100px_100px_100px_100px_120px_100px_40px] gap-4 p-4 lg:p-6 items-center">

                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">ID</span>
                                                <div className="text-[10px] font-black text-neutral-400 font-inter">{payout.id.slice(0, 8)}</div>
                                            </div>
                                            
                                            <div className="flex justify-between lg:block w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Maker</span>
                                                <div className="text-right lg:text-left">
                                                    <p className="text-xs font-bold text-neutral-900">{payout.artisans?.brand_name || 'Individual'}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between lg:flex w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Date</span>
                                                <div className="text-[10px] font-medium text-neutral-500 font-inter">{payout.created_at ? new Date(payout.created_at).toLocaleDateString() : '—'}</div>
                                            </div>

                                            <div className="flex justify-between lg:flex lg:justify-end w-full">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Gross</span>
                                                <div className="text-xs font-bold text-neutral-950 font-inter">₹{Number(payout.gross_amount).toLocaleString()}</div>
                                            </div>
                                            
                                            <div className="flex justify-between lg:flex lg:justify-end w-full">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Comm.</span>
                                                <div className="text-xs font-medium text-neutral-400 italic font-inter">−₹{Number(payout.commission_amount).toLocaleString()}</div>
                                            </div>
                                            
                                            <div className="flex justify-between lg:flex lg:justify-end w-full">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">TCS</span>
                                                <div className="text-xs font-medium text-neutral-400 italic font-inter">−₹{Number(payout.tcs_amount).toLocaleString()}</div>
                                            </div>

                                            <div className="flex justify-between lg:flex lg:justify-end pt-3 lg:pt-0 border-t lg:border-0 border-neutral-50 mt-2 lg:mt-0 w-full">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Net Paid</span>
                                                <div className="text-sm font-black text-brand-pink font-inter">₹{Number(payout.net_amount).toLocaleString()}</div>
                                            </div>

                                            <div className="flex justify-between lg:block items-center w-full lg:w-auto">
                                                <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-neutral-400">Status</span>
                                                <div className="lg:text-center">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                        payout.status === 'released' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        payout.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                        {payout.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="hidden lg:flex justify-center">
                                                <div className={`p-2 transition-transform duration-300 ${expandedPayout === payout.id ? 'rotate-180' : ''}`}>
                                                    <ChevronDown size={14} className="text-neutral-300 group-hover:text-neutral-900" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">No financial settlements recorded</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default AdminPayouts;
