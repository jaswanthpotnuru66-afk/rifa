import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
    CheckCircle2, ArrowRight, Download, 
    Share2, Package, Sparkles, Award
} from 'lucide-react';

const Success = () => {
    const location = useLocation();
    const [orderId] = useState(() => location.state?.orderId || `RIFA-${Math.floor(100000 + Math.random() * 900000)}`);

    // Calculate a dynamic delivery window: 10–14 days from today
    const deliveryRange = (() => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() + 10);
        const to = new Date(today);
        to.setDate(today.getDate() + 14);
        const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${from.toLocaleDateString('en-IN', opts)} – ${to.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`;
    })();

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-32 pb-20 selection:bg-brand-pink/20 overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center space-y-8">
                    {/* Hero Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-24 h-24 bg-neutral-950 rounded-full flex items-center justify-center mx-auto shadow-2xl relative"
                    >
                        <CheckCircle2 size={48} className="text-brand-pink" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border-2 border-brand-pink/30" 
                        />
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.5em] text-brand-pink">Acquisition Confirmed</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 tracking-tighter">
                            The masterpiece <br />
                            <span className="italic font-light text-neutral-400">is yours.</span>
                        </h1>
                        <p className="text-lg font-light text-neutral-500 max-w-xl mx-auto leading-relaxed">
                            Your order has been successfully recorded in our archives. An artisan is being assigned to curate your legacy.
                        </p>
                    </motion.div>

                    {/* Order Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white border border-neutral-100 shadow-2xl rounded-sm p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">Order Reference</p>
                                    <p className="text-xl font-serif font-bold text-neutral-950">#{orderId}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">Estimated Delivery</p>
                                    <p className="text-lg font-serif font-bold text-neutral-950">{deliveryRange}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">Status</p>
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Package size={14} />
                                        <span className="text-xs font-black uppercase tracking-widest">Artisan Assigned</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">Acquisition Type</p>
                                    <div className="flex items-center gap-2 text-neutral-950">
                                        <Award size={14} className="text-brand-gold" />
                                        <span className="text-xs font-black uppercase tracking-widest">Verified Masterpiece</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-neutral-50 flex flex-wrap gap-4 justify-center">
                            <button className="flex items-center gap-2 px-6 py-3 bg-neutral-50 text-neutral-950 text-xs font-black uppercase tracking-widest hover:bg-neutral-100 transition-all rounded-sm border border-neutral-100">
                                <Download size={14} /> Certificate of Authenticity
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-neutral-50 text-neutral-950 text-xs font-black uppercase tracking-widest hover:bg-neutral-100 transition-all rounded-sm border border-neutral-100">
                                <Share2 size={14} /> Share Acquisition
                            </button>
                        </div>
                    </motion.div>

                    {/* Next Steps */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-brand-pink">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900">Creation</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed uppercase font-bold px-4">Your piece is being crafted with traditional techniques.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-brand-pink">
                                <CheckCircle2 size={20} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900">Quality Check</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed uppercase font-bold px-4">Triple-verified for material integrity and artistic finish.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-brand-pink">
                                <Package size={20} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900">Delivery</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed uppercase font-bold px-4">Premium climate-controlled shipping to your destination.</p>
                        </div>
                    </motion.div>

                    {/* Navigation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="pt-16 flex flex-col items-center gap-6"
                    >
                        <Link 
                            to="/profile"
                            state={{ activeTab: 'orders' }}
                            className="inline-flex items-center gap-4 px-12 py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-2xl group"
                        >
                            Track Acquisition <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link to="/marketplace" className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-950 transition-all border-b border-transparent hover:border-neutral-950 pb-1">
                            Return to The Boutique
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Success;
