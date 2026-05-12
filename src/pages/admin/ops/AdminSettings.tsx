import { useState } from 'react';
import { 
    Percent, CreditCard, 
    Truck, ShieldCheck, Clock, 
    RefreshCcw, Lock, ExternalLink,
    Database, Zap, AlertCircle
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockPlatformSettings } from '../../../lib/adminOps.mock';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState<'commission' | 'rules' | 'shipping' | 'integrations'>('commission');
    const [settings, setSettings] = useState(mockPlatformSettings);
    const [isConfirming, setIsConfirming] = useState(false);

    const tabs = [
        { id: 'commission', label: 'Commission & Fees', icon: Percent },
        { id: 'rules', label: 'Order & Proof Rules', icon: Clock },
        { id: 'shipping', label: 'Shipping & Couriers', icon: Truck },
        { id: 'integrations', label: 'Integrations', icon: Zap },
    ];

    const handleSave = () => {
        setIsConfirming(true);
    };

    const confirmSave = () => {
        setIsConfirming(false);
        // In a real app, this would be an API call
        alert("Settings saved successfully!");
    };

    const SettingField = ({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) => (
        <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</p>
            {children}
            {helper && <p className="text-[10px] text-neutral-400 font-medium italic">{helper}</p>}
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Governance Dashboard</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Platform Settings</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative pb-6 flex items-center gap-3 transition-all whitespace-nowrap ${
                                activeTab === tab.id ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="max-w-4xl">
                    {activeTab === 'commission' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <SettingField 
                                    label="Platform Commission Rate (%)" 
                                    helper="Changing this affects all new orders immediately. Existing orders are not affected."
                                >
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={settings.commissionRate}
                                            onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                                            className="w-full bg-white border border-neutral-100 p-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold">%</div>
                                    </div>
                                </SettingField>

                                <SettingField label="Listing Fee (₹ per listing)">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold">₹</div>
                                        <input 
                                            type="number" 
                                            value={settings.listingFee}
                                            onChange={(e) => setSettings({ ...settings, listingFee: Number(e.target.value) })}
                                            className="w-full bg-white border border-neutral-100 pl-8 pr-4 py-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                        />
                                    </div>
                                </SettingField>

                                <SettingField 
                                    label="TCS Rate (%)" 
                                    helper="Fixed by Indian Government (GST law). Cannot be changed."
                                >
                                    <div className="relative opacity-50 cursor-not-allowed">
                                        <input 
                                            type="text" 
                                            value="1%"
                                            readOnly
                                            className="w-full bg-neutral-50 border border-neutral-100 p-4 text-sm font-bold outline-none"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Lock size={14} className="text-neutral-400" />
                                        </div>
                                    </div>
                                </SettingField>
                            </div>

                            <button 
                                onClick={handleSave}
                                className="px-10 py-4 bg-brand-pink text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10"
                            >
                                Save Commission Settings
                            </button>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <SettingField 
                                    label="Proof Response Deadline (hours)" 
                                    helper="If buyer doesn't respond within this window, order auto-cancels. 90% refund to buyer, 10% design fee to maker."
                                >
                                    <input 
                                        type="number" 
                                        value={settings.proofResponseDeadlineHours}
                                        onChange={(e) => setSettings({ ...settings, proofResponseDeadlineHours: Number(e.target.value) })}
                                        className="w-full bg-white border border-neutral-100 p-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                    />
                                </SettingField>

                                <SettingField label="Max Proof Revision Rounds">
                                    <input 
                                        type="number" 
                                        value={settings.maxProofRevisionRounds}
                                        onChange={(e) => setSettings({ ...settings, maxProofRevisionRounds: Number(e.target.value) })}
                                        className="w-full bg-white border border-neutral-100 p-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                    />
                                </SettingField>

                                <SettingField label="Max Dispatch Window (business days)">
                                    <input 
                                        type="number" 
                                        value={settings.maxDispatchWindowDays}
                                        onChange={(e) => setSettings({ ...settings, maxDispatchWindowDays: Number(e.target.value) })}
                                        className="w-full bg-white border border-neutral-100 p-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                    />
                                </SettingField>

                                <SettingField label="COD for Custom Orders">
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-sm opacity-50">
                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Permanently Disabled</span>
                                        <Lock size={16} className="text-neutral-300" />
                                    </div>
                                </SettingField>
                            </div>

                            <button 
                                onClick={handleSave}
                                className="px-10 py-4 bg-brand-pink text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all"
                            >
                                Save Order Rules
                            </button>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <SettingField 
                                    label="Weight Buffer Tolerance (%)" 
                                    helper="Overage beyond this buffer is auto-deducted from Maker's payout."
                                >
                                    <input 
                                        type="number" 
                                        value={settings.shippingWeightBufferPercent}
                                        onChange={(e) => setSettings({ ...settings, shippingWeightBufferPercent: Number(e.target.value) })}
                                        className="w-full bg-white border border-neutral-100 p-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                    />
                                </SettingField>

                                <SettingField 
                                    label="Strikes Before Lockout" 
                                    helper="Number of weight mismatches before a maker is restricted from listing."
                                >
                                    <input 
                                        type="number" 
                                        value={3}
                                        className="w-full bg-white border border-neutral-100 p-4 text-sm font-bold focus:border-brand-pink outline-none transition-all"
                                    />
                                </SettingField>
                            </div>

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-2">Active Couriers</h3>
                                <div className="space-y-3">
                                    {settings.activeCouriers.map(courier => (
                                        <div key={courier} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-sm group hover:border-brand-pink/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-brand-pink">
                                                    <Truck size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-neutral-900">{courier}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-green-600">Active</span>
                                                <div className="w-10 h-6 rounded-full bg-green-500 relative cursor-pointer">
                                                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <button 
                                onClick={handleSave}
                                className="px-10 py-4 bg-brand-pink text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all"
                            >
                                Save Shipping Settings
                            </button>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                            {[
                                { name: 'Razorpay', status: 'Connected', icon: CreditCard, color: 'text-blue-600', items: ['Payment Capture', 'Razorpay Route (Split Payouts)', 'Refund API', 'TCS Auto-deduction'] },
                                { name: 'Shiprocket', status: 'Connected', icon: Truck, color: 'text-indigo-600', items: ['Rate Calculator', 'Label Generation', 'Live Tracking Webhooks', 'Weight Discrepancy API'] },
                                { name: 'Supabase', status: 'Connected', icon: Database, color: 'text-emerald-600', items: ['Admins Table', 'Inquiries Table', 'Creator Applications'] }
                            ].map(integration => (
                                <div key={integration.name} className="bg-white border border-neutral-100 rounded-sm p-8 group hover:border-brand-pink/30 transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div className="flex gap-6">
                                            <div className={`w-14 h-14 rounded-sm bg-neutral-50 flex items-center justify-center ${integration.color} border border-neutral-100`}>
                                                <integration.icon size={28} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-serif font-bold text-neutral-950">{integration.name}</h3>
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-widest rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        {integration.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Enterprise API Integration</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="px-4 py-2 border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 hover:border-neutral-950 transition-all">
                                                Test Connection
                                            </button>
                                            <button className="p-2 text-neutral-300 hover:text-brand-pink transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {integration.items.map(item => (
                                            <div key={item} className="flex items-center gap-2">
                                                <ShieldCheck size={12} className="text-green-500" />
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {integration.name === 'Supabase' && (
                                        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-4">
                                            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed uppercase tracking-tight">
                                                The CraftMaker portal currently uses mock data layer. Supabase migration for the production schema is scheduled for Phase 2 implementation.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirmation Modal */}
                {isConfirming && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setIsConfirming(false)} />
                        <div className="relative bg-white max-w-md w-full p-10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                            <RefreshCcw size={48} className="text-brand-pink mx-auto mb-6" />
                            <h3 className="text-2xl font-serif font-bold text-neutral-950 mb-4">Confirm Changes</h3>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">
                                You are about to update platform-wide settings. These changes will take effect immediately and will be logged with your administrator ID.
                                <br/><br/>
                                <strong>Are you sure you want to proceed?</strong>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmSave}
                                    className="w-full py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink-dark transition-all"
                                >
                                    Confirm Changes
                                </button>
                                <button 
                                    onClick={() => setIsConfirming(false)}
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

export default AdminSettings;
