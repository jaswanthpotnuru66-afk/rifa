import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, MapPin,
    ShieldCheck, ShieldAlert,
    Pause,
    CreditCard, ExternalLink, Package,
    Ban, Loader2, Scale
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const MakerDetail = () => {
    const { id } = useParams();
    const [maker, setMaker] = useState<any>(null);
    const [shippingAlerts, setShippingAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [makerData, alertsData] = await Promise.all([
                api.getAdminArtisan(id!),
                api.getAdminShippingAlerts()
            ]);
            setMaker(makerData);
            setShippingAlerts(alertsData.filter((a: any) => a.artisan_id === id));
        } catch (error) {
            console.error('Failed to fetch maker detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <AdminOpsLayout>
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 size={40} className="text-brand-pink animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Retrieving Artisan Profile...</p>
            </div>
        </AdminOpsLayout>
    );

    if (!maker) return (
        <AdminOpsLayout>
            <div className="text-center py-24">
                <p className="text-neutral-400">Maker not found.</p>
                <Link to="/admin/ops/makers" className="text-brand-pink underline mt-4 inline-block">Back to Makers</Link>
            </div>
        </AdminOpsLayout>
    );

    const weightIncidents = shippingAlerts.filter(a => a.type === 'weight_mismatch');

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
                            <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">{maker.brand_name || 'Individual'}</h1>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${maker.status === 'active' || !maker.status ? 'bg-green-50 text-green-700 border-green-100' :
                                    maker.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {maker.status || 'active'}
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm font-light mt-1 flex items-center gap-2">
                            {maker.slug || 'no-slug'} · Joined {new Date(maker.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* LEFT COLUMN (60%) */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* SHOP OVERVIEW */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                <DetailBox label="Origin State" value={<div className="flex items-center gap-1.5"><MapPin size={12} className="text-brand-pink" /> {maker.location || 'India'}</div>} />
                                <DetailBox label="Total Products" value={maker.products?.length || 0} />
                                <DetailBox label="Weight Incidents" value={`${weightIncidents.length} Recorded`} />
                                <DetailBox label="Total Revenue" value="₹0" />
                            </div>
                        </div>

                        {/* WEIGHT MISMATCHES SECTION */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Scale size={18} className="text-amber-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">Weight Mismatches</h3>
                                </div>
                                <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Carrier Audit Queue</span>
                            </div>
                            
                            <div className="space-y-4">
                                {weightIncidents.length > 0 ? weightIncidents.map((alert: any) => (
                                    <div key={alert.id} className="p-6 border border-neutral-50 bg-neutral-50/30 group hover:border-amber-100 hover:bg-white transition-all relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-950 uppercase tracking-widest mb-1">Order {alert.order_id.slice(0, 8)}</p>
                                                <p className="text-xs text-neutral-500 font-light italic">"{alert.description}"</p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${
                                                alert.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <DetailBox label="Claimed" value={`${alert.original_weight}kg`} />
                                            <DetailBox label="Carrier Detected" value={`${alert.detected_weight}kg`} />
                                            <DetailBox label="Adjustment" value={<span className="text-red-600">₹{alert.adjustment_amount}</span>} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 border border-dashed border-neutral-100 text-center rounded-sm">
                                        <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em]">No active weight disputes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KYC & COMPLIANCE */}
                        <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">KYC & Compliance</h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest ${maker.kyc_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {maker.kyc_verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    {maker.kyc_verified ? '✓ Verified' : '⚠ Unverified'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                <DetailBox label="Legal Name" value={maker.name || 'N/A'} />
                                <DetailBox label="Phone" value={maker.phone || 'N/A'} />
                                <DetailBox label="Email" value={maker.email || 'N/A'} />
                                <DetailBox label="GSTIN" value={maker.gstin || <span className="text-amber-600 font-bold">Not provided</span>} />
                                <DetailBox label="Business Type" value="Artisan Shop" />
                            </div>
                        </div>

                        {/* PRODUCTS LIST */}
                        <div className="bg-white border border-neutral-100 rounded-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">Products ({maker.products?.length || 0})</h3>
                            </div>
                            <div className="space-y-4">
                                {maker.products?.map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between p-4 border border-neutral-50 hover:border-neutral-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-50 rounded-sm overflow-hidden flex items-center justify-center border border-neutral-100">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-neutral-200" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-neutral-950">{product.name}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">₹{product.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${product.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}>
                                                {product.status || 'draft'}
                                            </span>
                                            <Link to={`/admin/ops/listings/review?id=${product.id}`} className="p-2 text-neutral-300 hover:text-brand-pink transition-colors">
                                                <ExternalLink size={14} />
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
                                <button className="w-full flex items-center justify-between px-5 py-4 border border-amber-200 bg-white text-amber-700 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all">
                                    <div className="flex items-center gap-3"><Pause size={14} /> Pause Shop</div>
                                </button>

                                <button className="w-full flex items-center justify-between px-5 py-4 border border-red-200 bg-white text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                                    <div className="flex items-center gap-3"><Ban size={14} /> Suspend Account</div>
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
                                        <p className="text-2xl font-serif font-bold text-neutral-950">₹0</p>
                                    </div>
                                    <CreditCard size={24} className="text-neutral-100" />
                                </div>
                                <Link to={`/admin/ops/payouts?makerId=${maker.id}`} className="block text-center w-full py-3 border border-neutral-200 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                                    View Payout Ledger
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
