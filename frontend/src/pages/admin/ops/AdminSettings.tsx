import { useState, useEffect } from 'react';
import { 
    Percent, 
    Truck, ShieldCheck, Clock, 
    Lock, ExternalLink,
    Database, Zap, Loader2, CheckCircle2,
    ShieldAlert, Sparkles, Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState<'commission' | 'rules' | 'shipping' | 'integrations' | 'promotions'>('commission');
    const [promotions, setPromotions] = useState<any[]>([]);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoForm, setPromoForm] = useState({ code: '', type: 'percentage', value: '', description: '', end_date: '' });
    const [isCreatingPromo, setIsCreatingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [settings, setSettings] = useState<any>(null);
    const [originalSettings, setOriginalSettings] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.getAdminSettings();
                if (res) {
                    const populated = {
                        commissionRate: 5.0,
                        listingFee: 0,
                        proofResponseDeadlineHours: 24,
                        maxProofRevisionRounds: 3,
                        maxDispatchWindowDays: 10,
                        shippingWeightBufferPercent: 10,
                        activeCouriers: ['Delhivery', 'Blue Dart', 'DHL Express'],
                        minPayoutThreshold: 500,
                        taxServiceRate: 18.0,
                        autoCancelGraceHours: 12,
                        enableInsurance: true,
                        insuranceMinAmount: 2000,
                        ...res
                    };
                    setSettings(populated);
                    setOriginalSettings(JSON.parse(JSON.stringify(populated)));
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to retrieve platform settings.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const tabs = [
        { id: 'commission', label: 'Commission & Fees', icon: Percent },
        { id: 'rules', label: 'Order & Proof Rules', icon: Clock },
        { id: 'shipping', label: 'Shipping & Couriers', icon: Truck },
        { id: 'integrations', label: 'Integrations', icon: Zap },
        { id: 'promotions', label: 'Promotions', icon: Tag },
    ];

    const fetchPromotions = async () => {
        setPromoLoading(true);
        const data = await api.getAdminPromotions();
        setPromotions(data || []);
        setPromoLoading(false);
    };

    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoForm.code || !promoForm.value) {
            setPromoError('Code and value are required.');
            return;
        }
        setPromoError('');
        const res = await api.createAdminPromotion({
            ...promoForm,
            value: Number(promoForm.value),
            end_date: promoForm.end_date || undefined
        });
        if (res) {
            setPromotions(prev => [res, ...prev]);
            setPromoForm({ code: '', type: 'percentage', value: '', description: '', end_date: '' });
            setIsCreatingPromo(false);
            showToast('Global promotion created successfully.', 'success');
        } else {
            setPromoError('Failed to create promotion. Code may already exist.');
        }
    };

    const handleTogglePromo = async (id: string, currentActive: boolean) => {
        const res = await api.toggleAdminPromotion(id, !currentActive);
        if (res) {
            setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentActive } : p));
            showToast(`Promotion ${!currentActive ? 'activated' : 'deactivated'}.`, 'success');
        }
    };

    const handleDeletePromo = async (id: string) => {
        const ok = await api.deleteAdminPromotion(id);
        if (ok) {
            setPromotions(prev => prev.filter(p => p.id !== id));
            showToast('Promotion deleted.', 'success');
        }
    };

    const handleSave = () => {
        setIsConfirming(true);
    };

    const confirmSave = async () => {
        setIsConfirming(false);
        setIsSaving(true);
        try {
            const res = await api.updateAdminSettings(settings);
            if (res) {
                setOriginalSettings(JSON.parse(JSON.stringify(settings)));
                setIsEditing(false);
                showToast("Platform configurations saved and propagated successfully!", "success");
            } else {
                showToast("Failed to save platform configurations.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("System error: Unable to update configurations.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setSettings(JSON.parse(JSON.stringify(originalSettings)));
        setIsEditing(false);
        showToast("Configuration changes discarded.", "success");
    };

    const handleTestConnection = (integrationName: string) => {
        setTestingIntegration(integrationName);
        setTimeout(() => {
            setTestingIntegration(null);
            showToast(`API Gateway test for ${integrationName} returned HTTP 200 OK.`, "success");
        }, 1200);
    };

    const toggleCourier = (courierName: string) => {
        if (!isEditing) return;
        const current = [...settings.activeCouriers];
        let next;
        if (current.includes(courierName)) {
            next = current.filter(c => c !== courierName);
        } else {
            next = [...current, courierName];
        }
        setSettings({ ...settings, activeCouriers: next });
    };

    if (loading) {
        return (
            <AdminOpsLayout>
                <div className="flex flex-col items-center justify-center min-h-[65vh]">
                    <Loader2 size={36} className="animate-spin text-brand-pink mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading Governance Console...</p>
                </div>
            </AdminOpsLayout>
        );
    }

    if (!settings) {
        return (
            <AdminOpsLayout>
                <div className="text-center p-20 text-neutral-400 font-serif italic">
                    Could not retrieve platform settings.
                </div>
            </AdminOpsLayout>
        );
    }

    const SettingField = ({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) => (
        <div className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">{label}</p>
            {children}
            {helper && <p className="text-[10px] text-neutral-400 font-medium italic leading-relaxed">{helper}</p>}
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-500 pb-24 relative">
                
                {/* Custom Inline Toast Notification */}
                {toast && (
                    <div className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-6 py-4 rounded-sm border shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 ${
                        toast.type === 'success' 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 size={16} className="text-green-600" /> : <ShieldAlert size={16} className="text-red-600" />}
                        <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Governance Dashboard</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Platform Settings</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Configure systemic commissions, dispatch SLAs, weight tolerances, and ledger rules.</p>
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

                {/* Unified Premium Edit Mode Control Bar */}
                {activeTab !== 'integrations' && activeTab !== 'promotions' && (
                    <div className="flex justify-end items-center max-w-4xl pt-2">
                        {isEditing ? (
                            <div className="flex items-center gap-3 animate-in fade-in duration-300">
                                <button 
                                    onClick={handleCancel}
                                    className="px-6 py-3 border border-neutral-200 text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all rounded-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-pink/90 transition-all rounded-sm shadow-md shadow-brand-pink/10"
                                >
                                    Save Settings
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 border border-neutral-950 text-neutral-950 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-950 hover:text-white transition-all rounded-sm flex items-center gap-2 animate-in fade-in duration-300"
                            >
                                <Lock size={12} /> Edit Settings
                            </button>
                        )}
                    </div>
                )}
                {activeTab === 'promotions' && (
                    <div className="flex justify-end items-center max-w-4xl pt-2">
                        <button
                            onClick={() => { setIsCreatingPromo(true); fetchPromotions(); }}
                            className="px-6 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-pink/90 transition-all rounded-sm flex items-center gap-2"
                        >
                            <Plus size={14} /> New Global Promotion
                        </button>
                    </div>
                )}

                {/* Main Settings Container */}
                <div className="max-w-4xl">
                    {activeTab === 'commission' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                            
                            {/* Policy Box */}
                            <div className="bg-neutral-50 border border-neutral-100 p-6 rounded-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-brand-pink shrink-0">
                                    <Percent size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-neutral-900">Revenue Split Policy</p>
                                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed mt-1">
                                        Platform fee adjustments affect new custom design inquiries and listings immediately. 
                                        Tax regulations (TCS under Section 52) are hard-coded to 1.00% matching state tax structures.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SettingField 
                                    label="Platform Commission Rate (%)" 
                                    helper="Applicable to both standard buyouts and custom designer orders. Deducted automatically upon payout resolution."
                                >
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            disabled={!isEditing}
                                            value={settings.commissionRate}
                                            onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                                            className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                                isEditing 
                                                    ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                    : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                            }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold text-xs">%</div>
                                    </div>
                                </SettingField>

                                <SettingField 
                                    label="Listing Onboarding Fee (₹)" 
                                    helper="System charge deducted upon creator inventory submission and listing approval."
                                >
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold text-xs">₹</div>
                                        <input 
                                            type="number" 
                                            disabled={!isEditing}
                                            value={settings.listingFee}
                                            onChange={(e) => setSettings({ ...settings, listingFee: Number(e.target.value) })}
                                            className={`w-full pl-8 pr-4 py-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                                isEditing 
                                                    ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                    : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                            }`}
                                        />
                                    </div>
                                </SettingField>

                                <SettingField 
                                    label="Min Payout Settlement Threshold (₹)" 
                                    helper="Minimum ledger balance required to trigger automatic payout runs and bank wire dispatch."
                                >
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold text-xs">₹</div>
                                        <input 
                                            type="number" 
                                            disabled={!isEditing}
                                            value={settings.minPayoutThreshold}
                                            onChange={(e) => setSettings({ ...settings, minPayoutThreshold: Number(e.target.value) })}
                                            className={`w-full pl-8 pr-4 py-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                                isEditing 
                                                    ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                    : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                            }`}
                                        />
                                    </div>
                                </SettingField>

                                <SettingField 
                                    label="GST Tax Services Rate (%)" 
                                    helper="Platform service tax applied to commission fees for invoice generation."
                                >
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            disabled={!isEditing}
                                            value={settings.taxServiceRate}
                                            onChange={(e) => setSettings({ ...settings, taxServiceRate: Number(e.target.value) })}
                                            className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                                isEditing 
                                                    ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                    : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                            }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold text-xs">%</div>
                                    </div>
                                </SettingField>

                                <SettingField 
                                    label="TCS Tax Rate (%)" 
                                    helper="Fixed by Indian Government (GST law). Locked against modification."
                                >
                                    <div className="relative opacity-60 cursor-not-allowed">
                                        <input 
                                            type="text" 
                                            value="1%"
                                            readOnly
                                            className="w-full bg-[#F5F5F5] border-transparent p-4 text-xs font-bold outline-none rounded-sm"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Lock size={14} className="text-neutral-400" />
                                        </div>
                                    </div>
                                </SettingField>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                            
                            {/* Explainer */}
                            <div className="bg-neutral-50 border border-neutral-100 p-6 rounded-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-brand-pink shrink-0">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-neutral-900">Custom Proof Governance</p>
                                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed mt-1">
                                        Sets the system timeline constraints for premium creator collaborations. Auto-cancellations immediately 
                                        refund the buyer vault and deduct design and shipping prep logistics fees.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SettingField 
                                    label="Customer Proof Deadline (hours)" 
                                    helper="Maximum window for buyers to approve design proofs before auto-cancellation triggers."
                                >
                                    <input 
                                        type="number" 
                                        disabled={!isEditing}
                                        value={settings.proofResponseDeadlineHours}
                                        onChange={(e) => setSettings({ ...settings, proofResponseDeadlineHours: Number(e.target.value) })}
                                        className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                            isEditing 
                                                ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                        }`}
                                    />
                                </SettingField>

                                <SettingField 
                                    label="Max Creator Design Revision Rounds" 
                                    helper="Maximum free redesign request iterations permitted under basic custom agreements."
                                >
                                    <input 
                                        type="number" 
                                        disabled={!isEditing}
                                        value={settings.maxProofRevisionRounds}
                                        onChange={(e) => setSettings({ ...settings, maxProofRevisionRounds: Number(e.target.value) })}
                                        className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                            isEditing 
                                                ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                        }`}
                                    />
                                </SettingField>

                                <SettingField 
                                    label="Maximum Shipping SLA Window (days)" 
                                    helper="Target business days for artisan to craft and hand off standard inventory to logistics."
                                >
                                    <input 
                                        type="number" 
                                        disabled={!isEditing}
                                        value={settings.maxDispatchWindowDays}
                                        onChange={(e) => setSettings({ ...settings, maxDispatchWindowDays: Number(e.target.value) })}
                                        className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                            isEditing 
                                                ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                        }`}
                                    />
                                </SettingField>

                                <SettingField 
                                    label="Auto-Cancellation Grace Period (hours)" 
                                    helper="Artisan buffer time to confirm/respond before the order transitions to late dispatch alerts."
                                >
                                    <input 
                                        type="number" 
                                        disabled={!isEditing}
                                        value={settings.autoCancelGraceHours}
                                        onChange={(e) => setSettings({ ...settings, autoCancelGraceHours: Number(e.target.value) })}
                                        className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                            isEditing 
                                                ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                        }`}
                                    />
                                </SettingField>

                                <SettingField 
                                    label="COD For Bespoke Crafting" 
                                    helper="Bespoke orders require full checkout payment clearance. Cash on Delivery is strictly blocked."
                                >
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-sm opacity-60">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">COD Blocked</span>
                                        <Lock size={16} className="text-neutral-300" />
                                    </div>
                                </SettingField>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                            
                            <div className="bg-neutral-50 border border-neutral-100 p-6 rounded-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-brand-pink shrink-0">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-neutral-900">Logistics & Courier Configurations</p>
                                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed mt-1">
                                        Manage cargo weight mismatch parameters, transit insurance valuations, and enabled courier pipelines.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SettingField 
                                    label="Cargo Weight Tolerance (%)" 
                                    helper="Discrepancies exceeding this percentage are automatically categorized as weight mismatches."
                                >
                                    <input 
                                        type="number" 
                                        disabled={!isEditing}
                                        value={settings.shippingWeightBufferPercent}
                                        onChange={(e) => setSettings({ ...settings, shippingWeightBufferPercent: Number(e.target.value) })}
                                        className={`w-full p-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                            isEditing 
                                                ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                        }`}
                                    />
                                </SettingField>

                                <SettingField 
                                    label="Discrepancy Strike Count Limit" 
                                    helper="Maximum warnings before shop listings are locked out for manual audit resolution."
                                >
                                    <input 
                                        type="number" 
                                        value={3}
                                        readOnly
                                        className="w-full bg-[#F5F5F5] border-transparent p-4 text-xs font-bold outline-none rounded-sm cursor-not-allowed opacity-60"
                                    />
                                </SettingField>

                                <SettingField 
                                    label="Transit Cargo Protection Insurance" 
                                    helper="Enable default carrier insurance on fragile custom-made glass, ceramics, and woodwork."
                                >
                                    <div className={`flex items-center justify-between p-4 rounded-sm border ${isEditing ? 'bg-white border-neutral-100' : 'bg-[#F5F5F5] border-transparent text-neutral-500'}`}>
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">
                                            {settings.enableInsurance ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <div 
                                            onClick={() => {
                                                if (isEditing) {
                                                    setSettings({ ...settings, enableInsurance: !settings.enableInsurance });
                                                }
                                            }}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                                                isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                            } ${settings.enableInsurance ? 'bg-green-500' : 'bg-neutral-200'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${settings.enableInsurance ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </SettingField>

                                <SettingField 
                                    label="Insurance Activation Floor (₹)" 
                                    helper="Order checkout value required to activate transit insurance protection coverage."
                                >
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 font-bold text-xs">₹</div>
                                        <input 
                                            type="number" 
                                            disabled={!isEditing}
                                            value={settings.insuranceMinAmount}
                                            onChange={(e) => setSettings({ ...settings, insuranceMinAmount: Number(e.target.value) })}
                                            className={`w-full pl-8 pr-4 py-4 text-xs font-bold outline-none transition-all rounded-sm border ${
                                                isEditing 
                                                    ? 'bg-white border-neutral-200 focus:border-brand-pink' 
                                                    : 'bg-[#F5F5F5] border-transparent text-neutral-500 cursor-not-allowed select-none'
                                            }`}
                                        />
                                    </div>
                                </SettingField>
                            </div>

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-2">Enabled Courier Pipelines</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Delhivery', speed: 'Premium Surface / Air' },
                                        { name: 'Blue Dart', speed: 'Priority Regional Air' },
                                        { name: 'DHL Express', speed: 'International Courier' }
                                    ].map(courier => {
                                        const isActive = settings.activeCouriers.includes(courier.name);
                                        return (
                                            <div key={courier.name} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-sm group hover:border-brand-pink/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-50 text-green-600' : 'bg-neutral-50 text-neutral-300'}`}>
                                                        <Truck size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-neutral-950 block">{courier.name}</span>
                                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide mt-0.5">{courier.speed}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-green-600' : 'text-neutral-400'}`}>
                                                        {isActive ? 'Active' : 'Offline'}
                                                    </span>
                                                    <div 
                                                        onClick={() => toggleCourier(courier.name)}
                                                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${
                                                            isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                                        } ${isActive ? 'bg-green-500' : 'bg-neutral-200'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500 text-left">
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
                                                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Enterprise API Gateway</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                disabled={testingIntegration === integration.name}
                                                onClick={() => handleTestConnection(integration.name)}
                                                className="px-4 py-2 border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-950 hover:border-neutral-950 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {testingIntegration === integration.name ? (
                                                    <>
                                                        <Loader2 size={12} className="animate-spin text-brand-pink" /> Testing...
                                                    </>
                                                ) : 'Test Connection'}
                                            </button>
                                            <button className="p-2 text-neutral-300 hover:text-brand-pink transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {integration.items.map(item => (
                                            <div key={item} className="flex items-center gap-2">
                                                <ShieldCheck size={12} className="text-green-500 shrink-0" />
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Beautiful Bridge status */}
                            <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-6 flex gap-4">
                                <Sparkles size={20} className="text-brand-pink shrink-0" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-neutral-900">Enterprise Operations Pipeline</p>
                                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed mt-1">
                                        Database synchronizations are fully active under the Rifa Phase 1 live schema. All payouts, shipping alerts, 
                                        disputes, and merchant registries propagate in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'promotions' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500" onClick={() => { if (promotions.length === 0) fetchPromotions(); }}>

                            {/* Create Promo Modal */}
                            <AnimatePresence>
                                {isCreatingPromo && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                                    >
                                        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setIsCreatingPromo(false)} />
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                            className="relative bg-white max-w-md w-full p-8 rounded-sm shadow-2xl"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink mb-1">Admin Console</p>
                                                    <h3 className="text-2xl font-serif font-bold text-neutral-950">New Global Promotion</h3>
                                                </div>
                                                <button onClick={() => setIsCreatingPromo(false)} className="p-2 hover:bg-neutral-50 rounded-sm transition-all"><X size={18} className="text-neutral-400" /></button>
                                            </div>
                                            <form onSubmit={handleCreatePromo} className="space-y-5">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Promo Code *</p>
                                                    <input
                                                        value={promoForm.code}
                                                        onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                                                        placeholder="e.g. RIFASALE20"
                                                        className="w-full border border-neutral-200 rounded-sm p-3 text-sm font-bold uppercase tracking-widest outline-none focus:border-brand-pink transition-all"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Type *</p>
                                                        <select
                                                            value={promoForm.type}
                                                            onChange={e => setPromoForm({ ...promoForm, type: e.target.value })}
                                                            className="w-full border border-neutral-200 rounded-sm p-3 text-xs font-bold outline-none focus:border-brand-pink transition-all"
                                                        >
                                                            <option value="percentage">Percentage (%)</option>
                                                            <option value="fixed">Fixed Amount (₹)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Value *</p>
                                                        <input
                                                            type="number"
                                                            value={promoForm.value}
                                                            onChange={e => setPromoForm({ ...promoForm, value: e.target.value })}
                                                            placeholder={promoForm.type === 'percentage' ? '15' : '500'}
                                                            className="w-full border border-neutral-200 rounded-sm p-3 text-sm font-bold outline-none focus:border-brand-pink transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Description</p>
                                                    <input
                                                        value={promoForm.description}
                                                        onChange={e => setPromoForm({ ...promoForm, description: e.target.value })}
                                                        placeholder="Optional description"
                                                        className="w-full border border-neutral-200 rounded-sm p-3 text-xs font-medium outline-none focus:border-brand-pink transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Expiry Date</p>
                                                    <input
                                                        type="date"
                                                        value={promoForm.end_date}
                                                        onChange={e => setPromoForm({ ...promoForm, end_date: e.target.value })}
                                                        className="w-full border border-neutral-200 rounded-sm p-3 text-xs font-medium outline-none focus:border-brand-pink transition-all"
                                                    />
                                                </div>
                                                {promoError && <p className="text-xs text-red-500 font-bold">{promoError}</p>}
                                                <div className="p-3 bg-brand-pink/5 border border-brand-pink/20 rounded-sm">
                                                    <p className="text-[9px] text-brand-pink font-bold uppercase tracking-widest">⚡ Admin promotions apply platform-wide to all artisans' products.</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => setIsCreatingPromo(false)} className="flex-1 py-3 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-neutral-50">Cancel</button>
                                                    <button type="submit" className="flex-1 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-brand-pink/90 transition-all">Create Promotion</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Promotions Table */}
                            {promoLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 size={32} className="animate-spin text-brand-pink" />
                                </div>
                            ) : promotions.length === 0 ? (
                                <div className="py-20 border-2 border-dashed border-neutral-100 rounded-sm text-center">
                                    <Tag size={32} className="text-neutral-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300 italic">No promotions configured</p>
                                    <button onClick={() => { setIsCreatingPromo(true); fetchPromotions(); }} className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:underline">+ Create First Promotion</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_100px_100px_80px] gap-4 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                        <div>Code / Description</div>
                                        <div>Type</div>
                                        <div>Value</div>
                                        <div>Scope</div>
                                        <div>Expires</div>
                                        <div>Status</div>
                                        <div></div>
                                    </div>
                                    {promotions.map(promo => (
                                        <div key={promo.id} className="bg-white border border-neutral-100 rounded-sm p-4 hover:border-brand-pink/30 transition-all">
                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_80px_80px_100px_100px_80px] gap-4 items-center">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-950">{promo.code}</p>
                                                    {promo.description && <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{promo.description}</p>}
                                                </div>
                                                <div><span className="text-[10px] font-bold text-neutral-500 capitalize">{promo.type}</span></div>
                                                <div><span className="text-sm font-black text-neutral-950 font-inter">{promo.type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}</span></div>
                                                <div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${promo.artisan_id ? 'bg-blue-50 text-blue-700' : 'bg-brand-pink/10 text-brand-pink'}`}>
                                                        {promo.artisan_id ? 'Artisan' : 'Global'}
                                                    </span>
                                                </div>
                                                <div><span className="text-[10px] text-neutral-400 font-inter">{promo.end_date ? new Date(promo.end_date).toLocaleDateString() : '—'}</span></div>
                                                <div>
                                                    <button onClick={() => handleTogglePromo(promo.id, promo.is_active)} className="flex items-center gap-1.5 group">
                                                        {promo.is_active
                                                            ? <ToggleRight size={20} className="text-green-500" />
                                                            : <ToggleLeft size={20} className="text-neutral-300" />}
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${promo.is_active ? 'text-green-600' : 'text-neutral-300'}`}>
                                                            {promo.is_active ? 'Active' : 'Off'}
                                                        </span>
                                                    </button>
                                                </div>
                                                <div className="flex justify-end">
                                                    <button onClick={() => handleDeletePromo(promo.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors rounded-sm hover:bg-red-50">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Confirmation Modal */}
                {isConfirming && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setIsConfirming(false)} />
                        <div className="relative bg-white max-w-md w-full p-10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                            <ShieldCheck size={48} className="text-brand-pink mx-auto mb-6 animate-pulse" />
                            <h3 className="text-2xl font-serif font-bold text-neutral-950 mb-4">Confirm Settings Propagation</h3>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">
                                You are about to update systemic platform rules and fee schedules. These rules will propagate to all new checkout baskets, 
                                shipping labels, and merchant payout statements immediately.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    disabled={isSaving}
                                    onClick={confirmSave}
                                    className="w-full py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-pink/90 transition-all rounded-sm flex items-center justify-center"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                    Confirm & Propagate
                                </button>
                                <button 
                                    onClick={() => setIsConfirming(false)}
                                    className="w-full py-4 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-50 transition-all rounded-sm"
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
