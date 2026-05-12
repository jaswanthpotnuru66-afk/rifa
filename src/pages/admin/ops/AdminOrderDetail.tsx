import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Package, 
    Clock, Check, Truck,
    AlertCircle, ChevronDown, ShieldCheck,
    ShoppingBag, User, Store, IndianRupee
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockAllOrders } from '../../../lib/adminOps.mock';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const order = mockAllOrders.find(o => o.id === id);
    const [adminNote, setAdminNote] = useState('');

    if (!order) return (
        <AdminOpsLayout>
            <div className="text-center py-40">Order not found.</div>
        </AdminOpsLayout>
    );

    const steps = [
        { label: 'Confirmed', status: 'new' },
        { label: 'Proof Sent', status: 'proof-sent' },
        { label: 'Production', status: 'in-production' },
        { label: 'Shipped', status: 'shipped' },
        { label: 'Delivered', status: 'delivered' }
    ];

    const currentStepIdx = steps.findIndex(s => s.status === order.status) !== -1 
        ? steps.findIndex(s => s.status === order.status) 
        : order.status === 'awaiting-proof' ? 0 : 
          order.status === 'disputed' || order.status === 'cancelled' ? -1 : 4;

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
                                <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Order {order.id}</h1>
                                <p className="text-neutral-500 text-sm font-light mt-1">
                                    Placed on {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {order.buyerName} · {order.buyerCity}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                    order.status === 'disputed' ? 'bg-red-50 text-red-700 border-red-100' :
                                    order.status === 'cancelled' ? 'bg-neutral-50 text-neutral-500 border-neutral-100' :
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {order.status.replace('-', ' ')}
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
                                    <DetailBox label="Name" value={order.buyerName} />
                                    <DetailBox label="City" value={order.buyerCity} />
                                    <DetailBox label="State" value="Maharashtra" />
                                    <DetailBox label="PIN Code" value={`${order.buyerPin.slice(0,3)}***`} />
                                </div>
                            </div>
                            <div className="bg-white border border-neutral-100 rounded-sm p-6 space-y-4">
                                <div className="flex items-center gap-3 border-b border-neutral-50 pb-3 mb-4">
                                    <Store size={16} className="text-brand-pink" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Maker Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <DetailBox label="Shop Name" value={<Link to={`/admin/ops/makers/${order.makerId}`} className="text-brand-pink hover:underline">{order.makerShopName}</Link>} />
                                    <DetailBox label="Origin State" value="Rajasthan" />
                                    <DetailBox label="Maker ID" value={order.makerId} />
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
                            <div className="flex items-center gap-8 group">
                                <div className="w-24 h-24 bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center overflow-hidden shrink-0">
                                    <Package size={32} strokeWidth={1} className="text-neutral-200 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-xl font-serif font-bold text-neutral-950 tracking-tight">{order.productName}</h4>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs font-medium text-neutral-400">Qty: 1</span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                                <span className="text-xs font-bold text-neutral-950">₹{order.amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {order.isCustom && (
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-black uppercase tracking-widest rounded-full">Custom Order</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Specs (if applicable) */}
                        {order.isCustom && (
                            <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-8 space-y-8">
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-neutral-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Customization Specifications</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                    <DetailBox label="Material" value="Terracotta / Clay" />
                                    <DetailBox label="Dimensions" value="12 x 12 x 18 inches" />
                                    <DetailBox label="Color Palette" value="Earth tones, Turquoise accents" />
                                    <DetailBox label="Personalization" value='"For The Vermas" engraved on base' />
                                    <DetailBox label="Finish" value="Glazed, High-gloss" />
                                    <DetailBox label="Gift Wrap" value="Premium Eco-box" />
                                </div>
                                
                                <div className="pt-8 border-t border-neutral-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">Proof History (Read-Only)</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-sm group hover:border-brand-pink/30 transition-all">
                                            <div className="w-10 h-10 rounded-sm bg-neutral-50 flex items-center justify-center text-neutral-300">
                                                <Package size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-neutral-950 uppercase tracking-widest">Initial Proof Uploaded</p>
                                                <p className="text-[11px] text-neutral-400 font-medium">12 Jun 2025 · 14:30</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-widest rounded-full">
                                                <Check size={10} /> Approved by Buyer
                                            </div>
                                        </div>
                                    </div>
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
                                {order.status === 'shipped' || order.status === 'delivered' ? (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Shiprocket Sync: Active</span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Shiprocket Sync: Pending</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <DetailBox label="Courier" value={order.courier || "Pending"} />
                                <DetailBox label="AWB Number" value={order.awb || "Not assigned"} />
                                <DetailBox label="Zone" value={order.shippingZone} />
                                <DetailBox label="Weight Status" value="In-SLA" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-neutral-50">
                                <DetailBox label="Declared (g)" value={`${order.declaredWeight || 0}g`} />
                                <DetailBox label="Billed (g)" value={`${order.billedWeight || order.declaredWeight || 0}g`} />
                                <DetailBox label="Deduction" value={order.weightAdjustment ? `₹${Math.abs(order.weightAdjustment)}` : "None"} />
                                <DetailBox label="Billed By" value="Delhivery API" />
                            </div>
                            {order.billedWeight && order.declaredWeight && order.billedWeight > order.declaredWeight && (
                                <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex gap-4">
                                    <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                    <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed tracking-tight">
                                        Weight overage: {order.billedWeight - order.declaredWeight}g detected. 
                                        ₹{Math.abs(order.weightAdjustment || 0)} will be deducted from maker's net payout.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (35%) */}
                    <div className="lg:w-[35%] space-y-8">
                        
                        {/* Financials */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-8">Financial Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium text-neutral-600">
                                    <span>Item Price</span>
                                    <span>₹{order.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-neutral-600">
                                    <span>Shipping</span>
                                    <span>₹{order.shippingCharge || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-neutral-400 italic">
                                    <span>Platform Commission (5%)</span>
                                    <span>−₹{order.commission.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-neutral-400 italic">
                                    <span>TCS (1%)</span>
                                    <span>−₹{order.tcs.toLocaleString()}</span>
                                </div>
                                {order.weightAdjustment ? (
                                    <div className="flex justify-between text-sm font-medium text-red-500 italic">
                                        <span>Weight Adjustment</span>
                                        <span>−₹{Math.abs(order.weightAdjustment)}</span>
                                    </div>
                                ) : null}
                                <div className="pt-4 border-t border-neutral-50 flex justify-between items-end">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Maker Net Payout</p>
                                    <p className="text-2xl font-serif font-bold text-brand-pink">₹{order.makerPayout.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payout Status */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-2">Payout Lifecycle</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300">
                                    <IndianRupee size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-neutral-900">Current Status: Pending</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">Scheduled for 15 Jun 2025</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-4 border-t border-neutral-50">
                                <button className="w-full py-3 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all">
                                    Hold Payout
                                </button>
                                <button className="w-full py-3 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10">
                                    Force Release
                                </button>
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
                                            <option>New (Confirmed)</option>
                                            <option>Proof Sent</option>
                                            <option>In Production</option>
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
                                {order.status === 'disputed' && (
                                    <Link to={`/admin/ops/disputes/${order.disputeId}`} className="flex items-center justify-center gap-3 w-full py-4 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-lg shadow-red-600/10">
                                        <AlertCircle size={14} /> View Dispute
                                    </Link>
                                )}
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
                            <div className="mt-6 space-y-4 border-t border-neutral-50 pt-6">
                                <div className="flex gap-4">
                                    <div className="w-1 h-1 rounded-full bg-brand-pink mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-900 leading-tight">Order confirmed by platform. Inventory reserved.</p>
                                        <p className="text-[9px] text-neutral-400 font-medium uppercase mt-1">10 Jun · System</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminOrderDetail;
