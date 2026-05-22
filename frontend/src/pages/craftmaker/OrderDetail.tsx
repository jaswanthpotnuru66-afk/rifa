import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, MapPin, Package, 
    Clock, Check,
    Download, Send, Camera,
    Truck, Info,
    X, ClipboardList, Upload, AlertTriangle, Plus, Loader2
} from 'lucide-react';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';
import { maskContactInfo } from '../../lib/security';

const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messageInput, setMessageInput] = useState('');
    const [isRequestingPickup, setIsRequestingPickup] = useState(false);

    useEffect(() => {
        if (id) loadDetail();
    }, [id]);

    const loadDetail = async () => {
        setIsLoading(true);
        try {
            const res = await api.getArtisanOrderDetail(id!);
            setData(res);
        } catch (err) {
            console.error('Error loading order detail:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <CraftMakerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin text-brand-pink" size={32} />
                </div>
            </CraftMakerLayout>
        );
    }

    if (!data) {
        return <CraftMakerLayout><div className="text-center py-40">Order not found.</div></CraftMakerLayout>;
    }

    const { order, items } = data;
    const shipping = order.shipping_address || {};

    const handleUpdateOrder = async (updated: any) => {
        try {
            const res = await api.updateOrder(order.id, updated);
            if (res) {
                setData((prev: any) => ({
                    ...prev,
                    order: { ...prev.order, ...res }
                }));
            }
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    const handleAcceptOrder = async () => {
        setIsLoading(true);
        try {
            const res = await api.acceptArtisanOrder(order.id);
            setData((prev: any) => ({ ...prev, order: { ...prev.order, ...res } }));
        } catch (err) {
            console.error(err);
            alert('Failed to accept order.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectOrder = async () => {
        const reason = window.prompt('Provide a reason for rejection (e.g. out of capacity, cannot fulfill):');
        if (!reason) return;
        
        setIsLoading(true);
        try {
            const res = await api.rejectArtisanOrder(order.id, reason);
            setData((prev: any) => ({ ...prev, order: { ...prev.order, ...res } }));
        } catch (err) {
            console.error(err);
            alert('Failed to reject order.');
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { label: 'Confirmed', status: 'confirmed' },
        { label: 'Proof Sent', status: 'proof-sent' },
        { label: 'Production', status: 'in-production' },
        { label: 'Shipped', status: 'shipped' },
        { label: 'Delivered', status: 'delivered' }
    ];

    const currentStepIdx = steps.findIndex(s => s.status === order.status) !== -1 
        ? steps.findIndex(s => s.status === order.status) 
        : order.status === 'awaiting-proof' ? 0 : 4;

    return (
        <CraftMakerLayout title={`Order #${order.id}`}>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Top Nav */}
                <Link to="/craftmaker/orders" className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-950 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <ArrowLeft size={14} /> Back to All Orders
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* LEFT COLUMN */}
                    <div className="flex-1 space-y-8">
                        
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Order #{order.id.split('-')[0]}</h1>
                                <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest mt-1 font-inter">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                    order.status === 'cancelled' ? 'bg-neutral-50 text-neutral-400 border-neutral-100' :
                                    'bg-brand-pink/10 text-brand-pink border-brand-pink/20'
                                }`}>
                                    {order.status.replace('-', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Artisan Action Card (Accept/Reject) */}
                        {order.status === 'confirmed' && (
                            <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-sm p-6 space-y-4">
                                <div className="flex items-center gap-3 text-brand-pink">
                                    <AlertTriangle size={18} />
                                    <h3 className="text-sm font-black uppercase tracking-widest">New Order Action Required</h3>
                                </div>
                                <p className="text-sm text-neutral-700 font-medium">
                                    You have received a new order! Please review the details and confirm if you can fulfill it.
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <button 
                                        onClick={handleAcceptOrder}
                                        className="flex-1 py-3 bg-brand-pink text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-pink/90 transition-all flex justify-center items-center gap-2"
                                    >
                                        <Check size={14} /> Accept & Start Production
                                    </button>
                                    <button 
                                        onClick={handleRejectOrder}
                                        className="flex-1 py-3 bg-white text-red-500 border border-red-200 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all flex justify-center items-center gap-2"
                                    >
                                        <X size={14} /> Reject Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Status Stepper */}
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
                                    animate={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                    className="absolute top-5 left-0 h-0.5 bg-brand-pink -translate-y-1/2 z-10" 
                                />
                            </div>
                        </div>

                        {/* Order Items */}
                        <Card title="Order Items">
                            <div className="space-y-4">
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-6 p-4 hover:bg-neutral-50 transition-all rounded-sm group">
                                        <img loading="lazy" src={item.image_url} alt="" className="w-20 h-20 rounded-sm object-cover border border-neutral-100 group-hover:scale-105 transition-transform" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-serif font-bold text-neutral-950 mb-1">{item.product_name}</h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                                    Quantity: <span className="text-neutral-600">{item.quantity}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total</div>
                                            <div className="text-xl font-bold text-neutral-950 font-inter">₹{(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Custom Specifications Detail */}
                        {order.isCustom && order.specs && (
                            <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <ClipboardList size={18} className="text-neutral-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Buyer Specifications</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    {order.specs && Object.entries(order.specs as any).map(([key, value]: [string, any]) => (
                                        <div key={key} className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{key}</p>
                                            <p className="text-sm font-bold text-neutral-950">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex gap-4 mt-6">
                                    <Info className="text-amber-600 shrink-0" size={18} />
                                    <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed tracking-tight">Review these specs and any reference files carefully before sending your digital proof.</p>
                                </div>
                                <button className="inline-flex items-center gap-3 px-6 py-3 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-950 hover:border-neutral-950 transition-all bg-white rounded-sm">
                                    <Download size={14} /> Download Reference Files
                                </button>
                            </div>
                        )}

                        {/* Proof Section */}
                        {(order.isCustom || true) && order.status !== 'in-production' && order.status !== 'shipped' && order.status !== 'delivered' && (
                            <Card title="Digital Proof Workflow">
                                <ProofWorkflow order={order} onUpdateOrder={handleUpdateOrder} />
                            </Card>
                        )}

                        {/* Production & Shipping */}
                        {(order.status === 'in-production' || order.status === 'shipped' || order.status === 'delivered') && (
                            <Card title="Production & Logistics">
                                <div className="space-y-8">
                                    {order.status === 'in-production' ? (
                                        <div className="text-center p-10 bg-neutral-50 border border-dashed border-neutral-200 rounded-sm">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-brand-pink">
                                                <Package size={24} />
                                            </div>
                                            <h4 className="text-sm font-bold text-neutral-950 mb-2">Item is in Production</h4>
                                            <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-8 uppercase tracking-widest font-medium">Once finished, pack carefully and request a pickup from your studio.</p>
                                            <button 
                                                onClick={() => setIsRequestingPickup(true)}
                                                className="px-8 py-4 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl"
                                            >
                                                Request Courier Pickup
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-6 border border-neutral-100 rounded-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><Truck size={24} /></div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Shiprocket Tracking</h4>
                                                        <p className="text-sm font-bold text-neutral-950 mt-1">{order.courierName || 'Delhivery'} — {order.awbNumber || 'SR983659281'}</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-full">{order.trackingStatus || 'Pickup Scheduled'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button className="flex items-center justify-center gap-3 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-all rounded-sm">
                                                    Download Invoice
                                                </button>
                                                <button className="flex items-center justify-center gap-3 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-all rounded-sm">
                                                    Download Label
                                                </button>
                                            </div>
                                            {order.status === 'shipped' && (
                                                <button 
                                                    onClick={() => handleUpdateOrder({ 
                                                        status: 'delivered', 
                                                        trackingStatus: 'Delivered' 
                                                    })}
                                                    className="w-full flex items-center justify-center gap-2 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all rounded-sm shadow-md"
                                                >
                                                    <Check size={14} strokeWidth={3} /> Mark as Delivered
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Progress Feed */}
                                    <div className="pt-8 border-t border-neutral-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Creation Timeline</h4>
                                            <button className="text-[9px] font-black uppercase tracking-widest text-brand-pink hover:underline">+ Share Progress Update</button>
                                        </div>
                                        <div className="space-y-4">
                                            {order.progressUpdates && order.progressUpdates.length > 0 ? order.progressUpdates.map((update: any) => (
                                                <div key={update.id} className="flex gap-4 p-4 bg-neutral-50 rounded-sm">
                                                    {update.photoUrl && <div className="w-12 h-12 bg-neutral-200 rounded-sm overflow-hidden flex-shrink-0" />}
                                                    <div>
                                                        <p className="text-xs font-medium text-neutral-700 leading-relaxed italic">"{update.caption}"</p>
                                                        <p className="text-[8px] font-bold text-neutral-400 uppercase mt-1">{update.timestamp}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-[10px] text-neutral-300 uppercase tracking-widest text-center py-4">No progress updates shared yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Messaging Section */}
                        <Card title="Secure Messaging">
                            <div className="space-y-6">
                                <div className="p-3 bg-amber-50 border-b border-amber-100 flex items-center gap-3 -mx-8 -mt-4 mb-4">
                                    <AlertTriangle size={14} className="text-amber-600" />
                                    <p className="text-[9px] text-amber-800 font-bold uppercase tracking-widest">Maintain all communication on-platform to stay eligible for protection.</p>
                                </div>

                                <div className="min-h-[300px] max-h-[400px] overflow-y-auto space-y-4 px-2 no-scrollbar">
                                    {order.messages && order.messages.map((msg: any) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'maker' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-sm shadow-sm ${
                                                msg.sender === 'maker' ? 'bg-brand-pink text-white' : 'bg-neutral-100 text-neutral-950'
                                            }`}>
                                                <p className="text-sm font-medium leading-relaxed">{maskContactInfo(msg.text)}</p>
                                                <div className={`flex items-center gap-2 mt-2 text-[8px] font-black uppercase tracking-widest ${
                                                    msg.sender === 'maker' ? 'text-white/60' : 'text-neutral-400'
                                                }`}>
                                                    {msg.timestamp}
                                                    {msg.sender === 'maker' && (
                                                        <span className="flex gap-0.5">{msg.read ? '✓✓' : '✓'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-end gap-4 pt-6 border-t border-neutral-100">
                                    <div className="flex-1 relative">
                                        <textarea 
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-medium transition-all resize-none min-h-[60px]"
                                            placeholder="Type your message..."
                                        />
                                        <div className="absolute right-4 bottom-4 flex gap-3 text-neutral-300">
                                            <Camera size={18} className="cursor-pointer hover:text-neutral-950" />
                                            <Plus size={18} className="cursor-pointer hover:text-neutral-950" />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (messageInput.trim()) {
                                                const maskedMessage = maskContactInfo(messageInput);
                                                // In a real app, this would be sent to the API
                                                console.log('Sending message:', maskedMessage);
                                                setMessageInput('');
                                            }
                                        }}
                                        className="w-14 h-14 bg-neutral-950 text-white rounded-sm flex items-center justify-center hover:bg-brand-pink transition-all"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-full lg:w-[380px] shrink-0 space-y-6">
                        
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8 border-b border-neutral-50 pb-4">Financial Summary</h3>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <img loading="lazy" src={item.image_url} alt="" className="w-12 h-12 rounded-sm object-cover grayscale" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-950 truncate">{item.product_name}</p>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5 tracking-tight">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-xs font-bold text-neutral-950 font-inter">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Details if any */}
                                {(() => {
                                    const coupon = shipping?.coupon_details;
                                    if (!coupon) return null;
                                    return (
                                        <div className="p-3 bg-brand-pink/5 border border-brand-pink/20 rounded-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink mb-0.5">Promo Applied</p>
                                                    <p className="text-xs font-black text-neutral-950">{coupon.code}</p>
                                                    {coupon.artisan_id && (
                                                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-1">⚠ Artisan-Sponsored — deducted from your payout</p>
                                                    )}
                                                    {!coupon.artisan_id && (
                                                        <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest mt-1">✓ Platform-Subsidized — your payout unaffected</p>
                                                    )}
                                                </div>
                                                <span className="text-sm font-black text-brand-pink font-inter">-₹{coupon.discount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="space-y-4 pt-6 border-t border-neutral-50">
                                    {(() => {
                                        const itemsTotal = items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
                                        const couponDiscount = shipping?.coupon_details?.artisan_id ? (shipping.coupon_details.discount || 0) : 0;
                                        const afterDiscount = itemsTotal - couponDiscount;
                                        // Use 10% as default to match platform_settings.json, but surface it clearly
                                        const commissionPct = 10;
                                        const commissionAmt = Math.round(afterDiscount * (commissionPct / 100));
                                        const tcsPct = 1;
                                        const tcsAmt = Math.round(afterDiscount * (tcsPct / 100));
                                        const net = afterDiscount - commissionAmt - tcsAmt;
                                        return (
                                            <>
                                                <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-inter">
                                                    <span>Shipping Collected</span>
                                                    <span>₹0</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-widest font-inter">
                                                    <span className="flex items-center gap-2">Platform Fee ({commissionPct}%) <Info size={12} /></span>
                                                    <span>-₹{commissionAmt.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold text-red-300 uppercase tracking-widest font-inter">
                                                    <span>TCS (1%)</span>
                                                    <span>-₹{tcsAmt.toLocaleString()}</span>
                                                </div>
                                                <div className="pt-6 border-t border-neutral-100 flex justify-between items-baseline font-inter">
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-950">Est. Net Payout</span>
                                                    <span className="text-2xl font-bold text-brand-pink">₹{net.toLocaleString()}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Buyer Location */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Delivery Destination</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 shrink-0"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-950 leading-tight">{shipping.full_name}</p>
                                        <p className="text-xs text-neutral-500 mt-1">{shipping.address_line1}, {shipping.address_line2}</p>
                                        <p className="text-sm font-bold text-neutral-950 mt-1">{shipping.city}, {shipping.state}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-neutral-50 rounded-sm flex items-center justify-between text-[10px] font-black uppercase tracking-widest font-inter">
                                    <span className="text-neutral-300">PIN Code</span>
                                    <span className="text-neutral-950">{shipping.pincode}</span>
                                </div>
                                <div className="p-3 bg-neutral-50 rounded-sm flex items-center justify-between text-[10px] font-black uppercase tracking-widest font-inter">
                                    <span className="text-neutral-300">Phone</span>
                                    <span className="text-neutral-950">{maskContactInfo(shipping.phone || '')}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* PICKUP MODAL */}
            <AnimatePresence>
                {isRequestingPickup && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-sm p-8 shadow-2xl space-y-8"
                        >
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-neutral-950">Confirm Pickup</h3>
                                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mt-1">Order #{order.id}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Pickup Address</p>
                                    <p className="text-xs font-bold text-neutral-950 leading-relaxed">Meera's Clay Studio, 42 Artisan Block, Pink City, Jaipur, Rajasthan 302001</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Box Weight</p>
                                        <p className="text-xs font-bold text-neutral-950">1200g</p>
                                    </div>
                                    <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Dimensions</p>
                                        <p className="text-xs font-bold text-neutral-950">20×20×15 cm</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setIsRequestingPickup(false)} 
                                    className="flex-1 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={async () => {
                                        await handleUpdateOrder({
                                            status: 'shipped',
                                            courierName: 'Delhivery',
                                            awbNumber: 'SR' + Math.floor(100000000 + Math.random() * 900000000),
                                            trackingStatus: 'Pickup Scheduled'
                                        });
                                        setIsRequestingPickup(false);
                                    }}
                                    className="flex-1 py-4 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all shadow-lg"
                                >
                                    Confirm Pickup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CraftMakerLayout>
    );
};

// COMPONENT: Proof Workflow states
const ProofWorkflow = ({ order, onUpdateOrder }: { order: any, onUpdateOrder: (updated: any) => void }) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const localInputRef = useRef<HTMLInputElement>(null);

    const proofStatus = order.proofStatus || 'none';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendProof = () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setTimeout(() => {
            onUpdateOrder({
                proofStatus: 'sent',
                proofUrl: selectedFile,
                proofSentAt: new Date().toLocaleString()
            });
            setIsUploading(false);
            setSelectedFile(null);
        }, 1000);
    };

    const handleMarkInProduction = () => {
        onUpdateOrder({
            status: 'in-production',
            proofStatus: 'approved'
        });
    };

    return (
        <div className="space-y-8">
            {proofStatus === 'none' && (
                <div className="space-y-6">
                    <input 
                        type="file" 
                        ref={localInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    {!selectedFile ? (
                        <div 
                            onClick={() => localInputRef.current?.click()}
                            className="border-2 border-dashed border-neutral-100 rounded-sm p-12 text-center group cursor-pointer hover:border-brand-pink/30 hover:bg-neutral-50/30 transition-all"
                        >
                            <Upload size={24} className="mx-auto mb-4 text-neutral-200 group-hover:text-brand-pink transition-colors" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Upload Digital Mockup</h4>
                            <p className="text-[9px] text-neutral-300 font-bold uppercase mt-2">JPEG, PNG or PDF up to 10MB</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative aspect-video bg-neutral-50 rounded-sm overflow-hidden border border-neutral-100 flex items-center justify-center">
                                <img loading="lazy" src={selectedFile} alt="Preview" className="w-full h-full object-contain" />
                                <button 
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest text-center">Ready for dispatch to buyer</p>
                        </div>
                    )}

                    <button 
                        onClick={handleSendProof}
                        disabled={!selectedFile || isUploading}
                        className={`w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                            selectedFile && !isUploading
                                ? 'bg-neutral-950 hover:bg-brand-pink shadow-lg cursor-pointer' 
                                : 'bg-neutral-950 opacity-40 cursor-not-allowed'
                        }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin animate-spin-reverse" size={14} /> Transmitting...
                            </>
                        ) : (
                            'Send Proof to Buyer'
                        )}
                    </button>
                </div>
            )}

            {proofStatus === 'sent' && (
                <div className="space-y-6">
                    <div className="relative aspect-video bg-neutral-50 rounded-sm overflow-hidden flex items-center justify-center border border-neutral-100">
                        {order.proofUrl && (
                            <img loading="lazy" src={order.proofUrl} alt="" className="w-full h-full object-contain opacity-50 grayscale" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                            <Clock size={32} className="text-amber-500 mb-4 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-950">Awaiting Response</span>
                            <span className="text-2xl font-inter font-bold text-amber-600 mt-1">23:59:59</span>
                            <span className="text-[8px] font-black uppercase text-neutral-400 mt-1">Time Remaining</span>
                        </div>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex gap-3">
                        <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed tracking-tight">You cannot begin manufacturing until the buyer approves this proof.</p>
                    </div>
                    
                    {/* Fast-Track Simulation for testing */}
                    <div className="pt-4 border-t border-dashed border-neutral-100 flex gap-3">
                        <button 
                            onClick={() => onUpdateOrder({ proofStatus: 'approved', buyerResponseAt: new Date().toLocaleString() })}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-black uppercase tracking-widest rounded-sm transition-all"
                        >
                            Simulate Buyer Approval
                        </button>
                        <button 
                            onClick={() => onUpdateOrder({ proofStatus: 'revision-requested', revisionRound: 1, buyerRevisionComment: "Can we make the lettering slightly larger?" })}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest rounded-sm transition-all"
                        >
                            Simulate Revision Request
                        </button>
                    </div>
                </div>
            )}

            {proofStatus === 'approved' && (
                <div className="space-y-6">
                    <div className="p-6 bg-green-50 border border-green-200 rounded-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"><Check size={20} strokeWidth={3} /></div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-green-800">Proof Approved by Buyer</h4>
                            <p className="text-[9px] text-green-600 font-bold uppercase mt-0.5">Approval Timestamp: {order.buyerResponseAt || new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    {order.proofUrl && (
                        <div className="aspect-video bg-white rounded-sm overflow-hidden border border-neutral-100">
                            <img loading="lazy" src={order.proofUrl} alt="" className="w-full h-full object-contain" />
                        </div>
                    )}
                    <button 
                        onClick={handleMarkInProduction}
                        className="w-full py-5 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-all"
                    >
                        Mark as In Production
                    </button>
                </div>
            )}

            {proofStatus === 'revision-requested' && (
                <div className="space-y-6">
                    <div className="p-6 bg-red-50 border border-red-200 rounded-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X size={20} strokeWidth={3} /></div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-800">Revision Requested</h4>
                                <p className="text-[9px] text-red-600 font-bold uppercase mt-0.5">Round {order.revisionRound || 1} of 3</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/50 border-l-4 border-red-300 rounded-r-sm italic text-xs text-red-700 leading-relaxed">
                            "{order.buyerRevisionComment || 'Lettering should be slightly larger.'}"
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={localInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    {!selectedFile ? (
                        <button 
                            onClick={() => localInputRef.current?.click()}
                            className="w-full py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-xl"
                        >
                            Upload Revised Mockup Image
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative aspect-video bg-neutral-50 rounded-sm overflow-hidden border border-neutral-100 flex items-center justify-center">
                                <img loading="lazy" src={selectedFile} alt="Preview" className="w-full h-full object-contain" />
                                <button 
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <button 
                                onClick={handleSendProof}
                                disabled={isUploading}
                                className="w-full py-5 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={14} /> : 'Submit Revised Proof'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8 border-b border-neutral-50 pb-4">{title}</h3>
        {children}
    </div>
);

export default OrderDetail;
