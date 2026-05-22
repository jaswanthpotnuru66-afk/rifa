import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, CheckCircle2, ShoppingBag,
    User, Store,
    Image as ImageIcon, Eye, Scale,
    ShieldAlert, Loader2, AlertCircle
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminDisputeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dispute, setDispute] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [adminNote, setAdminNote] = useState('');
    const [rulingType, setRulingType] = useState<'maker-favour' | 'refund-issued' | null>(null);
    const [rulingNotes, setRulingNotes] = useState('');
    const [isConfirmingRuling, setIsConfirmingRuling] = useState(false);

    useEffect(() => {
        if (id) fetchDispute();
    }, [id]);

    const fetchDispute = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAdminDisputeDetail(id!);
            if (data?.error) {
                setError(data.error);
            } else {
                setDispute(data);
                setAdminNote(data.admin_notes || '');
            }
        } catch (err) {
            setError('Failed to load dispute details.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkUnderReview = async () => {
        setIsUpdating(true);
        try {
            const updated = await api.markDisputeUnderReview(id!, adminNote || 'Moved to under review');
            if (updated) {
                setDispute((prev: any) => ({ ...prev, ...updated, status: 'under-review' }));
            }
        } catch (err) {
            console.error('Failed to mark as under review:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleIssueRuling = () => {
        setIsConfirmingRuling(true);
    };

    const confirmRuling = async () => {
        if (!rulingType || !rulingNotes) return;
        setIsUpdating(true);
        try {
            const updated = await api.ruleOnDispute(id!, {
                verdict: rulingType,
                admin_notes: `${rulingNotes}${adminNote ? `\n\nInternal notes: ${adminNote}` : ''}`
            });
            if (updated && !updated.error) {
                navigate('/admin/ops/disputes');
            }
        } catch (err) {
            console.error('Failed to issue ruling:', err);
        } finally {
            setIsUpdating(false);
            setIsConfirmingRuling(false);
        }
    };

    const getDaysOpen = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    if (isLoading) {
        return (
            <AdminOpsLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 size={40} className="text-brand-pink animate-spin" />
                </div>
            </AdminOpsLayout>
        );
    }

    if (error || !dispute) {
        return (
            <AdminOpsLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <AlertCircle size={40} className="text-red-400" />
                    <p className="text-neutral-500 text-sm">{error || 'Dispute not found.'}</p>
                    <Link to="/admin/ops/disputes" className="text-brand-pink text-sm font-bold hover:underline">
                        Back to Disputes
                    </Link>
                </div>
            </AdminOpsLayout>
        );
    }

    // Normalise fields — backend uses snake_case
    const buyerName = dispute.buyer?.full_name || '—';
    const makerBrand = dispute.artisans?.brand_name || dispute.artisans?.name || 'Individual';
    const linkedOrder = dispute.orders;
    const disputeStatus = dispute.verdict === 'under-review' ? 'under-review' : dispute.status;
    const resolvedVerdict = dispute.verdict && dispute.verdict !== 'under-review' ? dispute.verdict : null;
    const isResolved = dispute.status === 'resolved' && resolvedVerdict;

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
                            <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">
                                {dispute.id?.slice(0, 8).toUpperCase()}
                            </h1>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                isResolved ? 'bg-green-50 text-green-700 border-green-100' :
                                disputeStatus === 'under-review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {disputeStatus?.replace('-', ' ')}
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm font-light mt-1">
                            Raised on {new Date(dispute.created_at).toLocaleDateString()} · {getDaysOpen(dispute.created_at)} days ago
                        </p>
                    </div>
                    <div className="bg-red-100 text-red-700 border border-red-200 px-6 py-3 rounded-sm text-sm font-black uppercase tracking-widest">
                        {dispute.category?.replace(/-/g, ' ')}
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
                                    <p className="text-sm font-bold text-neutral-900">{buyerName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">{dispute.buyer?.email || '—'}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-neutral-100 p-6 rounded-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-neutral-50 pb-3">
                                    <Store size={14} className="text-neutral-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Maker</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">{makerBrand}</p>
                                    {dispute.artisan_id && (
                                        <Link to={`/admin/ops/makers/${dispute.artisan_id}`} className="text-[10px] font-black text-brand-pink hover:underline uppercase tracking-widest">View Profile</Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Buyer Evidence */}
                        <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Buyer's Submission</h3>
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-neutral-950">Category: <span className="text-brand-pink">{dispute.category?.replace(/-/g, ' ')}</span></p>
                                <blockquote className="border-l-4 border-red-300 bg-red-50 pl-6 py-4 italic text-sm text-neutral-700 leading-relaxed">
                                    "{dispute.description || 'No description provided.'}"
                                </blockquote>
                            </div>
                            
                            {/* Evidence Photos */}
                            <div className="pt-6">
                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-4">Photo Evidence</p>
                                {dispute.evidence_urls && dispute.evidence_urls.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            {dispute.evidence_urls.map((url: string, idx: number) => (
                                                <div key={idx} className="aspect-video bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100 relative group">
                                                    <img loading="lazy" src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Eye size={20} className="text-white" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-neutral-400 font-medium italic">{dispute.evidence_urls.length} evidence photo(s) submitted</p>
                                    </div>
                                ) : (
                                    <div className="py-12 bg-neutral-50 border border-dashed border-neutral-100 text-center rounded-sm">
                                        <ShieldAlert size={32} strokeWidth={1} className="text-neutral-200 mx-auto mb-2" />
                                        <p className="text-xs text-neutral-400 font-medium">No photos submitted by buyer</p>
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
                            <p className="text-center text-[10px] text-neutral-400 font-medium italic">Compare evidence against approved proof</p>
                        </div>

                        {/* Maker Response */}
                        {dispute.artisan_response && (
                            <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Maker's Response</h3>
                                <blockquote className="bg-teal-50 border-l-4 border-teal-300 pl-6 py-4 text-sm text-neutral-700 leading-relaxed">
                                    "{dispute.artisan_response}"
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
                        {linkedOrder && (
                            <div className="bg-white border border-neutral-100 p-8 rounded-sm space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-950 border-b border-neutral-50 pb-3">Linked Order</h3>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neutral-50 rounded-sm flex items-center justify-center shrink-0">
                                        <ShoppingBag size={24} strokeWidth={1} className="text-neutral-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">
                                            {linkedOrder.order_items?.[0]?.product_name || 'Order items'}
                                        </p>
                                        <p className="text-xs font-medium text-neutral-400">
                                            #{dispute.order_id?.slice(0, 8)} · ₹{linkedOrder.total_amount?.toLocaleString() || '—'}
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/admin/ops/orders/${dispute.order_id}`} className="block w-full py-3 border border-neutral-200 text-center text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                                    View Full Order
                                </Link>
                            </div>
                        )}

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
                                        <p className="text-[10px] text-neutral-400 font-medium">{new Date(dispute.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {dispute.artisan_response && (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-950">Maker responded</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">{dispute.updated_at ? new Date(dispute.updated_at).toLocaleString() : 'On record'}</p>
                                        </div>
                                    </div>
                                )}

                                {disputeStatus === 'under-review' && !isResolved && (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-brand-pink" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-950">Under Review</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">Updated by admin</p>
                                        </div>
                                    </div>
                                )}

                                {isResolved && (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-950">Resolved</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">
                                                {dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : 'Just now'}
                                            </p>
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

                            {!isResolved ? (
                                <div className="space-y-6">
                                    {disputeStatus === 'open' && (
                                        <button 
                                            onClick={handleMarkUnderReview}
                                            disabled={isUpdating}
                                            className="w-full py-3 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all bg-white disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : null}
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
                                        disabled={!rulingType || !rulingNotes || isUpdating}
                                        onClick={handleIssueRuling}
                                        className="w-full py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-900 transition-all shadow-lg shadow-brand-pink/10 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
                                        Issue Ruling
                                    </button>
                                </div>
                            ) : (
                                <div className={`p-6 border rounded-sm space-y-4 animate-in zoom-in-95 duration-300 ${
                                    resolvedVerdict === 'maker-favour' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        {resolvedVerdict === 'maker-favour' ? (
                                            <CheckCircle2 size={24} className="text-green-600" />
                                        ) : (
                                            <ShieldAlert size={24} className="text-red-600" />
                                        )}
                                        <h4 className="text-sm font-black uppercase tracking-widest">
                                            {resolvedVerdict === 'maker-favour' ? '✓ Ruled in Maker\'s Favour' : 'Refund Issued to Buyer'}
                                        </h4>
                                    </div>
                                    {dispute.admin_notes && (
                                        <p className="text-xs text-neutral-600 font-medium italic">"{dispute.admin_notes}"</p>
                                    )}
                                    <div className="pt-4 border-t border-black/5">
                                        <p className="text-[9px] font-black uppercase text-neutral-400">
                                            Resolved on {dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleDateString() : 'record'}
                                        </p>
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
                                You are about to {rulingType === 'maker-favour' ? 'rule in favour of the maker' : 'issue a refund to the buyer'}.
                                <br /><br />
                                <strong>This action cannot be undone.</strong>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmRuling}
                                    disabled={isUpdating}
                                    className="w-full py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
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
