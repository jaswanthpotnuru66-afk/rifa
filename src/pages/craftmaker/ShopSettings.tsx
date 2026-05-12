import { useState } from 'react';
import { Check, Clock, AlertTriangle, Camera, Plus, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockMakerProfile } from '../../lib/craftmaker';

const SETTING_TABS = ['Shop Profile', 'Return Policy', 'Processing Time'];

const ShopSettings = () => {
    const [activeTab, setActiveTab] = useState('Shop Profile');
    const [profile, setProfile] = useState(mockMakerProfile);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1200);
    };

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Configuration</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Shop Settings</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Manage your shop presence, return policies, and processing defaults.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-10 border-b border-neutral-100 overflow-x-auto no-scrollbar pb-px">
                    {SETTING_TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'}`}
                        >
                            {tab}
                            {activeTab === tab && <motion.div layoutId="shopTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                        </button>
                    ))}
                </div>

                <div className="max-w-3xl">
                    <AnimatePresence mode="wait">

                        {activeTab === 'Shop Profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-10">

                                {/* Media uploads */}
                                <div className="grid md:grid-cols-3 gap-8 items-start">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Shop Logo</label>
                                        <div className="relative w-28 h-28 group cursor-pointer">
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-neutral-100 shadow-lg">
                                                <img src={profile.logoUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute inset-0 rounded-full bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-neutral-400 font-medium">Recommended: 400×400px</p>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Shop Banner</label>
                                        <div className="relative h-28 group cursor-pointer rounded-sm overflow-hidden border border-neutral-100 shadow-sm">
                                            <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-neutral-400 font-medium">Recommended: 1200×300px</p>
                                    </div>
                                </div>

                                {/* Form fields */}
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Basic Information</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Shop Name</label>
                                            <input type="text" value={profile.shopName} onChange={e => setProfile({...profile, shopName: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">URL Slug</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 text-xs font-medium">rifa.com/</span>
                                                <input type="text" value={profile.shopSlug} onChange={e => setProfile({...profile, shopSlug: e.target.value})}
                                                    className="w-full bg-neutral-50 border border-neutral-100 pl-20 pr-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Shop Description</label>
                                                <span className="text-[9px] font-medium text-neutral-300">{profile.description.length}/300</span>
                                            </div>
                                            <textarea rows={4} value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-light leading-relaxed outline-none focus:border-brand-pink transition-all resize-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Origin State</label>
                                            <div className="relative">
                                                <select value={profile.originState} onChange={e => setProfile({...profile, originState: e.target.value})}
                                                    className="w-full appearance-none bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all pr-10">
                                                    {['Rajasthan','Maharashtra','Karnataka','Delhi','Tamil Nadu','West Bengal'].map(s => <option key={s}>{s}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Craft Categories</label>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {profile.craftCategories.map(cat => (
                                                    <span key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-100 text-[10px] font-bold text-neutral-600 rounded-full">
                                                        {cat} <X size={10} className="cursor-pointer hover:text-red-500 transition-colors" />
                                                    </span>
                                                ))}
                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-dashed border-neutral-200 text-[10px] font-bold text-neutral-400 rounded-full hover:border-brand-pink hover:text-brand-pink transition-all">
                                                    <Plus size={10} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Shop Controls</h3>

                                    <div className="flex items-start justify-between gap-10 pb-6 border-b border-neutral-50">
                                        <div>
                                            <p className="text-sm font-bold text-neutral-950 mb-1">Accept Custom Orders</p>
                                            <p className="text-xs text-neutral-400 font-light leading-relaxed">Allow buyers to send custom order inquiries from your listing pages.</p>
                                        </div>
                                        <button onClick={() => setProfile({...profile, acceptsCustomOrders: !profile.acceptsCustomOrders})}
                                            className={`w-12 h-6 rounded-full relative shrink-0 transition-all ${profile.acceptsCustomOrders ? 'bg-brand-pink' : 'bg-neutral-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${profile.acceptsCustomOrders ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    {!profile.acceptsCustomOrders && (
                                        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-sm -mt-2">
                                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">Custom order forms will be hidden. Existing orders continue as normal.</p>
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between gap-10">
                                        <div>
                                            <p className="text-sm font-bold text-neutral-950 mb-1">Shop Visibility</p>
                                            <p className="text-xs text-neutral-400 font-light leading-relaxed">Temporarily pause your shop from the boutique without deleting listings.</p>
                                        </div>
                                        <div className="flex bg-neutral-100 p-1 rounded-sm shrink-0">
                                            {(['active', 'paused'] as const).map(s => (
                                                <button key={s} onClick={() => setProfile({...profile, status: s})}
                                                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${profile.status === s ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {profile.status === 'paused' && (
                                        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-sm -mt-2">
                                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">Your shop is hidden. No new orders will be placed. Existing orders continue.</p>
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleSave} disabled={isSaving}
                                    className="flex items-center gap-3 px-12 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-brand-pink/20 hover:bg-brand-pink-dark transition-all disabled:opacity-60">
                                    {isSaving ? <Clock size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Check size={14} />}
                                    {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'Return Policy' && (
                            <motion.div key="returns" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Default Return Window</h3>
                                    <div className="max-w-xs space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Return Window</label>
                                        <div className="relative">
                                            <select className="w-full appearance-none bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all pr-10">
                                                {['No returns','3 days','7 days','15 days'].map(o => <option key={o}>{o}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex items-start justify-between gap-10 py-6 border-y border-neutral-50">
                                        <div>
                                            <p className="text-sm font-bold text-neutral-950 mb-1">Accept Exchanges</p>
                                            <p className="text-xs text-neutral-400 font-light">Allow buyers to request a product exchange instead of a refund.</p>
                                        </div>
                                        <button className="w-12 h-6 rounded-full relative bg-brand-pink shrink-0">
                                            <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow left-7" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Additional Return Instructions</label>
                                            <span className="text-[9px] text-neutral-300">0/500</span>
                                        </div>
                                        <textarea rows={5} placeholder="Additional instructions shown to buyers during return requests…"
                                            className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-light outline-none focus:border-brand-pink transition-all resize-none" />
                                    </div>
                                    <button onClick={handleSave} className="flex items-center gap-2 px-10 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-pink-dark transition-all shadow-md">
                                        <Check size={14} /> Save Return Policy
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Processing Time' && (
                            <motion.div key="processing" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Default Processing Time</h3>
                                    <div className="max-w-xs space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Business Days</label>
                                        <div className="relative">
                                            <select value={profile.processingTime} onChange={e => setProfile({...profile, processingTime: parseInt(e.target.value)})}
                                                className="w-full appearance-none bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all pr-10">
                                                {[3,5,7,10,14].map(d => <option key={d} value={d}>{d} business days</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                                        <Clock size={14} className="text-neutral-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                                            This is your shop-wide default. You can override it per listing in the listing form.
                                        </p>
                                    </div>
                                    <button onClick={handleSave} className="flex items-center gap-2 px-10 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-pink-dark transition-all shadow-md">
                                        <Check size={14} /> Save Default
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default ShopSettings;
