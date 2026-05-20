
import { useState, useEffect } from 'react';
import { 
    ShieldCheck, Download, 
    FileText, CheckCircle2,
    Info, RefreshCcw, Loader2
} from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminTaxReports = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await api.getAdminTaxReports();
            if (res) {
                setReports(res);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) {
        return (
            <AdminOpsLayout>
                <div className="flex items-center justify-center min-h-[65vh]">
                    <Loader2 size={36} className="animate-spin text-brand-pink" />
                </div>
            </AdminOpsLayout>
        );
    }

    return (
        <AdminOpsLayout>
            <div className="space-y-10 animate-in fade-in duration-500 pb-24">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Government Compliance</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Tax Reports (TCS)</h1>
                </div>

                {/* SECTION 1: Compliance Status */}
                <div className="bg-green-50 border border-green-200 rounded-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <ShieldCheck className="text-green-600" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-green-950">TCS Compliance Active</h3>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-widest rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Razorpay Connected
                                </span>
                            </div>
                            <p className="text-sm text-green-800/70 font-medium leading-relaxed max-w-2xl">
                                1% TCS is automatically deducted from all maker payouts via Razorpay Route as required by Indian GST law. 
                                Reports are generated monthly for GSTR-8 filing.
                            </p>
                        </div>
                    </div>
                    <button className="px-6 py-3 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all bg-white shrink-0">
                        View API Logs
                    </button>
                </div>

                {/* SECTION 2: Monthly Summary */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText size={18} className="text-neutral-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">Monthly TCS Summary</h3>
                        </div>
                        <button className="px-6 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/10">
                            Export All to Excel
                        </button>
                    </div>

                    <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                    <th className="px-6 py-4">Month</th>
                                    <th className="px-6 py-4 text-right">Gross Sales</th>
                                    <th className="px-6 py-4 text-right">TCS Collected (1%)</th>
                                    <th className="px-6 py-4 text-center">Maker Count</th>
                                    <th className="px-6 py-4 text-right">Avg Per Maker</th>
                                    <th className="px-6 py-4 text-center">Export Status</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 text-[11px] font-medium text-neutral-600">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 font-serif italic">
                                            No tax reports generated for compliance.
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map(row => (
                                        <tr key={row.month} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-5 font-bold text-neutral-900 font-inter">{row.month}</td>
                                            <td className="px-6 py-5 text-right font-inter">₹{row.totalGrossSales.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right font-black text-brand-pink font-inter">₹{row.totalTCSCollected.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-center font-inter">{row.makerCount}</td>
                                            <td className="px-6 py-5 text-right font-inter">₹{row.averagePerMaker.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-center">
                                                {row.exportedAt ? (
                                                    <span className="flex items-center justify-center gap-1.5 text-green-600 font-bold uppercase text-[9px]">
                                                        <CheckCircle2 size={12} /> Exported {new Date(row.exportedAt).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-500 font-bold uppercase text-[9px]">Not Exported</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="p-2 text-neutral-300 hover:text-neutral-950 hover:bg-neutral-50 rounded-sm transition-all group" title="Download Report">
                                                    <Download size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* SECTION 3: Instructions */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-blue-100 pb-4">
                            <Info size={18} className="text-blue-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-950">How to file GSTR-8</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Download the monthly TCS Excel report from the table above.",
                                "Share the report with your Chartered Accountant (CA) or tax consultant.",
                                "Your CA must file GSTR-8 on the GST portal before the 10th of the following month."
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 text-[10px] font-black">
                                        {i + 1}
                                    </div>
                                    <p className="text-xs text-blue-900/70 font-medium leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 mt-4 border-t border-blue-100">
                            <p className="text-[10px] text-blue-900/50 italic leading-relaxed font-medium">
                                * This data also auto-appears in each maker's Form 26AS within 45 days of the quarter end through the automated Razorpay-GST integration.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-100 rounded-sm p-8 space-y-6 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-200">
                            <RefreshCcw size={32} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-serif font-bold text-neutral-950">Re-sync Compliance Data</h4>
                            <p className="text-xs text-neutral-500 max-w-[280px] mx-auto">Force a refresh of TCS data from the Razorpay Ledger if any discrepancies are found.</p>
                        </div>
                        <button className="px-8 py-3 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 hover:border-neutral-950 transition-all">
                            Force Re-sync
                        </button>
                    </div>
                </section>

            </div>
        </AdminOpsLayout>
    );
};

export default AdminTaxReports;
