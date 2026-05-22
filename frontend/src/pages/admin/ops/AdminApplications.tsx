import { useState, useMemo, useEffect } from 'react';
import { 
    Search, X, ArrowRight, 
    Loader2, Check, FileText,
    ChevronDown
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const Applications = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'approved' | 'rejected'>('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedApp) return;
        setIsProcessing(true);
        try {
            const res = await api.approveApplication(selectedApp.id, adminNotes);
            if (res?.success) {
                await fetchApplications();
                setSelectedApp(null);
                setAdminNotes('');
            } else {
                alert(res?.error || 'Failed to approve application');
            }
        } catch (error) {
            alert('An error occurred during approval');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp || !rejectionReason) return;
        setIsProcessing(true);
        try {
            const res = await api.rejectApplication(selectedApp.id, rejectionReason, adminNotes);
            if (res?.success) {
                await fetchApplications();
                setSelectedApp(null);
                setIsRejecting(false);
                setRejectionReason('');
                setAdminNotes('');
            } else {
                alert(res?.error || 'Failed to reject application');
            }
        } catch (error) {
            alert('An error occurred during rejection');
        } finally {
            setIsProcessing(false);
        }
    };

    const counts = {
        all: applications.length,
        new: applications.filter(a => a.status === 'new').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    const filteredApps = useMemo(() => {
        let result = [...applications];
        if (activeTab !== 'all') {
            result = result.filter(a => a.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => 
                (a.creator_name || '').toLowerCase().includes(q) || 
                (a.shop_name || '').toLowerCase().includes(q) || 
                (a.home_region || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [activeTab, searchQuery, applications]);

    const calculateDaysAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Today' : `${days} days ago`;
    };

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Artisan Onboarding</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Maker Applications</h1>
                </div>

                {/* PREMIUM INFO BANNER */}
                <div className="relative group overflow-hidden bg-white border border-neutral-100 p-8 flex items-center gap-8 shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink" />
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-neutral-950 shrink-0 border border-neutral-100">
                        <FileText size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950 mb-1">Queue Intelligence</p>
                        <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-2xl">
                            This registry monitors new CraftMaker portal applications. Approved artisans are automatically 
                            upgraded and granted full access to the marketplace fulfillment engine.
                        </p>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <p className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Active System</p>
                        <div className="w-12 h-[1px] bg-neutral-100" />
                    </div>
                </div>


                {/* Filter Tabs */}
                <div className="flex items-center gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar">
                    {(['all', 'new', 'approved', 'rejected'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                            }`}
                        >
                            {tab} ({counts[tab]})
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-96 group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-pink transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, shop, or state..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-100 rounded-sm focus:border-brand-pink outline-none text-sm font-medium transition-all placeholder:text-neutral-300"
                    />
                </div>

                {/* Applications Table */}
                <div className="space-y-3">
                    <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1.2fr_1fr_100px_100px_100px] gap-4 px-6 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div>Applicant</div>
                        <div>Shop</div>
                        <div>Origin & Craft</div>
                        <div>Submitted</div>
                        <div className="text-center">KYC</div>
                        <div className="text-center">Status</div>
                        <div />
                    </div>

                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 size={32} className="animate-spin text-brand-pink mx-auto mb-4" />
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Loading applications...</p>
                        </div>
                    ) : filteredApps.length > 0 ? filteredApps.map(app => (
                        <div key={app.id} className="bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all">
                            <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1.5fr_1.2fr_1fr_100px_100px_100px] gap-4 p-4 lg:p-6 items-center">
                                
                                <div>
                                    <p className="text-sm font-bold text-neutral-950">{app.creator_name}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{app.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-neutral-950 leading-tight">{app.shop_name}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">rifacrafts.in/shop/{app.shop_slug}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-neutral-700">{app.home_region}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{(app.product_categories || []).slice(0, 2).join(', ')}</p>
                                </div>

                                <div className="flex flex-col lg:items-start items-center">
                                    <p className="text-xs font-medium text-neutral-600">{new Date(app.created_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-0.5">{calculateDaysAgo(app.created_at)}</p>
                                </div>

                                <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${
                                        app.pan_number ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {app.pan_number ? 'KYC Done' : 'Incomplete'}
                                    </span>
                                </div>

                                <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                        app.status === 'new' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>

                                <div className="flex justify-center">
                                    {app.status === 'new' ? (
                                        <button 
                                            onClick={() => setSelectedApp(app)}
                                            className="px-4 py-2 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10"
                                        >
                                            Review
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setSelectedApp(app)}
                                            className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-300 hover:text-neutral-950"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-24 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No applications found</p>
                        </div>
                    )}
                </div>

                {/* APPLICATION DETAIL PANEL (Slide-over) */}
                {selectedApp && (
                    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
                        {/* More subtle, stable overlay */}
                        <div 
                            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px] animate-in fade-in duration-300" 
                            onClick={() => { if(!isProcessing) { setSelectedApp(null); setIsRejecting(false); } }}
                        />
                        <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l border-neutral-100">
                            
                            {/* Panel Header */}
                            <div className="px-10 py-8 bg-white border-b border-neutral-50 flex items-center justify-between shrink-0">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Application Registry</p>
                                    <h2 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight leading-none">{selectedApp.brand_name || selectedApp.shop_name}</h2>
                                </div>
                                <button 
                                    disabled={isProcessing}
                                    onClick={() => { setSelectedApp(null); setIsRejecting(false); }}
                                    className="p-3 hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-neutral-950 disabled:opacity-50"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                                
                                {/* Personal & Studio Summary */}
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1">Applicant</p>
                                        <div>
                                            <p className="text-base font-bold text-neutral-950">{selectedApp.creator_name}</p>
                                            <p className="text-xs text-neutral-500 mt-1">{selectedApp.email}</p>
                                            <p className="text-xs text-neutral-500">{selectedApp.mobile_number || selectedApp.contact}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1">Origin</p>
                                        <div>
                                            <p className="text-base font-bold text-neutral-950">{selectedApp.home_region}</p>
                                            <p className="text-xs text-neutral-500 mt-1">Pincode: {selectedApp.shipping_origin_pin_code}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials / KYC Grid */}
                                <div className="bg-[#FAF7F2] border border-neutral-100 p-8 space-y-8">
                                    <div className="flex justify-between items-center border-b border-neutral-200/50 pb-4">
                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Compliance & KYC</p>
                                        <div className="px-2 py-1 bg-neutral-950 text-white text-[8px] font-bold uppercase tracking-widest">Confidential</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-10">
                                        <div>
                                            <p className="text-[8px] font-black text-neutral-400 uppercase mb-2">PAN Card</p>
                                            <p className="text-sm font-bold font-inter tracking-widest uppercase">{selectedApp.pan_number || 'NOT PROVIDED'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-neutral-400 uppercase mb-2">GSTIN</p>
                                            <p className="text-sm font-bold font-inter tracking-widest text-neutral-400 uppercase">{selectedApp.gstin || 'EXEMPT'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-neutral-200/50">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Bank Settlement</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-400">Account</span>
                                                <span className="font-bold text-neutral-950 font-inter">{selectedApp.bank_account}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-400">IFSC Code</span>
                                                <span className="font-bold text-neutral-950 font-inter uppercase">{selectedApp.ifsc_code}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-400">Holder</span>
                                                <span className="font-bold text-neutral-950 uppercase">{selectedApp.account_holder}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Artisan Story / Categories */}
                                <div className="space-y-6">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Heritage & Craft</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedApp.product_categories || []).map((cat: string) => (
                                            <span key={cat} className="px-3 py-1 bg-white border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-600">{cat}</span>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-white border border-neutral-100 italic text-sm text-neutral-600 leading-relaxed font-serif">
                                        "{selectedApp.craft_origin_story || 'No story provided'}"
                                    </div>
                                </div>

                                {/* Review Actions */}
                                <div className="space-y-4 pt-4 border-t border-neutral-100">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Admin Verdict Notes</label>
                                    <textarea 
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add context for this approval or reasons for rejection..."
                                        className="w-full h-32 p-6 bg-white border border-neutral-200 text-sm font-light focus:border-neutral-950 outline-none transition-all placeholder:text-neutral-300 resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Panel Footer (Actions) */}
                            <div className="p-10 bg-white border-t border-neutral-100 shrink-0">
                                {selectedApp.status === 'new' && !isRejecting && (
                                    <div className="flex gap-4">
                                        <button 
                                            disabled={isProcessing}
                                            onClick={() => setIsRejecting(true)}
                                            className="flex-1 py-5 border border-neutral-200 text-neutral-950 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            disabled={isProcessing}
                                            onClick={handleApprove}
                                            className="flex-[2] py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            Confirm Approval
                                        </button>
                                    </div>
                                )}

                                {isRejecting && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="relative">
                                            <p className="text-[8px] font-black text-neutral-400 uppercase mb-3 tracking-[0.2em]">Select Rejection Reason</p>
                                            <div className="relative">
                                                <select 
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="w-full appearance-none px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-sm text-xs font-bold outline-none focus:border-neutral-950 transition-all"
                                                >
                                                    <option value="">Choose a reason...</option>
                                                    <option>KYC incomplete or invalid</option>
                                                    <option>Name mismatch on bank/PAN</option>
                                                    <option>Craft category not eligible</option>
                                                    <option>Duplicate shop account</option>
                                                    <option>Other / Policy violation</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                disabled={isProcessing}
                                                onClick={() => setIsRejecting(false)}
                                                className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                disabled={!rejectionReason || isProcessing}
                                                onClick={handleReject}
                                                className="flex-[2] py-4 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isProcessing && <Loader2 size={14} className="animate-spin" />}
                                                Confirm Rejection
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedApp.status !== 'new' && (
                                    <div className={`p-8 border flex flex-col items-center justify-center text-center gap-2 ${
                                        selectedApp.status === 'approved' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                    }`}>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Application {selectedApp.status}</p>
                                        <p className="text-xs italic opacity-70">"{selectedApp.admin_notes || 'Processed by Admin'}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminOpsLayout>
    );
};

export default Applications;
