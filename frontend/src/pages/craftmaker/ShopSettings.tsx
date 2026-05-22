import { useState, useEffect, useRef } from 'react';
import { Check, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';

const SETTING_TABS = ['Shop Profile', 'Return Policy', 'Processing Time'];

const ShopSettings = () => {
    const [activeTab, setActiveTab] = useState('Shop Profile');
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await api.getArtisanStats();
            if (data) {
                setProfile(data.artisan);
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await api.updateArtisanProfile(profile);
        setIsSaving(false);
        if (!res.error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } else {
            alert('Failed to save settings: ' + res.error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'img' | 'process_img') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile({ ...profile, [field]: reader.result as string });
        };
        reader.readAsDataURL(file);
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

    if (!profile) {
        return (
            <CraftMakerLayout>
                <div className="text-center p-20">
                    <p className="text-neutral-500">Could not load artisan profile.</p>
                </div>
            </CraftMakerLayout>
        );
    }

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'img')} accept="image/*" />
                <input type="file" ref={bannerInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'process_img')} accept="image/*" />

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
                                        <div className="relative w-28 h-28 group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-neutral-100 shadow-lg bg-neutral-50">
                                                {profile.img ? (
                                                    <img loading="lazy" src={profile.img} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-200 uppercase font-black">{profile.name.substring(0, 2)}</div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 rounded-full bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-neutral-400 font-medium">Recommended: 400×400px</p>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Shop Banner</label>
                                        <div className="relative h-28 group cursor-pointer rounded-sm overflow-hidden border border-neutral-100 shadow-sm bg-neutral-50" onClick={() => bannerInputRef.current?.click()}>
                                            {profile.process_img ? (
                                                <img loading="lazy" src={profile.process_img} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-200 font-serif italic uppercase">No Banner Set</div>
                                            )}
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
                                            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Specialty</label>
                                            <input type="text" value={profile.specialty || ''} onChange={e => setProfile({...profile, specialty: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Shop Story</label>
                                                <span className="text-[9px] font-medium text-neutral-300">{(profile.story || '').length}/2000</span>
                                            </div>
                                            <textarea rows={4} value={profile.story || ''} onChange={e => setProfile({...profile, story: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-light leading-relaxed outline-none focus:border-brand-pink transition-all resize-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Location</label>
                                            <input type="text" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">PIN Code (for Shipping calc)</label>
                                            <input type="text" value={profile.pincode || ''} maxLength={6} onChange={e => setProfile({...profile, pincode: e.target.value.replace(/\D/g, '')})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-950">Quote (Optional)</label>
                                            <input type="text" value={profile.quote || ''} onChange={e => setProfile({...profile, quote: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleSave} disabled={isSaving}
                                    className="flex items-center gap-3 px-12 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-brand-pink/20 hover:bg-brand-pink-dark transition-all disabled:opacity-60">
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Check size={14} />}
                                    {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'Return Policy' && (
                            <motion.div key="returns" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6 text-center py-20">
                                    <h3 className="text-neutral-300 font-serif italic">Global Return Policies are managed by Admin for compliance.</h3>
                                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mt-4">Contact support to request custom policy overrides.</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Processing Time' && (
                            <motion.div key="processing" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                                <div className="bg-white border border-neutral-100 rounded-sm shadow-sm p-8 space-y-6 text-center py-20">
                                    <h3 className="text-neutral-300 font-serif italic">Processing times are now set per listing for better accuracy.</h3>
                                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mt-4">Visit 'My Listings' to update individual SLAs.</p>
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
