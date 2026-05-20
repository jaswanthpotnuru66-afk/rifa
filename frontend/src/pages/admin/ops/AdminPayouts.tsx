import { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronDown, Loader2, CheckCircle2, Clock, PauseCircle, Send, X, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'released' | 'pending' | 'held'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy] = useState('Newest');
    const [expandedPayout, setExpandedPayout] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [notesMap, setNotesMap] = useState<Record<string, string>>({});

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

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUpdatePayout = async (id: string, status: string) => {
        setActionLoading(id + status);
        const notes = notesMap[id] || '';
        const res = await api.updateAdminPayout(id, status, notes);
        setActionLoading(null);
        if (res) {
            setPayouts(prev => prev.map(p => p.id === id ? { ...p, ...res } : p));
            showToast(`Payout ${status === 'released' ? 'released' : status === 'held' ? 'placed on hold' : 'reset to pending'} successfully.`, 'success');
            setExpandedPayout(null);
        } else {
            showToast('Failed to update payout status.', 'error');
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

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            released: 'bg-green-50 text-green-700 border-green-100',
            pending: 'bg-blue-50 text-blue-700 border-blue-100',
            held: 'bg-amber-50 text-amber-700 border-amber-100',
        };
        return map[status] || 'bg-neutral-50 text-neutral-400 border-neutral-100';
    };

    return (
        <AdminOpsLayout>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-sm shadow-xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8 animate-in fade-in duration-500 pb-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Financial Treasury</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Maker Payouts</h1>
                        <p className="text-sm text-neutral-400 mt-1 font-medium">Review and release artisan settlement disbursals</p>
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
                <div className="space-y-3">
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
                                <div key={payout.id} className="space-y-0">
                                    <div
                                        className={`bg-white border rounded-sm transition-all group shadow-sm cursor-pointer ${expandedPayout === payout.id ? 'border-brand-pink/40 rounded-b-none' : 'border-neutral-100 hover:border-brand-pink/30'}`}
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
                                                    <p className="text-[9px] text-neutral-400 font-medium mt-0.5">{payout.artisan_id}</p>
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
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusBadge(payout.status)}`}>
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

                                    {/* EXPANDED PANEL */}
                                    <AnimatePresence>
                                        {expandedPayout === payout.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-neutral-50 border border-t-0 border-brand-pink/40 rounded-b-sm p-6 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Payout Detail */}
                                                        <div className="md:col-span-2 space-y-4">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Settlement Detail</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="bg-white border border-neutral-100 p-4 rounded-sm">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-1">Gross Revenue</p>
                                                                    <p className="text-lg font-bold text-neutral-950 font-inter">₹{Number(payout.gross_amount).toLocaleString()}</p>
                                                                </div>
                                                                <div className="bg-white border border-neutral-100 p-4 rounded-sm">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-1">Platform Commission</p>
                                                                    <p className="text-lg font-bold text-red-500 font-inter">−₹{Number(payout.commission_amount).toLocaleString()}</p>
                                                                </div>
                                                                <div className="bg-white border border-neutral-100 p-4 rounded-sm">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-1">TCS Deducted</p>
                                                                    <p className="text-lg font-bold text-red-400 font-inter">−₹{Number(payout.tcs_amount).toLocaleString()}</p>
                                                                </div>
                                                                <div className="bg-brand-pink/5 border border-brand-pink/20 p-4 rounded-sm">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink/60 mb-1">Net Settlement</p>
                                                                    <p className="text-lg font-black text-brand-pink font-inter">₹{Number(payout.net_amount).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            {payout.released_at && (
                                                                <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">
                                                                    Released on: {new Date(payout.released_at).toLocaleString()}
                                                                </p>
                                                            )}
                                                            {payout.admin_notes && (
                                                                <div className="flex items-start gap-2 bg-white border border-neutral-100 p-4 rounded-sm">
                                                                    <FileText size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                                                                    <p className="text-xs text-neutral-600 font-medium">{payout.admin_notes}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Panel */}
                                                        <div className="space-y-4">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Admin Actions</p>
                                                            <textarea
                                                                placeholder="Optional release note or hold reason..."
                                                                value={notesMap[payout.id] || ''}
                                                                onChange={e => setNotesMap(prev => ({ ...prev, [payout.id]: e.target.value }))}
                                                                className="w-full bg-white border border-neutral-200 rounded-sm p-3 text-xs text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:border-brand-pink resize-none min-h-[80px] transition-all"
                                                            />
                                                            <div className="space-y-2">
                                                                {payout.status !== 'released' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdatePayout(payout.id, 'released'); }}
                                                                        disabled={actionLoading === payout.id + 'released'}
                                                                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all disabled:opacity-50"
                                                                    >
                                                                        {actionLoading === payout.id + 'released' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                                        Release to Artisan
                                                                    </button>
                                                                )}
                                                                {payout.status !== 'held' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdatePayout(payout.id, 'held'); }}
                                                                        disabled={actionLoading === payout.id + 'held'}
                                                                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all disabled:opacity-50"
                                                                    >
                                                                        {actionLoading === payout.id + 'held' ? <Loader2 size={14} className="animate-spin" /> : <PauseCircle size={14} />}
                                                                        Place on Hold
                                                                    </button>
                                                                )}
                                                                {payout.status !== 'pending' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdatePayout(payout.id, 'pending'); }}
                                                                        disabled={actionLoading === payout.id + 'pending'}
                                                                        className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-200 text-neutral-600 text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-neutral-400 transition-all disabled:opacity-50"
                                                                    >
                                                                        {actionLoading === payout.id + 'pending' ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                                                        Reset to Pending
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
