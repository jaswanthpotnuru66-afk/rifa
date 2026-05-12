import { useState, useMemo } from 'react';
import { 
    Info, Search, RotateCcw, Unlock
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockWeightMismatches } from '../../../lib/adminOps.mock';

const WeightMismatches = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'strike1' | 'strike2' | 'strike3'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = {
        totalOverages: mockWeightMismatches.length,
        totalDeducted: mockWeightMismatches.reduce((acc, curr) => acc + curr.overageShippingCost, 0),
        lockedMakers: Array.from(new Set(mockWeightMismatches.filter(w => w.makerStrikeCount >= 3).map(w => w.makerId))).length
    };

    const filteredMismatches = useMemo(() => {
        let result = [...mockWeightMismatches];
        if (activeTab === 'strike1') result = result.filter(w => w.makerStrikeCount === 1);
        if (activeTab === 'strike2') result = result.filter(w => w.makerStrikeCount === 2);
        if (activeTab === 'strike3') result = result.filter(w => w.makerStrikeCount >= 3);
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(w => 
                w.makerShopName.toLowerCase().includes(q) || 
                w.orderId.toLowerCase().includes(q)
            );
        }
        return result;
    }, [activeTab, searchQuery]);

    const StatCard = ({ label, value, subText }: { label: string; value: string | number; subText: string }) => (
        <div className="bg-white border border-neutral-100 rounded-sm p-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">{label}</p>
            <h3 className="text-3xl font-serif font-bold text-neutral-950 tracking-tight">{value}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">{subText}</p>
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Shipping Integrity</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Weight Mismatches</h1>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Total Incidents" value={stats.totalOverages} subText="All time recorded mismatches" />
                    <StatCard label="Total Deducted" value={`₹${stats.totalDeducted.toLocaleString()}`} subText="Cost recovered this month" />
                    <StatCard label="Locked Makers" value={stats.lockedMakers} subText="Require manual weight audit" />
                </div>

                {/* Explainer Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-950">Shipping Overage Policy</p>
                        <p className="text-xs text-amber-700/70 font-medium leading-relaxed mt-1">
                            When a parcel's actual billed weight exceeds the declared weight by more than 10%, 
                            the overage shipping cost is automatically deducted from the Maker's payout. 
                            Makers receive a warning strike per incident. At 3 strikes, the shop is locked for new listings.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6 border-b border-neutral-100 md:border-none">
                        {(['all', 'strike1', 'strike2', 'strike3'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-3 md:pb-0 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                                }`}
                            >
                                {tab === 'all' ? 'All' : tab.replace('strike', 'Strike ')}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink md:hidden" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80 group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Order or Shop..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-xs font-bold transition-all placeholder:text-neutral-300"
                        />
                    </div>
                </div>

                {/* Mismatches Table */}
                <div className="space-y-3">
                    <div className="hidden lg:grid grid-cols-[1fr_1.2fr_1.5fr_0.8fr_0.8fr_0.8fr_1fr_120px_100px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div>Date</div>
                        <div>Order ID</div>
                        <div>Maker Shop</div>
                        <div className="text-center">Declared</div>
                        <div className="text-center">Billed</div>
                        <div className="text-center">Overage</div>
                        <div className="text-right">Deduction</div>
                        <div className="text-center">Strike #</div>
                        <div />
                    </div>

                    {filteredMismatches.length > 0 ? filteredMismatches.map(item => {
                        const isLocked = item.makerStrikeCount >= 3;
                        return (
                            <div key={item.id} className={`bg-white border rounded-sm transition-all ${isLocked ? 'bg-red-50/30 border-red-100' : 'border-neutral-100'}`}>
                                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.2fr_1.5fr_0.8fr_0.8fr_0.8fr_1fr_120px_100px] gap-4 p-4 lg:p-6 items-center">
                                    
                                    <div className="text-xs font-medium text-neutral-500">{new Date(item.date).toLocaleDateString()}</div>
                                    
                                    <div className="text-xs font-bold text-neutral-950">{item.orderId}</div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-400">
                                            {item.makerShopName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-neutral-950 truncate">{item.makerShopName}</p>
                                        </div>
                                    </div>

                                    <div className="text-center text-xs text-neutral-600 font-medium">{item.declaredWeight}g</div>
                                    <div className="text-center text-xs text-red-600 font-bold">{item.billedWeight}g</div>
                                    <div className="text-center text-xs text-red-600 font-black">+{item.overageGrams}g</div>
                                    
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <p className="text-xs font-black text-red-600">₹{item.overageShippingCost}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {item.deducted ? (
                                                    <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Deducted</span>
                                                ) : (
                                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Pending Payout</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(s => (
                                                    <div key={s} className={`w-2.5 h-2.5 rounded-full border ${
                                                        item.makerStrikeCount >= s 
                                                            ? (item.makerStrikeCount >= 3 ? 'bg-red-500 border-red-600' : 'bg-amber-400 border-amber-500') 
                                                            : 'bg-neutral-100 border-neutral-200'
                                                    }`} />
                                                ))}
                                            </div>
                                            {isLocked && (
                                                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest mt-1.5">Locked Out</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        {isLocked ? (
                                            <button className="flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-600 text-[8px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                                                <Unlock size={12} /> Unlock
                                            </button>
                                        ) : (
                                            <button className="p-2 hover:bg-neutral-50 rounded-sm text-neutral-300 hover:text-brand-pink transition-colors">
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No mismatch incidents found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminOpsLayout>
    );
};

export default WeightMismatches;
