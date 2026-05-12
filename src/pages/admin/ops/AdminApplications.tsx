import { useState, useMemo } from 'react';
import { 
    Search, X, ShieldAlert, 
    ArrowRight, Clock, MapPin, 
    Smartphone, Mail, FileText,
    CheckCircle2, ChevronDown
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockMakerApplications } from '../../../lib/adminOps.mock';

const Applications = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState<typeof mockMakerApplications[0] | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const counts = {
        all: mockMakerApplications.length,
        pending: mockMakerApplications.filter(a => a.status === 'pending').length,
        approved: mockMakerApplications.filter(a => a.status === 'approved').length,
        rejected: mockMakerApplications.filter(a => a.status === 'rejected').length
    };

    const filteredApps = useMemo(() => {
        let result = [...mockMakerApplications];
        if (activeTab !== 'all') {
            result = result.filter(a => a.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => 
                a.applicantName.toLowerCase().includes(q) || 
                a.shopName.toLowerCase().includes(q) || 
                a.originState.toLowerCase().includes(q)
            );
        }
        return result;
    }, [activeTab, searchQuery]);

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

                {/* IMPORTANT NOTE */}
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-950">Self-Registration Review</p>
                        <p className="text-xs text-blue-700/70 font-medium leading-relaxed mt-1">
                            These are new CraftMaker portal registrations from /craftmaker/register. 
                            The existing artisan collaborator applications are managed in the main Admin CRM at /admin.
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
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

                    {filteredApps.length > 0 ? filteredApps.map(app => (
                        <div key={app.id} className="bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all">
                            <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1.5fr_1.2fr_1fr_100px_100px_100px] gap-4 p-4 lg:p-6 items-center">
                                
                                <div>
                                    <p className="text-sm font-bold text-neutral-950">{app.applicantName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{app.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-neutral-950 leading-tight">{app.shopName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">rifacrafts.in/shop/{app.shopSlug}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-neutral-700">{app.originState}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{app.craftCategories.slice(0, 2).join(', ')}</p>
                                </div>

                                <div className="flex flex-col lg:items-start items-center">
                                    <p className="text-xs font-medium text-neutral-600">{new Date(app.submittedAt).toLocaleDateString()}</p>
                                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-0.5">{calculateDaysAgo(app.submittedAt)}</p>
                                </div>

                                <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${
                                        app.kycVerified ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {app.kycVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>

                                <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                        app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>

                                <div className="flex justify-center">
                                    {app.status === 'pending' ? (
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
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <div 
                            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
                            onClick={() => { setSelectedApp(null); setIsRejecting(false); }}
                        />
                        <div className="relative w-full max-w-lg bg-[#FAF7F2] h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                            
                            {/* Panel Header */}
                            <div className="px-8 py-6 bg-white border-b border-neutral-100 flex items-center justify-between shrink-0">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-pink mb-1">Application Review</p>
                                    <h2 className="text-xl font-serif font-bold text-neutral-950 tracking-tight">{selectedApp.shopName}</h2>
                                </div>
                                <button 
                                    onClick={() => { setSelectedApp(null); setIsRejecting(false); }}
                                    className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-neutral-950"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                                
                                {/* Personal Details */}
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Personal Details</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Full Name</p>
                                            <p className="text-sm font-bold text-neutral-800">{selectedApp.applicantName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Submitted</p>
                                            <p className="text-sm font-bold text-neutral-800">{new Date(selectedApp.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-6 py-3 px-4 bg-white border border-neutral-100 rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <Smartphone size={14} className="text-brand-pink" />
                                                <span className="text-xs font-bold text-neutral-700">{selectedApp.mobile.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')}</span>
                                            </div>
                                            <div className="w-px h-4 bg-neutral-100" />
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-brand-pink" />
                                                <span className="text-xs font-bold text-neutral-700">{selectedApp.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Shop Details */}
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Shop & Fulfillment</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white border border-neutral-100 rounded-sm">
                                            <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Public URL</p>
                                            <p className="text-xs font-bold text-brand-pink">rifacrafts.in/shop/{selectedApp.shopSlug}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white border border-neutral-100 rounded-sm">
                                                <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Origin State</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                                                    <MapPin size={12} className="text-neutral-400" />
                                                    {selectedApp.originState}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white border border-neutral-100 rounded-sm">
                                                <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Origin PIN</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                                                    <Clock size={12} className="text-neutral-400" />
                                                    {selectedApp.shippingOriginPin}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white border border-neutral-100 rounded-sm">
                                            <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Craft Categories</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {selectedApp.craftCategories.map(cat => (
                                                    <span key={cat} className="px-2 py-0.5 bg-neutral-50 text-[9px] font-bold text-neutral-600 border border-neutral-100 uppercase">{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* KYC Details */}
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">KYC Verification</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-neutral-900 text-white rounded-sm">
                                                <p className="text-[8px] font-black text-white/40 uppercase mb-1">PAN Number</p>
                                                <p className="text-xs font-bold tracking-widest">{selectedApp.pan.replace(/(.{5}).*/, '$1****')}</p>
                                            </div>
                                            <div className="p-4 bg-neutral-900 text-white rounded-sm">
                                                <p className="text-[8px] font-black text-white/40 uppercase mb-1">GSTIN</p>
                                                <p className="text-xs font-bold tracking-widest">{selectedApp.gstin ? selectedApp.gstin.replace(/(.{2}).*/, '$1***********') : 'NOT PROVIDED'}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white border border-neutral-100 rounded-sm flex items-center justify-between">
                                            <div>
                                                <p className="text-[8px] font-black text-neutral-300 uppercase mb-1">Bank Account</p>
                                                <p className="text-xs font-bold text-neutral-800">{selectedApp.bankAccountName}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">{selectedApp.ifsc} · ****{selectedApp.bankLast4}</p>
                                            </div>
                                            {selectedApp.applicantName === selectedApp.bankAccountName ? (
                                                <div className="flex items-center gap-1.5 text-green-600">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Names match</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-red-500">
                                                    <ShieldAlert size={16} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Mismatch</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Admin Actions Section */}
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Review Notes</h3>
                                    <textarea 
                                        placeholder="Private notes about this application..."
                                        className="w-full h-32 p-4 bg-white border border-neutral-100 text-sm font-medium focus:border-brand-pink outline-none transition-all placeholder:text-neutral-300 resize-none"
                                    />
                                </section>
                            </div>

                            {/* Panel Footer (Actions) */}
                            <div className="p-8 bg-white border-t border-neutral-100 shrink-0">
                                {selectedApp.status === 'pending' && !isRejecting && (
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setIsRejecting(true)}
                                            className="flex-1 py-4 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-50 transition-all"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            className="flex-[2] py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10"
                                        >
                                            Approve Shop
                                        </button>
                                    </div>
                                )}

                                {isRejecting && (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="relative">
                                            <p className="text-[8px] font-black text-neutral-400 uppercase mb-2">Rejection Reason</p>
                                            <select 
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="w-full appearance-none px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-sm text-xs font-bold outline-none"
                                            >
                                                <option value="">Select a reason...</option>
                                                <option>KYC incomplete or invalid</option>
                                                <option>Name mismatch on bank/PAN</option>
                                                <option>Craft category not eligible</option>
                                                <option>Duplicate shop account</option>
                                                <option>Other / Policy violation</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 bottom-3.5 text-neutral-400 pointer-events-none" />
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setIsRejecting(false)}
                                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                disabled={!rejectionReason}
                                                className="flex-[2] py-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                                            >
                                                Confirm Rejection
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedApp.status !== 'pending' && (
                                    <div className={`p-4 rounded-sm text-center border ${
                                        selectedApp.status === 'approved' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                    }`}>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Application {selectedApp.status}</p>
                                        {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                                            <p className="text-xs mt-1 font-medium italic">"{selectedApp.rejectionReason}"</p>
                                        )}
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
