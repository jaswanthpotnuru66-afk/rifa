import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, CheckCircle2, ShoppingBag,
    User, Store,
    Image as ImageIcon, Eye, Scale,
    ShieldAlert
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockDisputes, mockAllOrders } from '../../../lib/adminOps.mock';

const AdminDisputeDetail = () => {
    const { id } = useParams();
    const [dispute, setDispute] = useState(mockDisputes.find(d => d.id === id));
    const order = mockAllOrders.find(o => o.id === dispute?.orderId);

    const [adminNote, setAdminNote] = useState(dispute?.adminNotes || '');
    const [rulingType, setRulingType] = useState<'maker-favour' | 'refund-issued' | null>(null);
    const [refundAmount, setRefundAmount] = useState(dispute?.amount || 0);
    const [penaltyEnabled, setPenaltyEnabled] = useState(false);
    const [penaltyAmount, setPenaltyAmount] = useState(0);
    const [rulingNotes, setRulingNotes] = useState('');
    const [isConfirmingRuling, setIsConfirmingRuling] = useState(false);

    if (!dispute || !order) return (
        <AdminOpsLayout>
            <div className="text-center py-40">Dispute not found.</div>
        </AdminOpsLayout>
    );

    const getDaysOpen = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const handleMarkUnderReview = () => {
        setDispute({ ...dispute, status: 'under-review' });
    };

    const handleIssueRuling = () => {
        setIsConfirmingRuling(true);
    };

    const confirmRuling = () => {
        setDispute({
            ...dispute,
            status: 'resolved',
            outcome: rulingType!,
            adminRuling: rulingNotes,
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'Super Admin'
        });
        setIsConfirmingRuling(false);
    };

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-700 pb-24">
                
                {/* Header */}
                <div className="flex items-center gap-6">
                    <Link to="/admin/ops/disputes" className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-neutral-950">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">{dispute.id}</h1>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                dispute.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                                dispute.status === 'under-review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {dispute.status.replace('-', ' ')}
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm font-light mt-1">
                            Raised on {new Date(dispute.dateRaised).toLocaleDateString()} · {getDaysOpen(dispute.dateRaised)} days ago
                        </p>
                    </div>
                    <div className="bg-red-100 text-red-700 border border-red-200 px-6 py-3 rounded-sm text-sm font-black uppercase tracking-widest">
                        {dispute.category.replace('-', ' ')}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    
                    {/* LEFT COLUMN (60%) */}
                    <div className="lg:col-span-3 space-y-10">
                        
                        {/* Parties */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white border border-neutral-100 p-6 rounded-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-neutral-50 pb-3">
                                    <User size={14} className="text-neutral-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Buyer</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">{dispute.buyerName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">{dispute.buyerCity}, Maharashtra</p>
                                </div>
                            </div>
                            <div className="bg-white border border-neutral-100 p-6 rounded-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-neutral-50 pb-3">
                                    <Store size={14} className="text-neutral-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Maker</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">{dispute.makerShopName}</p>
                                    <Link to={`/admin/ops/makers/${dispute.makerId}`} className="text-[10px] font-black text-brand-pink hover:underline uppercase tracking-widest">View Profile</Link>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Evidence */}
                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Buyer's Submission</h3>
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-neutral-950">Category: <span className="text-brand-pink">{dispute.category.replace('-', ' ')}</span></p>
                                <blockquote className="border-l-4 border-red-300 bg-red-50 pl-6 py-4 italic text-sm text-neutral-700 leading-relaxed">
                                    "{dispute.buyerDescription}"
                                </blockquote>
                            </div>
                            
                            <div className="pt-6">
                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-4">Photo Evidence</p>
                                {dispute.buyerPhotoUrl ? (
                                    <div className="space-y-3">
                                        <div className="aspect-video w-full bg-neutral-100 rounded-sm flex items-center justify-center overflow-hidden border border-neutral-100">
                                            <ImageIcon size={48} strokeWidth={1} className="text-neutral-300" />
                                            {/* In real app: <img src={dispute.buyerPhotoUrl} className="w-full h-full object-cover" /> */}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-neutral-400 font-medium italic">Buyer's evidence photo submission</p>
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors">
                                                <Eye size={14} /> View Full Size
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 bg-neutral-50 border border-dashed border-neutral-100 text-center rounded-sm">
                                        <ShieldAlert size={32} strokeWidth={1} className="text-neutral-200 mx-auto mb-2" />
                                        <p className="text-xs text-neutral-400 font-medium">No photo submitted by buyer</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comparison Grid */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Visual Comparison</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="aspect-square bg-red-50/50 border border-red-100 rounded-sm flex items-center justify-center">
                                        <ImageIcon size={32} className="text-red-200" />
                                    </div>
                                    <p className="text-[9px] font-black text-center uppercase tracking-widest text-red-600">Buyer's Evidence</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="aspect-square bg-green-50/50 border border-green-100 rounded-sm flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-green-200" />
                                    </div>
                                    <p className="text-[9px] font-black text-center uppercase tracking-widest text-green-600">Maker's Approved Proof</p>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-neutral-400 font-medium italic">Approved proof — what the buyer agreed to on {new Date(dispute.dateRaised).toLocaleDateString()}</p>
                        </div>

                        {/* Maker Response */}
                        {dispute.makerResponse && (
                            <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Maker's Response</h3>
                                <blockquote className="bg-teal-50 border-l-4 border-teal-300 pl-6 py-4 text-sm text-neutral-700 leading-relaxed">
                                    "{dispute.makerResponse}"
                                </blockquote>
                            </div>
                        )}

                        {/* Admin Notes */}
                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Internal Admin Notes</h3>
                            <textarea 
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Add private notes for the resolution team..."
                                className="w-full h-32 p-4 bg-neutral-50 border border-neutral-100 text-sm font-medium focus:border-brand-pink outline-none transition-all placeholder:text-neutral-300 resize-none"
                            />
                        </div>

                    </div>

                    {/* RIGHT COLUMN (40%) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Linked Order */}
                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950 border-b border-neutral-50 pb-3">Linked Order</h3>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-neutral-50 rounded-sm flex items-center justify-center shrink-0">
                                    <ShoppingBag size={24} strokeWidth={1} className="text-neutral-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-neutral-900 truncate">{order.productName}</p>
                                    <p className="text-xs font-medium text-neutral-400">{order.id} · ₹{order.amount.toLocaleString()}</p>
                                </div>
                            </div>
                            <Link to={`/admin/ops/orders/${order.id}`} className="block w-full py-3 border border-neutral-200 text-center text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                                View Full Order
                            </Link>
                        </div>

                        {/* Dispute Timeline */}
                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950 border-b border-neutral-50 pb-3">Dispute Timeline</h3>
                            <div className="space-y-8 relative">
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-100" />
                                
                                <div className="flex gap-6 relative z-10">
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-950">Dispute Raised</p>
                                        <p className="text-[10px] text-neutral-400 font-medium">{new Date(dispute.dateRaised).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 relative z-10">
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-950">Buyer submitted evidence</p>
                                        <p className="text-[10px] text-neutral-400 font-medium">{new Date(dispute.dateRaised).toLocaleString()}</p>
                                    </div>
                                </div>

                                {dispute.makerResponse && (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-950">Maker responded</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">12 Jun · 10:45</p>
                                        </div>
                                    </div>
                                )}

                                {dispute.status === 'under-review' && (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-brand-pink" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-950">Under Review</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">Auto-updated</p>
                                        </div>
                                    </div>
                                )}

                                {dispute.status === 'resolved' && (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-950">Resolved</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">{dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleString() : 'Just now'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ruling Section */}
                        <div className="bg-brand-pink/5 border border-brand-pink/30 rounded-sm p-8 space-y-8">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-2">Admin Ruling</p>
                                <h3 className="text-xl font-serif font-bold text-neutral-950 tracking-tight">Resolve Dispute</h3>
                            </div>

                            {dispute.status !== 'resolved' ? (
                                <div className="space-y-6">
                                    {dispute.status === 'open' && (
                                        <button 
                                            onClick={handleMarkUnderReview}
                                            className="w-full py-3 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all bg-white"
                                        >
                                            Mark as Under Review
                                        </button>
                                    )}

                                    <div className="space-y-4">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Select Outcome</p>
                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => setRulingType('maker-favour')}
                                                className={`w-full flex items-center justify-between p-4 border rounded-sm transition-all ${
                                                    rulingType === 'maker-favour' ? 'bg-brand-pink/10 border-brand-pink' : 'bg-white border-neutral-100'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-neutral-800">Rule in Maker's Favour</span>
                                                {rulingType === 'maker-favour' && <CheckCircle2 size={16} className="text-brand-pink" />}
                                            </button>
                                            <button 
                                                onClick={() => setRulingType('refund-issued')}
                                                className={`w-full flex items-center justify-between p-4 border rounded-sm transition-all ${
                                                    rulingType === 'refund-issued' ? 'bg-red-50 border-red-500' : 'bg-white border-neutral-100'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-neutral-800">Issue Refund to Buyer</span>
                                                {rulingType === 'refund-issued' && <CheckCircle2 size={16} className="text-red-500" />}
                                            </button>
                                        </div>
                                    </div>

                                    {rulingType === 'refund-issued' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300 pt-4 border-t border-brand-pink/10">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[8px] font-black text-neutral-400 uppercase mb-2">Refund Amount (₹)</p>
                                                    <input 
                                                        type="number"
                                                        value={refundAmount}
                                                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                                                        className="w-full p-3 bg-white border border-neutral-100 text-xs font-bold outline-none focus:border-red-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-end">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${penaltyEnabled ? 'bg-red-500' : 'bg-neutral-200'}`}>
                                                            <div 
                                                                onClick={() => setPenaltyEnabled(!penaltyEnabled)}
                                                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${penaltyEnabled ? 'left-5' : 'left-1'}`} 
                                                            />
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 transition-colors">Deduct Penalty</span>
                                                    </label>
                                                </div>
                                            </div>
                                            {penaltyEnabled && (
                                                <div className="animate-in slide-in-from-top-1 duration-200">
                                                    <p className="text-[8px] font-black text-neutral-400 uppercase mb-2">Penalty Amount (₹)</p>
                                                    <input 
                                                        type="number"
                                                        value={penaltyAmount}
                                                        onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                                                        placeholder="Enter amount..."
                                                        className="w-full p-3 bg-white border border-neutral-100 text-xs font-bold outline-none focus:border-red-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Ruling Notes (Required)</p>
                                        <textarea 
                                            value={rulingNotes}
                                            onChange={(e) => setRulingNotes(e.target.value)}
                                            placeholder="Explain the logic behind this ruling..."
                                            className="w-full h-24 p-4 bg-white border border-neutral-100 text-sm font-medium focus:border-brand-pink outline-none transition-all placeholder:text-neutral-300 resize-none"
                                        />
                                    </div>

                                    <button 
                                        disabled={!rulingType || !rulingNotes}
                                        onClick={handleIssueRuling}
                                        className="w-full py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10 disabled:opacity-50"
                                    >
                                        Issue Ruling
                                    </button>
                                </div>
                            ) : (
                                <div className={`p-6 border rounded-sm space-y-4 animate-in zoom-in-95 duration-300 ${
                                    dispute.outcome === 'maker-favour' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        {dispute.outcome === 'maker-favour' ? (
                                            <CheckCircle2 size={24} className="text-green-600" />
                                        ) : (
                                            <ShieldAlert size={24} className="text-red-600" />
                                        )}
                                        <h4 className="text-sm font-black uppercase tracking-widest">
                                            {dispute.outcome === 'maker-favour' ? '✓ Ruled in Maker\'s Favour' : 'Refund Issued to Buyer'}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-neutral-600 font-medium italic">"{dispute.adminRuling}"</p>
                                    <div className="pt-4 border-t border-black/5">
                                        <p className="text-[9px] font-black uppercase text-neutral-400">Resolved By: {dispute.resolvedBy} on {new Date(dispute.resolvedAt!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Ruling Confirmation Modal */}
                {isConfirmingRuling && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setIsConfirmingRuling(false)} />
                        <div className="relative bg-white max-w-md w-full p-10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                            <Scale size={48} className="text-brand-pink mx-auto mb-6" />
                            <h3 className="text-2xl font-serif font-bold text-neutral-950 mb-4">Confirm Final Ruling</h3>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">
                                You are about to {rulingType === 'maker-favour' ? 'rule in favour of the maker' : `issue a refund of ₹${refundAmount}`}. 
                                {penaltyEnabled && ` A penalty of ₹${penaltyAmount} will be deducted from the maker.`} 
                                <br/><br/>
                                <strong>This action cannot be undone.</strong>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmRuling}
                                    className="w-full py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all"
                                >
                                    Confirm Ruling
                                </button>
                                <button 
                                    onClick={() => setIsConfirmingRuling(false)}
                                    className="w-full py-4 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminOpsLayout>
    );
};

export default AdminDisputeDetail;
