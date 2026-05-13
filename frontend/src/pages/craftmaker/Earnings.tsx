import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Clock, AlertCircle, ChevronDown, ChevronUp,
    Download, HelpCircle, ArrowUpRight, Banknote
} from 'lucide-react';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockPayouts } from '../../lib/craftmaker';

const DATE_TABS = ['This Month', 'Last 3 Months', 'This Year', 'Custom'];

const STATUS_LABELS: Record<string, string> = {
    paid: 'Received',
    pending: 'Pending',
    held: 'On Hold',
};

const statusPill: Record<string, string> = {
    paid: 'bg-green-50 text-green-700 border-green-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    held: 'bg-red-50 text-red-700 border-red-100',
};

const Earnings = () => {
    const [activeTab, setActiveTab] = useState('This Month');
    const [expandedPayout, setExpandedPayout] = useState<string | null>(null);
    const [showShippingInfo, setShowShippingInfo] = useState(false);

    const kpis = [
        { label: 'Total Earned', value: '₹1,24,580', icon: Banknote, color: 'text-neutral-950', accent: false },
        { label: 'This Month', value: '₹18,340', icon: TrendingUp, color: 'text-neutral-950', accent: false, trend: '+12%' },
        { label: 'Pending', value: '₹6,200', icon: Clock, color: 'text-amber-600', accent: false },
        { label: 'On Hold', value: '₹1,128', icon: AlertCircle, color: 'text-red-600', accent: true },
    ];

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Financial Overview</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Earnings & Payouts</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Track revenue, commissions, and payout cycles.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-sm">
                        <Download size={14} /> Export Statement
                    </button>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {kpis.map((kpi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className={`relative bg-white border rounded-sm p-6 shadow-sm group overflow-hidden hover:shadow-md transition-all ${kpi.accent ? 'border-red-200' : 'border-neutral-100 hover:border-brand-pink/20'}`}
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${kpi.accent ? 'bg-red-50 text-red-500' : 'bg-neutral-50 text-neutral-400 group-hover:bg-brand-pink/5 group-hover:text-brand-pink'} transition-all`}>
                                    <kpi.icon size={20} />
                                </div>
                                {kpi.trend && (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <ArrowUpRight size={10} /> {kpi.trend}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{kpi.label}</p>
                            <p className={`text-2xl font-inter font-bold mt-1 tracking-tight ${kpi.color}`}>{kpi.value}</p>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-brand-pink transition-all duration-500" />
                        </motion.div>
                    ))}
                </div>

                {/* ── Date Filter ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar pb-px">
                        {DATE_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'}`}
                            >
                                {tab}
                                {activeTab === tab && <motion.div layoutId="earningTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                            </button>
                        ))}
                    </div>
                    <div className="relative shrink-0">
                        <button onClick={() => setShowShippingInfo(!showShippingInfo)} className="flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                            <HelpCircle size={14} className="text-brand-pink" /> Shipping Adjustments
                        </button>
                        <AnimatePresence>
                            {showShippingInfo && (
                                <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-0 mt-3 w-80 bg-amber-50 border border-amber-200 rounded-sm p-5 shadow-xl z-20">
                                    <p className="text-[11px] text-amber-900 leading-relaxed">
                                        If your actual parcel weight exceeds declared weight by more than <strong>10%</strong>, the overage is auto-deducted from your payout.
                                        <br /><br />
                                        <em className="font-bold">Example: Declared ₹85 → Billed ₹220 → Adjustment: −₹135</em>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {activeTab === 'Custom' && (
                    <div className="flex gap-5 p-6 bg-white border border-neutral-100 rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        {['From Date', 'To Date'].map(label => (
                            <div key={label} className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{label}</label>
                                <input type="date" className="block bg-neutral-50 border border-neutral-100 px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-pink" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Payout history ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Payout History</h2>
                        <span className="text-[10px] font-black text-neutral-400">{mockPayouts.length} payouts</span>
                    </div>

                    {mockPayouts.length > 0 ? (
                        mockPayouts.map(payout => (
                            <div key={payout.id} className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm hover:border-brand-pink/20 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5">
                                    <div className="flex items-center justify-between md:hidden pb-4 border-b border-neutral-50 mb-2">
                                        <p className="text-sm font-black text-neutral-900">{payout.id}</p>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusPill[payout.status] || 'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
                                            {STATUS_LABELS[payout.status] || payout.status}
                                        </span>
                                    </div>
                                    <div className="hidden md:block min-w-[80px]">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Payout ID</p>
                                        <p className="text-xs font-black text-neutral-900">{payout.id}</p>
                                    </div>
                                    <div className="flex justify-between md:block min-w-[90px]">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">Date</p>
                                        <div>
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Date</p>
                                            <p className="text-xs font-medium text-neutral-500 text-right md:text-left">{payout.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between md:block min-w-[60px]">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">Orders</p>
                                        <div>
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Orders</p>
                                            <p className="text-xs font-black text-neutral-900 text-right md:text-left">{payout.orderCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between md:block min-w-[80px]">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">Gross</p>
                                        <div>
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Gross</p>
                                            <p className="text-xs font-bold text-neutral-950 text-right md:text-left font-inter">₹{payout.grossAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between md:block min-w-[80px]">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">Commission</p>
                                        <div>
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Commission</p>
                                            <p className="text-xs font-bold text-red-500 text-right md:text-left font-inter">−₹{payout.commission}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between md:block min-w-[60px]">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">TCS</p>
                                        <div>
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">TCS</p>
                                            <p className="text-xs font-bold text-red-500 text-right md:text-left font-inter">−₹{payout.tcs}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between md:block min-w-[80px]">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">Ship Adj.</p>
                                        <div>
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Ship Adj.</p>
                                            <p className={`text-xs font-bold text-right md:text-left font-inter ${payout.shippingAdj < 0 ? 'text-red-500' : 'text-neutral-300'}`}>
                                                {payout.shippingAdj < 0 ? `−₹${Math.abs(payout.shippingAdj)}` : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center md:block min-w-[90px] pt-4 md:pt-0 border-t border-neutral-50 md:border-0 mt-2 md:mt-0">
                                        <p className="md:hidden text-[10px] font-black uppercase text-neutral-400">Net Received</p>
                                        <div className="text-right md:text-left">
                                            <p className="hidden md:block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">Net Received</p>
                                            <p className="text-lg md:text-base font-inter font-black text-neutral-950">₹{payout.netPaid.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-neutral-50">
                                        <span className={`hidden md:inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusPill[payout.status] || 'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
                                            {STATUS_LABELS[payout.status] || payout.status}
                                        </span>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 md:p-2 border md:border-transparent rounded-sm text-neutral-600 md:text-neutral-300 hover:text-brand-pink transition-colors text-xs font-bold uppercase tracking-widest md:normal-case md:font-normal md:tracking-normal" onClick={() => console.log('Downloading...')}>
                                                <span className="md:hidden">Download</span>
                                                <Download size={14} />
                                            </button>
                                            <button onClick={() => setExpandedPayout(expandedPayout === payout.id ? null : payout.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 md:p-2 bg-neutral-50 md:bg-transparent rounded-sm text-neutral-600 md:text-neutral-300 hover:text-neutral-950 transition-colors text-xs font-bold uppercase tracking-widest md:normal-case md:font-normal md:tracking-normal">
                                                <span className="md:hidden">Details</span>
                                                {expandedPayout === payout.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedPayout === payout.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="bg-neutral-50 border-t border-neutral-100 px-4 md:px-8 py-6">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">Order Breakdown</p>
                                                {payout.orders.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <div className="hidden md:grid grid-cols-5 text-[9px] font-black uppercase tracking-widest text-neutral-300 pb-2 border-b border-neutral-100">
                                                            <span>Order ID</span><span>Amount</span><span>Commission</span><span>TCS</span><span className="text-right">Net</span>
                                                        </div>
                                                        {payout.orders.map(o => (
                                                            <div key={o.id} className="flex flex-col md:grid md:grid-cols-5 py-3 border-b border-neutral-100 last:border-0 text-xs gap-1 md:gap-0">
                                                                <div className="flex justify-between md:block"><span className="md:hidden text-[10px] text-neutral-400">Order ID</span><span className="font-black text-neutral-900">{o.id}</span></div>
                                                                <div className="flex justify-between md:block"><span className="md:hidden text-[10px] text-neutral-400">Amount</span><span className="font-bold text-neutral-950 font-inter">₹{o.amount.toLocaleString()}</span></div>
                                                                <div className="flex justify-between md:block"><span className="md:hidden text-[10px] text-neutral-400">Commission</span><span className="font-bold text-red-500 font-inter">−₹{o.commission}</span></div>
                                                                <div className="flex justify-between md:block"><span className="md:hidden text-[10px] text-neutral-400">TCS</span><span className="font-bold text-red-400 font-inter">−₹{o.tcs}</span></div>
                                                                <div className="flex justify-between md:block pt-2 border-t border-neutral-200/50 md:pt-0 md:border-0 mt-1 md:mt-0"><span className="md:hidden text-[10px] font-black text-neutral-900">Net</span><span className="font-black text-brand-pink md:text-neutral-950 text-right font-inter">₹{(o.amount - o.commission - o.tcs).toLocaleString()}</span></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-neutral-400 italic">Detailed breakdown not available for this payout.</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 px-6 flex flex-col items-center text-center bg-white border border-dashed border-neutral-200 rounded-sm">
                            <img src="https://illustrations.popsy.co/amber/taking-notes.svg" alt="Empty Earnings" className="w-48 h-48 opacity-80 mb-4" />
                            <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No earnings yet</h3>
                            <p className="text-neutral-500 text-sm max-w-sm">Once you complete your first delivery, your payouts will be generated and tracked here.</p>
                        </div>
                    )}
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Earnings;
