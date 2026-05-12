import { Link } from 'react-router-dom';
import { 
    Clock, 
    CheckCircle2, 
    MessageCircle, 
    LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';

const Pending = () => {
    const timeline = [
        { id: 1, title: 'Application Submitted', status: 'completed', description: 'Your journey began on 12 May 2025' },
        { id: 2, title: 'Under Review', status: 'current', description: 'Our curators are verifying your studio docs' },
        { id: 3, title: 'Approved', status: 'pending', description: 'Digital studio activation' },
        { id: 4, title: 'Shop Active', status: 'pending', description: 'Start accepting commissions' }
    ];

    return (
        <div className="min-h-screen bg-[#FAF7F2] font-['Outfit'] selection:bg-brand-pink/20">
            <Navbar />
            
            <div className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    
                    {/* Hero Section */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mb-12"
                    >
                        <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                            <Clock size={40} strokeWidth={1} className="text-brand-pink" />
                            <div className="absolute inset-0 rounded-full border-2 border-brand-pink border-t-transparent animate-spin duration-[3000ms]" />
                        </div>
                        <h1 className="text-5xl font-serif font-bold text-neutral-900 mb-4">Application Submitted</h1>
                        <p className="text-xl text-neutral-500 font-light italic">We'll review your studio shortly.</p>
                        <p className="text-sm text-neutral-400 mt-6 max-w-lg mx-auto leading-relaxed">
                            Our team manually verifies every CraftMaker application to ensure platform quality. 
                            You'll receive an SMS and email within <span className="font-bold text-neutral-900">24–48 hours</span>.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 w-full items-start">
                        
                        {/* LEFT: Status Timeline */}
                        <div className="md:col-span-5 space-y-8">
                            <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-xl shadow-neutral-200/50">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-10">Application Status</h3>
                                
                                <div className="space-y-0">
                                    {timeline.map((step, idx) => (
                                        <div key={step.id} className="relative flex gap-6 pb-12 last:pb-0">
                                            {idx !== timeline.length - 1 && (
                                                <div className={`absolute left-4 top-8 bottom-0 w-[2px] ${step.status === 'completed' ? 'bg-brand-pink' : 'bg-neutral-100'}`} />
                                            )}
                                            
                                            <div className="relative z-10">
                                                {step.status === 'completed' ? (
                                                    <div className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-lg shadow-brand-pink/20">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                ) : step.status === 'current' ? (
                                                    <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-400/20 animate-pulse">
                                                        <Clock size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-300 flex items-center justify-center border border-neutral-200">
                                                        <div className="w-2 h-2 rounded-full bg-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col pt-1">
                                                <span className={`text-xs font-black uppercase tracking-widest ${step.status === 'pending' ? 'text-neutral-300' : 'text-neutral-900'}`}>
                                                    {step.title}
                                                </span>
                                                <p className="text-[11px] text-neutral-400 font-medium italic mt-1">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link 
                                to="/contact" 
                                className="flex items-center justify-center gap-3 p-6 bg-brand-pink/[0.03] border border-brand-pink/10 rounded-sm group hover:bg-brand-pink/[0.06] transition-all"
                            >
                                <MessageCircle size={18} className="text-brand-pink" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-brand-pink underline underline-offset-4 group-hover:text-[#A83058]">Have questions? Contact Support</span>
                            </Link>
                        </div>

                        {/* RIGHT: Info & Preview */}
                        <div className="md:col-span-7 space-y-8">
                            <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 mb-6">What happens next?</h3>
                                <ul className="space-y-6">
                                    {[
                                        "Our team reviews your KYC documents within 24–48 hours",
                                        "You'll receive an SMS confirmation when approved",
                                        "Your shop goes live immediately after approval"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-neutral-50 flex items-center justify-center shrink-0 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
                                            </div>
                                            <p className="text-sm text-neutral-600 font-light leading-relaxed">{text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Blurred Dashboard Preview */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-neutral-900/5 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center rounded-sm border border-neutral-200">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-400 mb-3 shadow-xl">
                                        <LayoutDashboard size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Dashboard Preview</span>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase mt-2">Available after approval</p>
                                </div>
                                <div className="bg-white border border-neutral-100 rounded-sm p-6 opacity-30 select-none pointer-events-none">
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="h-20 bg-neutral-100 rounded" />
                                        <div className="h-20 bg-neutral-100 rounded" />
                                        <div className="h-20 bg-neutral-100 rounded" />
                                    </div>
                                    <div className="h-40 bg-neutral-100 rounded mb-4" />
                                    <div className="h-32 bg-neutral-100 rounded" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pending;
