import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Package, 
    Check, Truck, ChevronDown, ShieldCheck,
    ShoppingBag, User, Store, Loader2
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAdminOrder(id!);
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <AdminOpsLayout>
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 size={40} className="text-brand-pink animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Retrieving Transaction Record...</p>
            </div>
        </AdminOpsLayout>
    );

    if (!order) return (
        <AdminOpsLayout>
            <div className="text-center py-40">Order not found.</div>
        </AdminOpsLayout>
    );

    const steps = [
        { label: 'Confirmed', status: 'confirmed' },
        { label: 'Processing', status: 'processing' },
        { label: 'Shipped', status: 'shipped' },
        { label: 'Delivered', status: 'delivered' }
    ];

    const currentStepIdx = steps.findIndex(s => s.status === order.status);

    const DetailBox = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{label}</p>
            <p className="text-sm font-bold text-neutral-900">{value}</p>
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-700 pb-24">
                
                {/* Top Nav */}
                <Link to="/admin/ops/orders" className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-950 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <ArrowLeft size={14} /> Back to All Orders
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* LEFT COLUMN (65%) */}
                    <div className="lg:w-[65%] space-y-10">
                        
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Order #{order.id.slice(0, 8)}</h1>
                                <p className="text-neutral-500 text-sm font-light mt-1">
                                    Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {order.shipping_address?.full_name || 'Buyer'} · {order.shipping_address?.city || 'India'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                    order.status === 'disputed' ? 'bg-red-50 text-red-700 border-red-100' :
                                    order.status === 'cancelled' ? 'bg-neutral-50 text-neutral-500 border-neutral-100' :
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {order.status?.replace('-', ' ') || 'New'}
                                </span>
                            </div>
                        </div>

                        {/* Status Stepper */}
                        {order.status !== 'cancelled' && order.status !== 'disputed' && (
                            <div className="bg-white border border-neutral-100 rounded-sm p-10 shadow-sm relative overflow-hidden">
                                <div className="flex items-center justify-between relative z-10">
                                    {steps.map((step, idx) => (
                                        <div key={step.status} className="flex flex-col items-center gap-4 relative z-20">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                idx <= currentStepIdx ? 'bg-brand-pink text-white shadow-lg scale-110' : 'bg-neutral-100 text-neutral-300'
                                            }`}>
                                                {idx < currentStepIdx ? <Check size={18} strokeWidth={3} /> : idx + 1}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${
                                                idx <= currentStepIdx ? 'text-neutral-950' : 'text-neutral-300'
                                            }`}>{step.label}</span>
                                        </div>
                                    ))}
                                    {/* Progress Line */}
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-100 -translate-y-1/2 z-0" />
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(0, (currentStepIdx / (steps.length - 1)) * 100)}%` }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                        className="absolute top-5 left-0 h-0.5 bg-brand-pink -translate-y-1/2 z-10" 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Order Parties */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-neutral-100 rounded-sm p-6 space-y-4">
                                <div className="flex items-center gap-3 border-b border-neutral-50 pb-3 mb-4">
                                    <User size={16} className="text-brand-pink" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Buyer Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <DetailBox label="Name" value={order.shipping_address?.full_name || 'N/A'} />
                                    <DetailBox label="City" value={order.shipping_address?.city || 'N/A'} />
                                    <DetailBox label="State" value={order.shipping_address?.state || 'N/A'} />
                                    <DetailBox label="PIN Code" value={order.shipping_address?.pincode || 'N/A'} />
                                </div>
                            </div>
                            <div className="bg-white border border-neutral-100 rounded-sm p-6 space-y-4">
                                <div className="flex items-center gap-3 border-b border-neutral-50 pb-3 mb-4">
                                    <Store size={16} className="text-brand-pink" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Maker Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <DetailBox label="Shop Name" value={<Link to={`/admin/ops/makers/${order.artisan_id}`} className="text-brand-pink hover:underline">{order.artisans?.brand_name || 'Individual'}</Link>} />
                                    <DetailBox label="Location" value={order.artisans?.location || 'India'} />
                                    <DetailBox label="Maker ID" value={order.artisan_id?.slice(0, 8) || 'N/A'} />
                                    <DetailBox label="KYC Status" value={<span className="text-green-600 font-bold flex items-center gap-1"><ShieldCheck size={12} /> Verified</span>} />
                                </div>
                            </div>
                        </div>

                        {/* Product Detail */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center gap-3 border-b border-neutral-50 pb-4 mb-6">
                                <ShoppingBag size={18} className="text-neutral-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Order Inventory</h3>
                            </div>
                            <div className="space-y-6">
                                {order.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-8 group">
                                        <div className="w-24 h-24 bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img loading="lazy" src={item.image_url} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Package size={32} strokeWidth={1} className="text-neutral-200 group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-xl font-serif font-bold text-neutral-950 tracking-tight">{item.product_name}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs font-medium text-neutral-400">Qty: {item.quantity}</span>
                                                        <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                                        <span className="text-xs font-bold text-neutral-950">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gifting Section */}
                        {order.is_gifting && (
                            <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-sm p-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package size={18} className="text-brand-pink" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Premium Gifting Service</h3>
                                </div>
                                <div className="bg-white p-6 rounded-sm border border-brand-pink/10 shadow-sm italic text-neutral-600 text-sm">
                                    \"{order.gift_message || 'No gift message provided.'}\"
                                </div>
                            </div>
                        )}

                        {/* Shipping */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Truck size={18} className="text-neutral-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Logistics & Shipping</h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Shiprocket Sync: Pending</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <DetailBox label="Courier" value="Pending" />
                                <DetailBox label="AWB Number" value="Not assigned" />
                                <DetailBox label="Payment Method" value={order.payment_method?.toUpperCase() || 'N/A'} />
                                <DetailBox label="Payment Status" value={order.payment_status?.toUpperCase() || 'N/A'} />
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (35%) */}
                    <div className="lg:w-[35%] space-y-8">
                        
                        {/* Financials */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-8">Financial Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium text-neutral-600">
                                    <span>Subtotal</span>
                                    <span>₹{(order.total_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-neutral-600">
                                    <span>Shipping</span>
                                    <span>₹0</span>
                                </div>
                                <div className="pt-4 border-t border-neutral-50 flex justify-between items-end">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Total Amount</p>
                                    <p className="text-2xl font-serif font-bold text-brand-pink">₹{(order.total_amount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-8">Admin Override</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <p className="text-[8px] font-black text-neutral-400 uppercase mb-2">Manual Status Update</p>
                                    <div className="relative group">
                                        <select className="w-full appearance-none bg-white border border-neutral-100 px-4 py-3 text-xs font-bold text-neutral-700 outline-none hover:border-brand-pink/30 transition-all">
                                            <option>Confirmed</option>
                                            <option>Processing</option>
                                            <option>Shipped</option>
                                            <option>Delivered</option>
                                            <option>Disputed</option>
                                            <option>Cancelled</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none" />
                                    </div>
                                </div>
                                <button className="w-full py-4 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-red-50 transition-all bg-white">
                                    Force Cancel Order
                                </button>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-6">Internal Tracking</h3>
                            <textarea 
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Add an internal note..."
                                className="w-full h-32 p-4 bg-white border border-neutral-100 text-sm font-medium focus:border-brand-pink outline-none transition-all placeholder:text-neutral-300 resize-none"
                            />
                        </div>

                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminOrderDetail;
