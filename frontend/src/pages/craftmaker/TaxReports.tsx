import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Download, FileText, Database, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';

const TaxReports = () => {
    const [gstin, setGstin] = useState('');
    const [gstinSaved, setGstinSaved] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                const res = await api.getArtisanTaxReports();
                if (res) {
                    if (res.gstin) {
                        setGstin(res.gstin);
                        setGstinSaved(true);
                    }
                    setReports(res.reports || []);
                }
            } catch (err) {
                console.error('Error fetching tax data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxData();
    }, []);

    const handleSaveGSTIN = async () => {
        if (!gstin) return;
        setSaving(true);
        try {
            const res = await api.saveArtisanGSTIN(gstin);
            if (res && res.success) {
                setGstinSaved(true);
            } else {
                alert('Failed to save GSTIN');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <CraftMakerLayout>
                <div className="flex items-center justify-center min-h-[65vh]">
                    <Loader2 size={36} className="animate-spin text-brand-pink" />
                </div>
            </CraftMakerLayout>
        );
    }

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Compliance</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Tax Reports</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">GST registration status and monthly TCS deductions.</p>
                </div>

                {/* GSTIN Status */}
                {!gstinSaved ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-sm p-8">
                        <div className="flex gap-5">
                            <div className="w-12 h-12 bg-amber-100 rounded-sm flex items-center justify-center text-amber-600 shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-amber-900">GSTIN Not Registered</h3>
                                    <p className="text-sm text-amber-700/80 font-light mt-1 leading-relaxed">
                                        Required if your annual revenue exceeds ₹20–40L (varies by state). Register your GSTIN below to stay compliant.
                                    </p>
                                </div>
                                <div className="flex gap-3 max-w-sm">
                                    <input type="text" placeholder="15-character GSTIN" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())}
                                        className="flex-1 bg-white border border-amber-200 px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-amber-500 placeholder:normal-case placeholder:font-normal" />
                                    <button onClick={handleSaveGSTIN} disabled={saving || !gstin}
                                        className="px-6 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-pink-dark transition-all disabled:opacity-50 flex items-center gap-2">
                                        {saving && <Loader2 size={12} className="animate-spin" />} Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-teal-50 border border-teal-200 rounded-sm p-8 flex gap-5 items-start">
                        <div className="w-12 h-12 bg-teal-100 rounded-sm flex items-center justify-center text-teal-600 shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif font-bold text-teal-900">GSTIN Registered</h3>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700 mt-1">{gstin}</p>
                            <button onClick={() => setGstinSaved(false)} className="text-[10px] font-black uppercase tracking-widest text-teal-500 hover:text-teal-800 transition-colors mt-3">Update GSTIN</button>
                        </div>
                    </div>
                )}

                {/* Info box */}
                <div className="bg-[#0a0a0a] rounded-sm p-8 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent" />
                    <div className="flex gap-5 relative z-10">
                        <div className="w-10 h-10 bg-teal-500/10 rounded-sm flex items-center justify-center text-teal-400 shrink-0">
                            <Database size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2">Auto-Submitted to Government</p>
                            <p className="text-sm font-light text-white/60 leading-relaxed max-w-xl">
                                Your TCS data is automatically submitted to the Indian government by Rifa Arts & Crafts. It will appear as a credit in your <strong className="text-white font-bold">Form 26AS</strong> within 45 days of the end of each quarter.
                            </p>
                        </div>
                    </div>
                </div>

                {/* TCS Table */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Monthly TCS Deductions</h2>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">FY 2024–25</span>
                    </div>
                    {reports.length === 0 ? (
                        <div className="bg-white border border-neutral-100 rounded-sm p-12 text-center text-neutral-400 font-serif italic shadow-sm">
                            No sales transactions recorded for tax calculation in the selected period.
                        </div>
                    ) : (
                        <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-neutral-50 border-b border-neutral-100">
                                    <tr>
                                        {['Month', 'Gross Sales', 'TCS Deducted (1%)', 'Net Payout', 'Export'].map(h => (
                                            <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {reports.map((row, i) => (
                                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                                            className="hover:bg-neutral-50/80 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-neutral-50 rounded-sm flex items-center justify-center text-neutral-300 group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all">
                                                        <FileText size={14} />
                                                    </div>
                                                    <span className="text-sm font-bold text-neutral-950">{row.month}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-neutral-500 font-inter">₹{row.grossSales.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-sm font-bold text-red-500 font-inter">−₹{row.tcs.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-sm font-black text-neutral-950 font-inter">₹{row.netPayout.toLocaleString()}</td>
                                            <td className="px-6 py-5">
                                                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-brand-pink hover:border-brand-pink transition-all rounded-sm">
                                                    <Download size={11} /> Excel
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default TaxReports;
