import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, MapPin,
    ShieldCheck, ShieldAlert,
    Pause, Play, Lock, 
    CreditCard, ExternalLink, Package,
    Clock, Ban
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockAllMakers, mockWeightMismatches, mockAllOrders } from '../../../lib/adminOps.mock';

const MakerDetail = () => {
    const { id } = useParams();
    const maker = mockAllMakers.find(m => m.id === id);
    const weightIncidents = mockWeightMismatches.filter(w => w.makerId === id);
    const recentOrders = mockAllOrders.filter(o => o.makerId === id).slice(0, 5);

    const [adminNote, setAdminNote] = useState('');

    if (!maker) return (
        <AdminOpsLayout>
            <div className="text-center py-24">
                <p className="text-neutral-400">Maker not found.</p>
                <Link to="/admin/ops/makers" className="text-brand-pink underline mt-4 inline-block">Back to Makers</Link>
            </div>
        </AdminOpsLayout>
    );

    const DetailBox = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => (
        <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
            <p className="text-sm font-bold text-neutral-900">{value}</p>
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/admin/ops/makers" className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-neutral-950">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">{maker.shopName}</h1>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                maker.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                                maker.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {maker.status}
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm font-light mt-1 flex items-center gap-2">
                            {maker.shopSlug} · Joined {new Date(maker.joinedDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* LEFT COLUMN (60%) */}
                    <div className="lg:col-span-3 space-y-8">
                        
                        {/* SHOP OVERVIEW */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                <DetailBox label="Origin State" value={<div className="flex items-center gap-1.5"><MapPin size={12} className="text-brand-pink" /> {maker.originState}</div>} />
                                <DetailBox label="Total Listings" value={maker.totalListings} />
                                <DetailBox label="Active Orders" value={maker.totalOrders} />
                                <DetailBox label="Total Revenue" value={`₹${maker.totalRevenue.toLocaleString()}`} />
                            </div>
                            <div className="pt-8 border-t border-neutral-50">
                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-3">Craft Categories</p>
                                <div className="flex flex-wrap gap-2">
                                    {maker.craftCategories.map(cat => (
                                        <span key={cat} className="px-3 py-1 bg-neutral-50 text-[10px] font-bold text-neutral-600 border border-neutral-100">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* KYC & COMPLIANCE */}
                        <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">KYC & Compliance</h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest ${maker.kycVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {maker.kycVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    {maker.kycVerified ? '✓ Verified' : '⚠ Unverified'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                <DetailBox label="PAN Number" value="ABCDE****F" />
                                <DetailBox label="Bank Last 4" value="**** 4321" />
                                <DetailBox label="IFSC Code" value="SBIN0001234" />
                                <DetailBox label="Aadhaar" value="****-****-1234" />
                                <DetailBox label="GSTIN" value={maker.gstin || <span className="text-amber-600 font-bold">Not provided</span>} />
                                <DetailBox label="Business Type" value="Individual / Artisan" />
                            </div>
                        </div>

                        {/* WEIGHT MISMATCH STRIKES */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">Weight Mismatch Strikes</h3>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                                        maker.weightMismatchStrikes === 0 ? 'bg-green-500' :
                                        maker.weightMismatchStrikes === 1 ? 'bg-brand-pink' :
                                        maker.weightMismatchStrikes === 2 ? 'bg-orange-500' : 'bg-red-600 animate-pulse'
                                    }`}>
                                        {maker.weightMismatchStrikes}
                                    </span>
                                </div>
                                {maker.weightMismatchStrikes > 0 && (
                                    <button className="text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline">Reset Strikes</button>
                                )}
                            </div>
                            
                            {weightIncidents.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-neutral-50 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-left">
                                                <th className="pb-4 font-black">Date</th>
                                                <th className="pb-4 font-black">Order ID</th>
                                                <th className="pb-4 font-black text-center">Declared</th>
                                                <th className="pb-4 font-black text-center">Billed</th>
                                                <th className="pb-4 font-black text-right">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50">
                                            {weightIncidents.map(inc => (
                                                <tr key={inc.id} className="text-xs">
                                                    <td className="py-4 font-medium text-neutral-500">{new Date(inc.date).toLocaleDateString()}</td>
                                                    <td className="py-4 font-bold text-neutral-950">{inc.orderId}</td>
                                                    <td className="py-4 text-center text-neutral-600">{inc.declaredWeight}g</td>
                                                    <td className="py-4 text-center text-red-600 font-bold">{inc.billedWeight}g</td>
                                                    <td className="py-4 text-right text-red-600 font-black">₹{inc.overageShippingCost}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-400 font-light italic">No shipping weight discrepancies recorded.</p>
                            )}
                        </div>

                        {/* RECENT ORDERS */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">Recent Orders</h3>
                                <Link to={`/admin/ops/orders?makerId=${maker.id}`} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border border-neutral-50 hover:border-neutral-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-neutral-50 rounded-sm flex items-center justify-center text-neutral-400">
                                                <Package size={20} strokeWidth={1} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-neutral-950">{order.id}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-xs font-black text-neutral-950">₹{order.amount.toLocaleString()}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                                order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {order.status}
                                            </span>
                                            <Link to={`/admin/ops/orders/${order.id}`} className="text-neutral-200 hover:text-brand-pink transition-colors">
                                                <ArrowLeft size={16} className="rotate-180" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (40%) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* ADMIN ACTIONS */}
                        <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-8">Governance & Actions</h3>
                            <div className="space-y-3">
                                {maker.status === 'active' ? (
                                    <button className="w-full flex items-center justify-between px-5 py-4 border border-amber-200 bg-white text-amber-700 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all">
                                        <div className="flex items-center gap-3"><Pause size={14} /> Pause Shop</div>
                                        <ArrowLeft size={14} className="rotate-180 opacity-30" />
                                    </button>
                                ) : (
                                    <button className="w-full flex items-center justify-between px-5 py-4 border border-green-200 bg-white text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-all">
                                        <div className="flex items-center gap-3"><Play size={14} /> Reactivate Shop</div>
                                        <ArrowLeft size={14} className="rotate-180 opacity-30" />
                                    </button>
                                )}
                                
                                <button className="w-full flex items-center justify-between px-5 py-4 border border-red-200 bg-white text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                                    <div className="flex items-center gap-3"><Ban size={14} /> Suspend Account</div>
                                    <ArrowLeft size={14} className="rotate-180 opacity-30" />
                                </button>

                                <button className="w-full flex items-center justify-between px-5 py-4 border border-neutral-200 bg-white text-neutral-900 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                                    <div className="flex items-center gap-3"><Lock size={14} /> Hold Next Payout</div>
                                    <ArrowLeft size={14} className="rotate-180 opacity-30" />
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-brand-pink/10">
                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">Internal Admin Notes</p>
                                <textarea 
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Add a private note about this maker..."
                                    className="w-full h-32 p-4 bg-white border border-neutral-100 text-sm font-medium focus:border-brand-pink outline-none transition-all placeholder:text-neutral-300 resize-none"
                                />
                                <button className="mt-4 w-full py-3 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10">
                                    Save Internal Note
                                </button>
                            </div>
                        </div>

                        {/* PAYOUT SUMMARY */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 mb-8">Payout Summary</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Paid Out</p>
                                        <p className="text-2xl font-serif font-bold text-neutral-950">₹{(maker.totalRevenue * 0.94).toLocaleString()}</p>
                                    </div>
                                    <CreditCard size={24} className="text-neutral-100" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Next Pending</p>
                                        <p className="text-sm font-bold text-neutral-900">₹12,450</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm">
                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">On Hold</p>
                                        <p className="text-sm font-bold text-amber-700">₹0</p>
                                    </div>
                                </div>
                                <Link to={`/admin/ops/payouts?makerId=${maker.id}`} className="block text-center w-full py-3 border border-neutral-200 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                                    View Payout Ledger
                                </Link>
                            </div>
                        </div>

                        {/* SHOP LINKS */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 mb-6">Quick Links</h3>
                            <div className="space-y-4">
                                <a href={`/artisan/${maker.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm font-bold text-neutral-600 group-hover:text-neutral-950 transition-colors">
                                        <ExternalLink size={14} className="text-neutral-200 group-hover:text-brand-pink" />
                                        View Public Shop
                                    </div>
                                    <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                                <Link to={`/admin/ops/makers/${maker.id}/listings`} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm font-bold text-neutral-600 group-hover:text-neutral-950 transition-colors">
                                        <Package size={14} className="text-neutral-200 group-hover:text-brand-pink" />
                                        Manage Listings
                                    </div>
                                    <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                                <Link to={`/admin/ops/shipping?makerId=${maker.id}`} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm font-bold text-neutral-600 group-hover:text-neutral-950 transition-colors">
                                        <Clock size={14} className="text-neutral-200 group-hover:text-brand-pink" />
                                        SLA Performance
                                    </div>
                                    <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default MakerDetail;
