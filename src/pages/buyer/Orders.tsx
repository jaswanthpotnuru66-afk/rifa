import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Package, Clock, CheckCircle2, 
    ChevronRight, ArrowLeft, Loader2, MessageSquare,
    IndianRupee, Calendar, MapPin, Sparkles, ShoppingBag,
    Truck, CreditCard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { StoredInquiry } from './CustomOrder';

const StatusBadge = ({ status }: { status: StoredInquiry['status'] }) => {
    const configs = {
        new: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Clock size={12} /> },
        contacted: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: <MessageSquare size={12} /> },
        'in-progress': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Sparkles size={12} /> },
        completed: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', icon: <CheckCircle2 size={12} /> }
    };
    const config = configs[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${config.bg} ${config.text} ${config.border}`}>
            {config.icon} {status.replace('-', ' ')}
        </span>
    );
};

/* --- Mock Product Orders --- */
const MOCK_PRODUCT_ORDERS = [
    {
        id: 'ORD-8821',
        date: '2024-04-12T10:00:00Z',
        name: 'Heritage Jamdani Saree',
        status: 'completed',
        price: 8500,
        image: '/products/earrings.png', // Reusing available assets
        category: 'Textiles',
        type: 'product' as const
    },
    {
        id: 'ORD-7742',
        date: '2024-03-28T14:30:00Z',
        name: 'Oceanic Resin Photo Frame',
        status: 'in-progress',
        price: 899,
        image: '/products/mandala.png',
        category: 'Resin Art',
        type: 'product' as const
    }
];

type ProductOrder = typeof MOCK_PRODUCT_ORDERS[0];
type BespokeOrder = {
    id: string;
    date: string;
    name: string;
    status: StoredInquiry['status'];
    price: string | number;
    type: 'bespoke';
    data: StoredInquiry;
};

type Order = ProductOrder | BespokeOrder;

const Orders = () => {
    const [contact, setContact] = useState('');
    const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'bespoke' | 'products'>('all');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contact.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        
        try {
            const { data, error } = await supabase
                .from('inquiries')
                .select('*')
                .eq('contact', contact.trim())
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedData: StoredInquiry[] = (data || []).map(item => ({
                id: item.id,
                date: item.created_at,
                name: item.name,
                contact: item.contact,
                occasion: item.occasion,
                artForms: item.art_forms || [],
                budget: item.budget,
                description: item.description,
                address: item.address,
                neededBy: item.needed_by,
                fileName: item.file_name,
                status: item.status,
                confirmedPrice: item.confirmed_price,
                finalDeliveryDate: item.final_delivery_date,
                finalNotes: item.final_notes,
                paymentStatus: item.payment_status,
                shippingInfo: item.shipping_info
            }));

            setInquiries(formattedData);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Combine and filter orders
    const allOrders: Order[] = [
        ...MOCK_PRODUCT_ORDERS.map(o => ({ ...o, type: 'product' as const })),
        ...inquiries.map(i => ({ 
            id: i.id, 
            date: i.date, 
            name: `${i.occasion} Commission`, 
            status: i.status, 
            price: i.confirmedPrice || i.budget,
            type: 'bespoke' as const,
            data: i 
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredOrders = allOrders.filter(o => {
        if (filter === 'all') return true;
        return o.type === filter;
    });

    const selectedOrder = allOrders.find(o => o.id === selectedId);

    const DetailRow = ({ label, value, icon }: { label: string; value: string | React.ReactNode; icon: React.ReactNode }) => (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
                <div className="text-sm text-neutral-950 font-medium leading-relaxed">{value}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 selection:bg-brand-pink/20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Editorial Header */}
                <header className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink">Acquisitions & Commissions</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 tracking-tighter leading-none">
                            Acquisition <br />
                            <span className="italic font-light text-neutral-400">Chronicle</span>
                        </h1>
                        <p className="text-sm font-light text-neutral-500 max-w-lg mx-auto leading-relaxed mt-6">
                            View your collection of handcrafted masterpieces and track the progress of your bespoke commissions.
                        </p>
                    </motion.div>
                </header>

                <div className="max-w-2xl mx-auto">
                    {/* Search Form */}
                    {!selectedId && (
                        <div className="space-y-8 mb-12">
                            <motion.form 
                                layout
                                onSubmit={handleSearch} 
                                className="relative group"
                            >
                                <div className="absolute inset-y-0 left-6 flex items-center text-neutral-300 group-focus-within:text-brand-pink transition-colors">
                                    <Search size={20} strokeWidth={1.5} />
                                </div>
                                <input 
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="Enter contact to sync bespoke orders"
                                    className="w-full pl-16 pr-32 py-6 bg-white border border-neutral-100 rounded-sm shadow-2xl focus:border-brand-pink outline-none text-neutral-950 font-bold transition-all placeholder:text-neutral-300 placeholder:font-light"
                                />
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Sync'}
                                </button>
                            </motion.form>

                            {/* Filter Tabs */}
                            <div className="flex gap-8 border-b border-neutral-100">
                                {(['all', 'products', 'bespoke'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${filter === f ? 'text-neutral-950' : 'text-neutral-300 hover:text-neutral-400'}`}
                                    >
                                        {f === 'all' ? 'All Pieces' : f === 'products' ? 'Acquisitions' : 'Commissions'}
                                        {filter === f && <motion.div layoutId="order-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    <AnimatePresence mode="wait">
                        {selectedId && selectedOrder ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white border border-neutral-100 shadow-2xl overflow-hidden"
                            >
                                {/* Detail Header */}
                                <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                                    <button 
                                        onClick={() => setSelectedId(null)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Back to Chronicle
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                                            {selectedOrder.type === 'bespoke' ? 'Commission' : 'Acquisition'}
                                        </span>
                                        <StatusBadge status={selectedOrder.status as StoredInquiry['status']} />
                                    </div>
                                </div>

                                <div className="p-8 md:p-12 space-y-12">
                                    {selectedOrder.type === 'bespoke' ? (
                                        /* --- Bespoke Details --- */
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="space-y-8">
                                                    <DetailRow label="Occasion" icon={<Sparkles size={16} />} value={selectedOrder.data.occasion} />
                                                    <DetailRow label="Budget Range" icon={<IndianRupee size={16} />} value={selectedOrder.data.budget} />
                                                    <DetailRow label="Commission Date" icon={<Calendar size={16} />} value={new Date(selectedOrder.data.date).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                                                </div>
                                                <div className="space-y-8">
                                                    <DetailRow label="Art Disciplines" icon={<Package size={16} />} value={selectedOrder.data.artForms.join(', ')} />
                                                    <DetailRow label="Needed By" icon={<Clock size={16} />} value={selectedOrder.data.neededBy ? new Date(selectedOrder.data.neededBy).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'ASAP'} />
                                                    <DetailRow label="Delivery Location" icon={<MapPin size={16} />} value={selectedOrder.data.address} />
                                                </div>
                                            </div>

                                            {(selectedOrder.data.confirmedPrice || selectedOrder.data.finalNotes) && (
                                                <div className="bg-brand-pink/[0.02] border border-brand-pink/10 p-8 rounded-sm space-y-8">
                                                    <div className="flex items-center gap-3 text-brand-pink">
                                                        <Sparkles size={18} />
                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Artisan Update</h3>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        {selectedOrder.data.confirmedPrice && (
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Final Agreed Price</p>
                                                                <p className="text-2xl font-serif font-bold text-neutral-950">₹{selectedOrder.data.confirmedPrice}</p>
                                                            </div>
                                                        )}
                                                        {selectedOrder.data.finalDeliveryDate && (
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Scheduled Delivery</p>
                                                                <p className="text-lg font-serif font-bold text-neutral-950">{new Date(selectedOrder.data.finalDeliveryDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {selectedOrder.data.finalNotes && (
                                                        <div className="pt-6 border-t border-brand-pink/10">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">Artisan Specifications</p>
                                                            <p className="text-sm font-light text-neutral-600 leading-relaxed italic">
                                                                "{selectedOrder.data.finalNotes}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-6 pt-8 border-t border-neutral-50">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Your Vision</h3>
                                                <p className="text-sm text-neutral-700 font-light leading-relaxed">
                                                    {selectedOrder.data.description || "No additional specifications provided."}
                                                </p>
                                                {selectedOrder.data.fileName && (
                                                    <div className="pt-4">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">Reference File</p>
                                                        <div className="w-full aspect-video bg-neutral-50 border border-neutral-100 overflow-hidden group relative">
                                                            <img src={selectedOrder.data.fileName} alt="Reference" className="w-full h-full object-contain p-8" />
                                                            <a href={selectedOrder.data.fileName} target="_blank" rel="noreferrer" className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">View Full Canvas</a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        /* --- Product Details --- */
                                        <div className="flex flex-col md:flex-row gap-12">
                                            <div className="w-full md:w-48 aspect-[3/4] bg-neutral-50 rounded overflow-hidden shadow-lg border border-neutral-100">
                                                <img src={selectedOrder.image} alt={selectedOrder.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-8">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-pink">{selectedOrder.category}</span>
                                                    <h2 className="text-3xl font-serif font-bold text-neutral-950 mt-2">{selectedOrder.name}</h2>
                                                    <p className="text-2xl font-serif font-bold text-neutral-900 mt-4">₹{selectedOrder.price}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-50">
                                                    <DetailRow label="Acquired On" icon={<Calendar size={16} />} value={new Date(selectedOrder.date).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                                                    <DetailRow label="Order Reference" icon={<Package size={16} />} value={selectedOrder.id} />
                                                    <DetailRow label="Shipping Mode" icon={<Truck size={16} />} value="Premium Courier" />
                                                    <DetailRow label="Payment Mode" icon={<CreditCard size={16} />} value="Digital Vault" />
                                                </div>

                                                <button className="w-full py-4 bg-neutral-50 text-neutral-950 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all border border-neutral-100 mt-8">
                                                    Download Authenticity Certificate
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-neutral-300 gap-4">
                                        <Loader2 size={40} className="animate-spin" strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Consulting Archives...</p>
                                    </div>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order, idx) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => setSelectedId(order.id)}
                                            className="bg-white border border-neutral-100 p-6 md:p-8 flex items-center justify-between cursor-pointer group hover:border-brand-pink/30 hover:shadow-xl transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-20 bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-colors overflow-hidden rounded shadow-sm border border-neutral-50">
                                                    {order.type === 'product' ? (
                                                        <img src={order.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={28} strokeWidth={1} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-serif font-bold text-lg text-neutral-950">{order.name}</h3>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.type === 'bespoke' ? 'bg-brand-pink/10 text-brand-pink' : 'bg-neutral-100 text-neutral-500'}`}>
                                                            {order.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 font-light italic">
                                                        {order.type === 'product' ? `₹${order.price}` : `Ref: ${order.id.slice(0, 8)}`} • {new Date(order.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="hidden sm:block text-right">
                                                    <StatusBadge status={order.status as StoredInquiry['status']} />
                                                </div>
                                                <ChevronRight size={20} className="text-neutral-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </motion.div>
                                    ))
                                ) : !hasSearched && filter === 'bespoke' ? (
                                    <div className="text-center py-20 border-2 border-dashed border-neutral-100 rounded-sm">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                            <MessageSquare size={24} strokeWidth={1.5} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Sync your contact to view bespoke commissions</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white border border-neutral-100 rounded-sm shadow-xl">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                            <ShoppingBag size={24} strokeWidth={1.5} />
                                        </div>
                                        <p className="text-neutral-950 font-bold mb-2">No Pieces Found</p>
                                        <p className="text-sm font-light text-neutral-400">Your gallery collection is waiting to be curated.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Orders;
