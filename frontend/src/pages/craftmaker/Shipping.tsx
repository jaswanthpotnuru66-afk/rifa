import { useState } from 'react';
import { 
    Truck, Clock, Ban, MapPin, Scale, Edit2, Check, X, AlertTriangle, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockMakerProfile, mockShipments } from '../../lib/craftmaker';

const POLICIES = [
    { icon: Truck,  title: 'Courier Assignment',  body: 'Rifa assigns couriers automatically via Shiprocket based on your origin PIN and buyer\'s delivery PIN. You do not choose couriers.' },
    { icon: Clock,  title: 'Dispatch Window',     body: 'You must dispatch within 2 business days of order confirmation. Late dispatch = warning. 3 warnings = account review.' },
    { icon: Ban,    title: 'COD Policy',           body: 'COD is automatically disabled for all customisable listings. This cannot be overridden by any setting.' },
    { icon: MapPin, title: 'Self-Dropoff',         body: 'If pickup fails, re-request pickup (available after 4 hours) or self-dropoff at your nearest courier hub.' },
    { icon: Scale,  title: 'Weight Accuracy',      body: 'If actual billed weight exceeds declared weight by more than 10%, the difference is automatically deducted from your payout.' },
];

const Shipping = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(mockMakerProfile);

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Logistics</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Shipping & Logistics</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Manage origin details and track your shipment history.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left: Profile + Shipment history */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {/* Section 1: Shipping Profile */}
                        <section className="bg-white border border-neutral-100 rounded-sm shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-50">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Origin Profile</h2>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:opacity-70 transition-opacity">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                )}
                            </div>
                            <div className="p-8">
                                {isEditing ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Origin PIN</label>
                                                <input type="text" value={profile.shippingOriginPin} onChange={e => setProfile({...profile, shippingOriginPin: e.target.value})}
                                                    className="w-full bg-neutral-50 border border-neutral-100 p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">City</label>
                                                <input type="text" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})}
                                                    className="w-full bg-neutral-50 border border-neutral-100 p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Address Line 1</label>
                                            <input type="text" defaultValue="Sector 4, Mansarovar"
                                                className="w-full bg-neutral-50 border border-neutral-100 p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">State</label>
                                            <select value={profile.originState} onChange={e => setProfile({...profile, originState: e.target.value})}
                                                className="w-full bg-neutral-50 border border-neutral-100 p-3.5 text-sm font-bold outline-none focus:border-brand-pink appearance-none">
                                                {['Rajasthan','Maharashtra','Karnataka','Delhi','Tamil Nadu','West Bengal'].map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-brand-pink-dark transition-all shadow-md">
                                                <Check size={14} /> Save Changes
                                            </button>
                                            <button onClick={() => setIsEditing(false)} className="px-8 py-4 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:text-neutral-950 transition-all flex items-center gap-1.5">
                                                <X size={14} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                        {[
                                            { label: 'PIN Code', val: profile.shippingOriginPin },
                                            { label: 'City',     val: profile.city },
                                            { label: 'Address',  val: 'Sector 4, Mansarovar' },
                                            { label: 'State',    val: profile.originState },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">{item.label}</p>
                                                <p className="text-sm font-bold text-neutral-950">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Section 2: Delivery Profiles */}
                        <section className="bg-white border border-neutral-100 rounded-sm shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-50">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Delivery Profiles</h2>
                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:opacity-70 transition-opacity">
                                    <Plus size={12} /> Add Rule
                                </button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="border border-neutral-100 rounded-sm p-5 hover:border-brand-pink/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-neutral-950">Standard Delivery</p>
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-1 rounded-sm">Default</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-4">Applies to all domestic zones (Local, Metro, ROI).</p>
                                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Base Rate</p>
                                            <p className="text-sm font-black text-neutral-900">₹80</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Free Over</p>
                                            <p className="text-sm font-black text-brand-pink">₹2,000</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-neutral-100 rounded-sm p-5 hover:border-brand-pink/20 transition-all cursor-pointer opacity-70">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-neutral-950">Express Air (2-Day)</p>
                                        <button className="text-neutral-400 hover:text-neutral-900"><Edit2 size={12} /></button>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-4">Applies to Metro and Tier-1 cities only.</p>
                                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Base Rate</p>
                                            <p className="text-sm font-black text-neutral-900">₹250</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Free Over</p>
                                            <p className="text-sm font-medium text-neutral-500">—</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Shipment History */}
                        <section>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-5">Shipment History</h2>
                            <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-neutral-50 border-b border-neutral-100">
                                            <tr>
                                                {['AWB', 'Order ID', 'Courier', 'Zone', 'Declared', 'Billed', 'Adj.', 'Status'].map(h => (
                                                    <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50">
                                            {mockShipments.map(s => (
                                                <tr key={s.awb} className="hover:bg-neutral-50/80 transition-colors">
                                                    <td className="px-5 py-4 text-xs font-black text-neutral-900">{s.awb}</td>
                                                    <td className="px-5 py-4 text-xs font-medium text-neutral-500">{s.orderId}</td>
                                                    <td className="px-5 py-4 text-xs font-bold text-neutral-900">{s.courier}</td>
                                                    <td className="px-5 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-tight">{s.destZone}</td>
                                                    <td className="px-5 py-4 text-xs text-neutral-500">{s.declaredWeight}g</td>
                                                    <td className="px-5 py-4 text-xs font-bold text-neutral-900">{s.billedWeight}g</td>
                                                    <td className={`px-5 py-4 text-xs font-black ${s.adjustment < 0 ? 'text-red-600' : 'text-neutral-300'}`}>
                                                        {s.adjustment < 0 ? `−₹${Math.abs(s.adjustment)}` : '—'}
                                                    </td>
                                                    <td className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{s.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Policies */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-5">Platform Policies</h2>
                        {POLICIES.map((policy, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                                className="bg-white border border-neutral-100 rounded-sm p-5 shadow-sm group hover:border-brand-pink/20 hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="w-9 h-9 rounded-sm bg-brand-pink/5 flex items-center justify-center text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all shrink-0">
                                        <policy.icon size={16} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-950 mb-1.5">{policy.title}</p>
                                        <p className="text-[11px] text-neutral-500 leading-relaxed font-light">{policy.body}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Weight warning card */}
                        <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 flex gap-3">
                            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                Weight mismatches &gt; 10% are auto-deducted. Always weigh packages accurately before declaring.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Shipping;
