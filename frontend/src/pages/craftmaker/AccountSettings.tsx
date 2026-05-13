import { useState } from 'react';
import { 
    Check, Clock, Shield, CreditCard, ExternalLink, 
    CheckCircle2, X, ChevronRight, Mail, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockMakerProfile } from '../../lib/craftmaker';

const TABS = ['Account', 'KYC & Payout', 'Notifications'];

const NOTIFICATION_EVENTS = [
    'New order received',
    'Proof response (approved/rejected)',
    'Pickup confirmed by courier',
    'Order delivered successfully',
    'Payout released',
    'Dispute opened against you',
    'Account warning issued',
    'Platform announcements',
];

const Toggle = ({ defaultOn = false }: { defaultOn?: boolean }) => {
    const [on, setOn] = useState(defaultOn);
    return (
        <button onClick={() => setOn(!on)} className={`w-10 h-5 rounded-full relative transition-all ${on ? 'bg-brand-pink' : 'bg-neutral-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5.5' : 'left-0.5'}`} />
        </button>
    );
};

const AccountSettings = () => {
    const [activeTab, setActiveTab] = useState('Account');
    const [showBankModal, setShowBankModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [gstinVal, setGstinVal] = useState('');
    const [gstinSaved, setGstinSaved] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1200);
    };

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Account</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Account Settings</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Authentication, KYC documents, and notification preferences.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-10 border-b border-neutral-100 overflow-x-auto no-scrollbar pb-px">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'}`}
                        >
                            {tab}
                            {activeTab === tab && <motion.div layoutId="acctTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                        </button>
                    ))}
                </div>

                <div className="max-w-3xl">
                    <AnimatePresence mode="wait">

                        {/* ── Account Tab ── */}
                        {activeTab === 'Account' && (
                            <motion.div key="account" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-6">
                                
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Contact Information</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Registered Mobile</label>
                                            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 px-4 py-3.5 rounded-sm">
                                                <Smartphone size={15} className="text-neutral-300" />
                                                <span className="text-sm font-bold text-neutral-400 tracking-wider">{mockMakerProfile.mobileMasked}</span>
                                                <span className="ml-auto text-[9px] font-black uppercase text-neutral-300">Locked</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Email Address</label>
                                            <div className="relative">
                                                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                                <input type="email" defaultValue="meera@example.com"
                                                    className="w-full bg-neutral-50 border border-neutral-100 pl-10 pr-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Change Password</h3>
                                    <div className="grid md:grid-cols-3 gap-5">
                                        {['Current Password', 'New Password', 'Confirm New'].map(label => (
                                            <div key={label} className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">{label}</label>
                                                <input type="password" className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm outline-none focus:border-brand-pink transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="flex items-center gap-2 px-8 py-3 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-950 hover:border-neutral-950 transition-all">
                                        <Shield size={13} /> Update Password
                                    </button>
                                </div>

                                <button onClick={handleSave} disabled={isSaving}
                                    className="flex items-center gap-3 px-12 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-brand-pink/20 hover:bg-brand-pink-dark transition-all disabled:opacity-60">
                                    {isSaving ? <Clock size={14} className="animate-spin" /> : <Check size={14} />}
                                    {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Account Details'}
                                </button>
                            </motion.div>
                        )}

                        {/* ── KYC & Payout Tab ── */}
                        {activeTab === 'KYC & Payout' && (
                            <motion.div key="kyc" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-6">
                                
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Government Documents</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Permanent Account Number (PAN)', value: mockMakerProfile.panMasked },
                                            { label: 'Aadhaar Number',                 value: mockMakerProfile.aadhaarMasked },
                                        ].map(doc => (
                                            <div key={doc.label} className="flex items-center justify-between py-4 border-b border-neutral-50 last:border-0">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">{doc.label}</p>
                                                    <p className="text-sm font-bold text-neutral-500 tracking-wider">{doc.value}</p>
                                                </div>
                                                <CheckCircle2 size={18} className="text-green-500" />
                                            </div>
                                        ))}
                                        <div className="pt-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-950 mb-2">GSTIN (Optional)</p>
                                            {gstinSaved ? (
                                                <div className="flex items-center justify-between bg-teal-50 border border-teal-100 px-4 py-3 rounded-sm">
                                                    <span className="text-sm font-black text-teal-800 tracking-wider">{gstinVal}</span>
                                                    <button onClick={() => setGstinSaved(false)} className="text-[9px] font-black uppercase text-teal-500 hover:text-teal-800">Update</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <input type="text" placeholder="15-character GSTIN" value={gstinVal} onChange={e => setGstinVal(e.target.value.toUpperCase())}
                                                        className="flex-1 bg-neutral-50 border border-neutral-100 px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-pink" />
                                                    <button onClick={() => gstinVal.length > 0 && setGstinSaved(true)}
                                                        className="px-6 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-pink-dark transition-all">
                                                        Save
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Account Card */}
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Payout Destination</h3>
                                    {/* Glossy dark card */}
                                    <div className="relative bg-[#0a0a0a] rounded-sm p-7 overflow-hidden">
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-pink/10 rounded-full" />
                                        <div className="absolute right-6 bottom-6">
                                            <CreditCard size={36} className="text-white/10" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-5">Linked Bank Account</p>
                                            <p className="text-2xl font-serif font-bold text-white tracking-[0.4em] mb-1">**** **** {mockMakerProfile.bankLast4}</p>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{mockMakerProfile.ifsc}</p>
                                            <div className="flex items-center gap-2 mt-5 text-green-400 text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle2 size={13} /> Verified & Active
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowBankModal(true)}
                                        className="w-full flex items-center justify-center gap-2 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-neutral-950 hover:border-neutral-950 transition-all">
                                        Update Bank Account <ChevronRight size={13} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Notifications Tab ── */}
                        {activeTab === 'Notifications' && (
                            <motion.div key="notif" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm overflow-hidden">
                                    <div className="grid grid-cols-[1fr_80px_80px_80px] text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 border-b border-neutral-100 px-6 py-4">
                                        <span>Event</span>
                                        <span className="text-center">SMS</span>
                                        <span className="text-center">Email</span>
                                        <span className="text-center">Push</span>
                                    </div>
                                    {NOTIFICATION_EVENTS.map((event, i) => (
                                        <div key={i} className={`grid grid-cols-[1fr_80px_80px_80px] items-center px-6 py-5 ${i < NOTIFICATION_EVENTS.length - 1 ? 'border-b border-neutral-50' : ''} hover:bg-neutral-50/60 transition-colors`}>
                                            <span className="text-sm font-bold text-neutral-900">{event}</span>
                                            <div className="flex justify-center"><Toggle defaultOn /></div>
                                            <div className="flex justify-center"><Toggle defaultOn /></div>
                                            <div className="flex justify-center"><Toggle /></div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSave} className="mt-6 flex items-center gap-2 px-10 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-pink-dark transition-all shadow-md">
                                    <Check size={14} /> Save Preferences
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Bank Update Modal ── */}
            <AnimatePresence>
                {showBankModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => setShowBankModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-md rounded-sm p-10 shadow-2xl space-y-7">
                            <button onClick={() => setShowBankModal(false)} className="absolute top-5 right-5 text-neutral-300 hover:text-neutral-950 transition-colors">
                                <X size={18} />
                            </button>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink mb-3">Secure Verification</p>
                                <h3 className="text-2xl font-serif font-bold text-neutral-950">Update Bank Account</h3>
                                <p className="text-sm text-neutral-500 font-light leading-relaxed mt-2">
                                    You'll be redirected to Razorpay to verify your new bank details securely.
                                </p>
                            </div>
                            <div className="flex gap-3 p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                <Shield size={15} className="text-brand-pink shrink-0 mt-0.5" />
                                <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                                    Verification takes 1–2 minutes. Payouts will be paused during the process.
                                </p>
                            </div>
                            <button onClick={() => setShowBankModal(false)}
                                className="w-full flex items-center justify-center gap-2 py-5 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-brand-pink/20 hover:bg-brand-pink-dark transition-all">
                                <ExternalLink size={14} /> Proceed to Razorpay Connect
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CraftMakerLayout>
    );
};

export default AccountSettings;
