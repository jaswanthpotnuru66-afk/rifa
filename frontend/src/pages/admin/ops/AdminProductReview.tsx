import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Check, X, Eye, 
    Clock, User, Search,
    Filter, Loader2,
    ShieldCheck
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminProductReview = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await api.getPendingProducts();
            // Ensure data is an array to avoid .filter errors
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error('Expected array for pending products, got:', data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch pending products:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setIsActionLoading(true);
        try {
            const res = await api.approveProduct(id);
            if (res.success) {
                setProducts(products.filter(p => p.id !== id));
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Failed to approve product:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setIsActionLoading(true);
        try {
            const res = await api.rejectProduct(id);
            if (res.success) {
                setProducts(products.filter(p => p.id !== id));
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Failed to reject product:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.artisans?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminOpsLayout title="Inventory Governance — Product Reviews">
            <div className="space-y-8">
                
                {/* Statistics Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-neutral-100 p-8 rounded-sm shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink transition-all duration-500 group-hover:w-2" />
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Pending Review</p>
                                <h3 className="text-4xl font-serif font-bold text-neutral-950">{products.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for other stats */}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-6 border-b border-neutral-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search products or artisans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:border-neutral-950 hover:text-neutral-950 transition-all">
                            <Filter size={14} /> Sort: Newest
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="animate-spin text-brand-pink" size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Synchronizing Vault...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 bg-neutral-50 border border-neutral-100 rounded-sm border-dashed">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-neutral-200 shadow-sm">
                            <ShieldCheck size={40} strokeWidth={1} />
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-neutral-950 mb-2">Inventory Clean</h4>
                            <p className="text-sm text-neutral-400 font-medium uppercase tracking-tight">No new listings requiring review at this time.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <motion.div 
                                key={product.id}
                                layoutId={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="group cursor-pointer bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                            >
                                <div className="aspect-[4/5] bg-neutral-50 relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-100">
                                            <Package size={64} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-brand-pink text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Review Required</span>
                                    </div>
                                    <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-950 shadow-2xl scale-50 group-hover:scale-100 transition-transform">
                                            <Eye size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink">{product.category}</span>
                                        <span className="text-[10px] font-bold text-neutral-950 italic">₹{product.price.toLocaleString()}</span>
                                    </div>
                                    <h3 className="font-serif text-lg text-neutral-950 group-hover:italic transition-all truncate">{product.name}</h3>
                                    <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center gap-3">
                                        {product.artisans?.img ? (
                                            <img src={product.artisans.img} className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-300"><User size={12} /></div>
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-950 transition-colors">{product.artisans?.name || 'Unknown Maker'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inspect Slide-over */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-[110] shadow-2xl overflow-y-auto no-scrollbar"
                        >
                            <div className="p-12 space-y-12">
                                <div className="flex items-center justify-between">
                                    <button onClick={() => setSelectedProduct(null)} className="text-neutral-400 hover:text-neutral-950 transition-colors">
                                        <X size={24} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Listing Integrity Audit</span>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="aspect-[4/5] bg-neutral-50 overflow-hidden rounded-sm border border-neutral-100">
                                        {selectedProduct.images?.[0] && <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="space-y-8">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">{selectedProduct.category}</span>
                                            <h2 className="text-4xl font-serif font-bold text-neutral-950 mt-2 leading-tight">{selectedProduct.name}</h2>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-bold text-neutral-950">₹{selectedProduct.price.toLocaleString()}</span>
                                            {selectedProduct.original_price && <span className="text-lg text-neutral-300 line-through italic font-light">₹{selectedProduct.original_price.toLocaleString()}</span>}
                                        </div>
                                        <div className="space-y-4 pt-6 border-t border-neutral-100">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-neutral-400">Artisan</span>
                                                <span className="text-neutral-950">{selectedProduct.artisans?.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-neutral-400">Customisable</span>
                                                <span className={selectedProduct.is_custom ? 'text-green-600' : 'text-neutral-400'}>{selectedProduct.is_custom ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-neutral-400">Natural Materials</span>
                                                <span className={selectedProduct.is_natural ? 'text-teal-600' : 'text-neutral-400'}>{selectedProduct.is_natural ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-950 border-b border-neutral-100 pb-4">Artisanal Narrative</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-light">{selectedProduct.description}</p>
                                </div>

                                {/* Actions Bar */}
                                <div className="pt-12 border-t border-neutral-100 grid grid-cols-2 gap-6">
                                    <button 
                                        onClick={() => handleReject(selectedProduct.id)}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-center gap-3 py-5 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50"
                                    >
                                        <X size={16} /> Reject Listing
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(selectedProduct.id)}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-center gap-3 py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Approve to Gallery</>}
                                    </button>
                                </div>

                                {/* Security Notice */}
                                <div className="p-6 bg-neutral-50 rounded-sm flex gap-4 items-center">
                                    <ShieldCheck className="text-neutral-300" size={24} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Governance Policy</p>
                                        <p className="text-[9px] text-neutral-400 font-bold uppercase mt-1">Approval makes the listing visible to all buyers and increments the artisan inventory counter.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AdminOpsLayout>
    );
};

export default AdminProductReview;
