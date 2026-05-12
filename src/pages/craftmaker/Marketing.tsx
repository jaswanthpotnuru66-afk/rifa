import { useState } from 'react';
import { Megaphone, Ticket, Percent, Plus, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState<'discounts' | 'flash'>('discounts');
    const [isCreating, setIsCreating] = useState(false);
    
    // Using empty state by default to show off the beautiful Popsy illustration
    const mockDiscounts: any[] = [];
    const mockFlashSales: any[] = [];

    return (
        <CraftMakerLayout title="Marketing & Promotions">
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Growth Tools</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Marketing & Offers</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Drive sales with custom discount codes and time-limited flash sales.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-opacity-90 transition-all shrink-0"
                    >
                        <Plus size={14} strokeWidth={3} /> {isCreating ? 'Cancel Creation' : 'Create Promotion'}
                    </button>
                </div>

                {/* Create Promotion Widget */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="bg-[#0a0a0a] rounded-sm p-8 shadow-xl overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Megaphone className="text-brand-pink" size={20} />
                                <h3 className="text-white font-serif text-xl font-bold">New Promotion</h3>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/50">Promotion Type</label>
                                        <select className="w-full bg-white/5 border border-white/10 text-white p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all appearance-none">
                                            <option value="percentage">Percentage Discount</option>
                                            <option value="fixed">Fixed Amount Discount</option>
                                            <option value="freeship">Free Shipping</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/50">Discount Code (e.g. DIWALI20)</label>
                                        <input type="text" placeholder="SUMMER50" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/50">Discount Value</label>
                                        <div className="relative">
                                            <Percent size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input type="number" placeholder="20" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-3.5 pl-10 text-sm font-bold outline-none focus:border-brand-pink transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/50">Start Date</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all css-invert-calendar-icon" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/50">End Date</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-3.5 text-sm font-bold outline-none focus:border-brand-pink transition-all css-invert-calendar-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button className="bg-white text-[#0a0a0a] hover:bg-brand-pink hover:text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg">
                                    Launch Promotion
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-neutral-100">
                    <button 
                        onClick={() => setActiveTab('discounts')}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'discounts' ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-950'}`}
                    >
                        <span className="flex items-center gap-2"><Ticket size={14} /> Discount Codes</span>
                        {activeTab === 'discounts' && <motion.div layoutId="mktTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('flash')}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'flash' ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-950'}`}
                    >
                        <span className="flex items-center gap-2"><Tag size={14} /> Flash Sales</span>
                        {activeTab === 'flash' && <motion.div layoutId="mktTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white border border-neutral-100 rounded-sm p-1">
                    {activeTab === 'discounts' ? (
                        mockDiscounts.length > 0 ? (
                            <div>{/* List of active discounts would go here */}</div>
                        ) : (
                            <div className="py-24 px-6 flex flex-col items-center text-center">
                                <img src="https://illustrations.popsy.co/amber/key-to-success.svg" alt="Discounts" className="w-48 h-48 opacity-80 mb-6" />
                                <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No active discount codes</h3>
                                <p className="text-neutral-500 text-sm max-w-sm mb-8">Create your first promo code to reward loyal customers and drive conversions.</p>
                                <button onClick={() => setIsCreating(true)} className="px-6 py-3 border border-neutral-200 hover:border-brand-pink text-neutral-600 hover:text-brand-pink text-[10px] font-black uppercase tracking-widest transition-all">
                                    Create Promo Code
                                </button>
                            </div>
                        )
                    ) : (
                        mockFlashSales.length > 0 ? (
                            <div>{/* List of active flash sales would go here */}</div>
                        ) : (
                            <div className="py-24 px-6 flex flex-col items-center text-center">
                                <img src="https://illustrations.popsy.co/amber/calendar.svg" alt="Flash Sales" className="w-48 h-48 opacity-80 mb-6" />
                                <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No upcoming flash sales</h3>
                                <p className="text-neutral-500 text-sm max-w-sm mb-8">Schedule a temporary price drop on specific listings to create urgency.</p>
                                <button onClick={() => setIsCreating(true)} className="px-6 py-3 border border-neutral-200 hover:border-brand-pink text-neutral-600 hover:text-brand-pink text-[10px] font-black uppercase tracking-widest transition-all">
                                    Schedule Flash Sale
                                </button>
                            </div>
                        )
                    )}
                </div>
                
            </div>
            
            <style>{`
                .css-invert-calendar-icon::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.5;
                    cursor: pointer;
                }
            `}</style>
        </CraftMakerLayout>
    );
};

export default Marketing;
