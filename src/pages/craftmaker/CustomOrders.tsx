import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, ArrowRight,
    ChevronDown, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockOrders, type ProofStatus } from '../../lib/craftmaker';

const CustomOrders = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');

    // Filter and Sort logic
    const filteredOrders = useMemo(() => {
        let result = mockOrders.filter(o => o.isCustom);

        // Search
        if (searchQuery) {
            result = result.filter(o => 
                o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.buyerCity.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'Newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'Oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === 'Amount: High to Low') return b.amount - a.amount;
            return 0;
        });

        return result;
    }, [searchQuery, sortBy]);

    const getProofStatusBadge = (status?: ProofStatus) => {
        switch (status) {
            case 'none': return 'bg-neutral-50 text-neutral-400 border-neutral-100';
            case 'sent': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'approved': return 'bg-green-50 text-green-700 border-green-100';
            case 'revision-requested': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-neutral-50 text-neutral-300 border-neutral-50';
        }
    };

    return (
        <CraftMakerLayout title="Custom Orders">
            <div className="space-y-8 animate-in fade-in duration-700">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Bespoke Portal</h1>
                        <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest mt-1">Manage unique commissions and digital proofs</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                    <div className="relative w-full md:w-96 group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search Order ID or City..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-sm font-medium transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full md:w-64 appearance-none px-6 py-3 bg-white border border-neutral-100 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 outline-none transition-all cursor-pointer pr-12 shadow-sm"
                            >
                                <option>Newest</option>
                                <option>Oldest</option>
                                <option>Amount: High to Low</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="space-y-2">
                    {/* Header */}
                    <div className="hidden md:flex items-center gap-4 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div className="w-32">Order ID</div>
                        <div className="w-32">Date</div>
                        <div className="w-48">Buyer</div>
                        <div className="flex-1">Product</div>
                        <div className="w-32 text-center">Proof Status</div>
                        <div className="w-24 text-right">Amount</div>
                        <div className="w-32 text-center">Order Status</div>
                        <div className="w-10 text-right" />
                    </div>

                    {/* Rows */}
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white border border-neutral-100 rounded-sm transition-all hover:border-brand-pink/30 hover:shadow-md"
                                >
                                    <div className="w-32">
                                        <span className="text-sm font-bold text-neutral-950 group-hover:text-brand-pink transition-colors">#{order.id}</span>
                                    </div>

                                    <div className="w-32">
                                        <span className="text-xs font-medium text-neutral-500">{order.date}</span>
                                    </div>

                                    <div className="w-48">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                                                {order.buyerName.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-neutral-950">{order.buyerName}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <img src={order.productThumbnail} alt="" className="w-8 h-8 rounded-sm object-cover border border-neutral-100" />
                                            <span className="text-sm font-medium text-neutral-950 truncate">{order.productName}</span>
                                        </div>
                                    </div>

                                    <div className="w-32 flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getProofStatusBadge(order.proofStatus)}`}>
                                            {order.proofStatus ? order.proofStatus.replace('-', ' ') : 'none'}
                                        </span>
                                    </div>

                                    <div className="w-24 text-right">
                                        <span className="text-sm font-bold text-neutral-950">₹{order.amount.toLocaleString()}</span>
                                    </div>

                                    <div className="w-32 flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-neutral-100 bg-neutral-50 text-neutral-500`}>
                                            {order.status.replace('-', ' ')}
                                        </span>
                                    </div>

                                    <div className="w-10 text-right">
                                        <Link to={`/craftmaker/orders/${order.id}`} className="p-2 text-neutral-300 hover:text-brand-pink transition-colors block">
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            /* Empty State */
                            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-sm bg-white/50">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300 mb-6">
                                    <ClipboardList size={24} strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No custom orders</h3>
                                <p className="text-neutral-400 text-sm max-w-xs text-center font-medium uppercase tracking-widest">You haven't received any bespoke commissions yet</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </CraftMakerLayout>
    );
};

export default CustomOrders;
