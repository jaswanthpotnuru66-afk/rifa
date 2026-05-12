import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, ChevronDown, ChevronUp, 
    MessageSquare, Check, X,
    Shield, Info, Plus
} from 'lucide-react';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockDisputes, type Dispute } from '../../lib/craftmaker';

const Disputes = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleDispute = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <CraftMakerLayout title="Disputes">
            <div className="space-y-8 animate-in fade-in duration-700">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Resolution Center</h1>
                        <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest mt-1">Manage buyer disputes and admin rulings</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-sm">
                        <Shield className="text-amber-600" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">Artisan Protection Active</span>
                    </div>
                </div>

                {/* Disputes List */}
                <div className="space-y-4">
                    {/* Table Header */}
                    <div className="hidden md:flex items-center gap-4 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <div className="w-24">Order ID</div>
                        <div className="w-48">Buyer</div>
                        <div className="flex-1">Category</div>
                        <div className="w-32 text-center">Date Raised</div>
                        <div className="w-32 text-center">Status</div>
                        <div className="w-32 text-center">Outcome</div>
                        <div className="w-10 text-right" />
                    </div>

                    {/* Dispute Rows */}
                    <div className="space-y-2">
                        {mockDisputes.map((dispute) => (
                            <DisputeRow 
                                key={dispute.id} 
                                dispute={dispute} 
                                isExpanded={expandedId === dispute.id}
                                onToggle={() => toggleDispute(dispute.id)}
                            />
                        ))}
                    </div>

                    {mockDisputes.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-sm bg-white/50">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-300 mb-6">
                                <Check size={24} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No active disputes</h3>
                            <p className="text-neutral-400 text-sm max-w-xs text-center font-medium uppercase tracking-widest">Your record is spotless. Keep up the great work!</p>
                        </div>
                    )}
                </div>

            </div>
        </CraftMakerLayout>
    );
};

const DisputeRow = ({ dispute, isExpanded, onToggle }: { dispute: Dispute, isExpanded: boolean, onToggle: () => void }) => {
    const [response, setResponse] = useState('');

    return (
        <div className={`bg-white border transition-all ${isExpanded ? 'border-brand-pink shadow-xl ring-4 ring-brand-pink/5' : 'border-neutral-100'}`}>
            {/* Header Row */}
            <div 
                onClick={onToggle}
                className="flex flex-col md:flex-row md:items-center gap-4 p-6 cursor-pointer hover:bg-neutral-50 transition-colors"
            >
                <div className="w-24">
                    <span className="text-sm font-bold text-neutral-950">#{dispute.orderId}</span>
                </div>
                <div className="w-48">
                    <span className="text-xs font-bold text-neutral-950">{dispute.buyerName}</span>
                </div>
                <div className="flex-1">
                    <span className="text-xs font-medium text-neutral-700">{dispute.category}</span>
                </div>
                <div className="w-32 text-center">
                    <span className="text-xs text-neutral-400">{dispute.dateRaised}</span>
                </div>
                <div className="w-32 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        dispute.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                        dispute.status === 'under-review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        {dispute.status.replace('-', ' ')}
                    </span>
                </div>
                <div className="w-32 text-center">
                    {dispute.outcome ? (
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                            dispute.outcome === 'maker-favour' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {dispute.outcome === 'maker-favour' ? 'Won' : 'Refund Issued'}
                        </span>
                    ) : <span className="text-xs text-neutral-300">--</span>}
                </div>
                <div className="w-10 flex justify-end">
                    {isExpanded ? <ChevronUp size={20} className="text-brand-pink" /> : <ChevronDown size={20} className="text-neutral-300" />}
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-neutral-100"
                    >
                        <div className="p-8 space-y-10 bg-neutral-50/50">
                            
                            {/* Evidence Comparison */}
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Buyer's Claim</h4>
                                    <div className="p-6 bg-white border border-red-100 rounded-sm">
                                        <p className="text-sm font-medium italic text-neutral-700 mb-6 leading-relaxed">"{dispute.buyerDescription}"</p>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Buyer's Evidence Photo</p>
                                            <div className="aspect-square bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100 flex items-center justify-center">
                                                {dispute.buyerPhoto ? (
                                                    <img src={dispute.buyerPhoto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <X size={32} className="text-neutral-200" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500">Your Evidence</h4>
                                    <div className="p-6 bg-white border border-green-100 rounded-sm h-full">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Your Approved Digital Proof</p>
                                            <div className="aspect-square bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100">
                                                <img src="/products/pottery.png" alt="" className="w-full h-full object-cover grayscale opacity-50" />
                                            </div>
                                            <p className="text-[9px] text-green-600 font-bold uppercase mt-3">✓ Proof Approved by Buyer on 12 May 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Ruling */}
                            {dispute.status === 'resolved' && (
                                <div className={`p-8 rounded-sm border ${
                                    dispute.outcome === 'maker-favour' 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                            dispute.outcome === 'maker-favour' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            {dispute.outcome === 'maker-favour' ? <Check size={24} strokeWidth={3} /> : <AlertTriangle size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-lg font-serif font-bold mb-2 ${
                                                dispute.outcome === 'maker-favour' ? 'text-green-900' : 'text-red-900'
                                            }`}>
                                                {dispute.outcome === 'maker-favour' ? 'Admin Ruled in Your Favor' : 'Refund Issued to Buyer'}
                                            </h4>
                                            <p className="text-sm font-medium leading-relaxed opacity-80 mb-6">{dispute.adminRuling}</p>
                                            <div className="flex gap-4">
                                                <div className="px-4 py-2 bg-white/50 border border-current/10 rounded-sm text-[9px] font-black uppercase tracking-widest">
                                                    Financial Impact: {dispute.amountDeducted ? `-₹${dispute.amountDeducted}` : 'None'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Maker Response Form */}
                            {(dispute.status === 'open' || dispute.status === 'under-review') && (
                                <div className="space-y-6 pt-6 border-t border-neutral-200">
                                    <div className="flex items-center gap-3 text-neutral-400">
                                        <MessageSquare size={16} />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Submit Your Response to Admin</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <textarea 
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            className="w-full bg-white border border-neutral-100 p-6 outline-none focus:border-brand-pink text-sm font-medium transition-all min-h-[120px] resize-none rounded-sm shadow-inner"
                                            placeholder="Provide context and evidence to defend this dispute..."
                                        />
                                        <div className="flex items-center justify-between">
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors">
                                                <Plus size={14} /> Attach Evidence Photo
                                            </button>
                                            <button 
                                                disabled={!response}
                                                className="px-10 py-4 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all shadow-xl disabled:opacity-50"
                                            >
                                                Submit Response
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-4">
                                        <Info className="text-amber-600 shrink-0" size={16} />
                                        <p className="text-[9px] text-amber-700 font-bold uppercase leading-relaxed tracking-tight">Admin rulings are final. Providing high-resolution proof photos significantly increases success rate.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Disputes;
