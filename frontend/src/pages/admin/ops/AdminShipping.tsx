import { 
    Clock, ArrowRight,
    RotateCcw, AlertTriangle,
    ChevronDown, Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { mockShippingAlerts, mockWeightMismatches } from '../../../lib/adminOps.mock';

const AdminShipping = () => {
    const slaBreaches = mockShippingAlerts.filter(a => a.type === 'sla-breach');
    const scanDelays = mockShippingAlerts.filter(a => a.type === 'scan-delay');
    const rtoCases = mockShippingAlerts.filter(a => a.type === 'rto');
    
    const activeMismatchesCount = mockWeightMismatches.filter(w => !w.deducted).length;
    const totalDeductedThisMonth = mockWeightMismatches.reduce((acc, curr) => acc + curr.overageShippingCost, 0);

    const StatCard = ({ label, value, subText, isCritical }: { label: string; value: number | string; subText: string; isCritical?: boolean }) => (
        <div className={`bg-white border rounded-sm p-6 ${isCritical ? 'border-red-200 bg-red-50/10' : 'border-neutral-100'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">{label}</p>
            <h3 className={`text-3xl font-serif font-bold tracking-tight ${isCritical ? 'text-red-600' : 'text-neutral-950'}`}>{value}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">{subText}</p>
        </div>
    );

    return (
        <AdminOpsLayout>
            <div className="space-y-12 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Logistics Command</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Shipping Oversight</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Monitor SLA breaches, scan delays, RTO cases, and weight mismatch alerts.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="SLA Breaches" value={slaBreaches.length} subText="Active dispatch delays" isCritical={slaBreaches.length > 0} />
                    <StatCard label="Weight Mismatches" value={activeMismatchesCount} subText="Unresolved discrepancies" isCritical={activeMismatchesCount > 0} />
                    <StatCard label="RTO Cases" value={rtoCases.length} subText="Shipments returning to origin" isCritical={rtoCases.length > 0} />
                    <StatCard label="Scan Delays" value={scanDelays.length} subText="Stalled tracking status" isCritical={scanDelays.length > 0} />
                </div>

                {/* SECTION 1: SLA BREACH ALERTS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Clock size={18} className="text-red-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">SLA Breach Alerts</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {slaBreaches.map(alert => (
                            <div key={alert.id} className={`bg-white border-l-4 rounded-sm p-6 shadow-sm border ${
                                alert.severity === 'high' ? 'border-red-500' : 
                                alert.severity === 'medium' ? 'border-amber-400' : 'border-neutral-100 border-l-neutral-400'
                            }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-neutral-950">{alert.orderId}</p>
                                        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-0.5">{alert.makerShopName}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full ${
                                        alert.severity === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {alert.severity} Severity
                                    </span>
                                </div>
                                <p className="text-[11px] text-neutral-600 font-medium leading-relaxed mb-6 italic">"{alert.description}"</p>
                                <button className="w-full py-3 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all">
                                    Send Reminder
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 2: SCAN DELAY CASES */}
                <div className="space-y-6 pt-6 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                        <RotateCcw size={18} className="text-blue-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Scan Delay Cases</h3>
                    </div>
                    <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-50 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-left border-b border-neutral-100">
                                    <th className="px-6 py-4 font-black">Order ID</th>
                                    <th className="px-6 py-4 font-black">Maker</th>
                                    <th className="px-6 py-4 font-black">AWB</th>
                                    <th className="px-6 py-4 font-black">Days Since Dropoff</th>
                                    <th className="px-6 py-4 font-black">Courier</th>
                                    <th className="px-6 py-4 font-black" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {scanDelays.map(delay => (
                                    <tr key={delay.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-neutral-950">{delay.orderId}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-neutral-600">{delay.makerShopName}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-brand-pink">AWB88012</td>
                                        <td className="px-6 py-4 text-xs font-black text-red-600">3 Days</td>
                                        <td className="px-6 py-4 text-xs font-medium text-neutral-400">Delhivery</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="px-4 py-2 border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-all">
                                                Manual Override
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 3: RTO CASES */}
                <div className="space-y-6 pt-6 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className="text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">RTO (Return to Origin) Cases</h3>
                    </div>
                    <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-50 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-left border-b border-neutral-100">
                                    <th className="px-6 py-4 font-black">Order ID</th>
                                    <th className="px-6 py-4 font-black">Maker</th>
                                    <th className="px-6 py-4 font-black">Buyer City</th>
                                    <th className="px-6 py-4 font-black">Courier</th>
                                    <th className="px-6 py-4 font-black">Reason</th>
                                    <th className="px-6 py-4 font-black text-center">Admin Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {rtoCases.map(rto => (
                                    <tr key={rto.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-neutral-950">{rto.orderId}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-neutral-600">{rto.makerShopName}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-neutral-400">Ahmedabad</td>
                                        <td className="px-6 py-4 text-xs font-medium text-neutral-400">BlueDart</td>
                                        <td className="px-6 py-4 text-xs font-bold text-red-600 italic">Address Unreachable</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="relative group">
                                                    <select className="appearance-none bg-neutral-50 border border-neutral-100 pl-3 pr-8 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer">
                                                        <option>Select Action</option>
                                                        <option>Re-deliver</option>
                                                        <option>Refund Buyer</option>
                                                        <option>Deduct RTO Cost</option>
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                                </div>
                                                <button className="px-3 py-1.5 bg-brand-pink text-white text-[9px] font-black uppercase tracking-widest">Apply</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 4: WEIGHT MISMATCH SUMMARY */}
                <div className="space-y-6 pt-6 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                        <Scale size={18} className="text-brand-pink" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Weight Mismatch Summary</h3>
                    </div>
                    <Link to="/admin/ops/makers/weights" className="group block bg-white border border-neutral-100 p-8 rounded-sm hover:border-brand-pink/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-12">
                                <div>
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active Mismatches</p>
                                    <p className="text-3xl font-serif font-bold text-neutral-950">{activeMismatchesCount}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Deducted (This Month)</p>
                                    <p className="text-3xl font-serif font-bold text-green-600">₹{totalDeductedThisMonth.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-brand-pink">
                                <span className="text-[10px] font-black uppercase tracking-widest">View Full Report</span>
                                <div className="w-10 h-10 rounded-full border border-brand-pink/20 flex items-center justify-center group-hover:bg-brand-pink group-hover:text-white transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminShipping;
