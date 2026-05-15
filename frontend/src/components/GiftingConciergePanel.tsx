import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GiftingConciergePanelProps {
    isOpen: boolean;
    onClose: () => void;
    products: any[];
}

const GiftingConciergePanel = ({ isOpen, onClose, products }: GiftingConciergePanelProps) => {
    const [conciergeStep, setConciergeStep] = useState(1);
    const [conciergeData, setConciergeData] = useState({ forWhom: '', occasion: '' });

    // Ensure we reset when closed
    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setConciergeStep(1);
            setConciergeData({ forWhom: '', occasion: '' });
        }, 500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-[110]"
                    />
                    
                    {/* Concierge Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[120] flex flex-col"
                    >
                        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-[#FAF7F2]">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink">Curated Service</span>
                                <h2 className="text-2xl font-serif font-bold text-neutral-950">Gift Concierge</h2>
                            </div>
                            <button 
                                onClick={handleClose}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-12">
                            {/* Step Indicator */}
                            <div className="flex gap-2">
                                {[1, 2, 3].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${(i + 1) <= conciergeStep ? 'bg-brand-pink' : 'bg-neutral-100'}`}
                                    />
                                ))}
                            </div>

                            {/* STEP 1 */}
                            {conciergeStep === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-serif font-bold text-neutral-900">Who are we celebrating?</h3>
                                        <p className="text-xs text-neutral-400 font-light">Select the recipient of this artisan treasure.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Partner', 'Parents', 'Friends', 'Colleague', 'Self', 'Other'].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    setConciergeData({ ...conciergeData, forWhom: item });
                                                    setConciergeStep(2);
                                                }}
                                                className={`p-6 border text-center transition-all hover:shadow-lg ${
                                                    conciergeData.forWhom === item 
                                                    ? 'border-neutral-950 bg-neutral-950 text-white' 
                                                    : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'
                                                }`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2 */}
                            {conciergeStep === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <button 
                                        onClick={() => setConciergeStep(1)}
                                        className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2 hover:text-neutral-950 transition-colors"
                                    >
                                        <ArrowRight size={10} className="rotate-180" /> Back to Recipient
                                    </button>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-serif font-bold text-neutral-900">What is the occasion?</h3>
                                        <p className="text-xs text-neutral-400 font-light">Every moment deserves a unique craft.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Birthday', 'Wedding', 'Anniversary', 'Housewarming', 'Just Because', 'Seasonal'].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    setConciergeData({ ...conciergeData, occasion: item });
                                                    setConciergeStep(3);
                                                }}
                                                className={`p-6 border text-center transition-all hover:shadow-lg ${
                                                    conciergeData.occasion === item 
                                                    ? 'border-neutral-950 bg-neutral-950 text-white' 
                                                    : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'
                                                }`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: RESULTS */}
                            {conciergeStep === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-serif font-bold text-neutral-900">Curated for {conciergeData.forWhom}</h3>
                                        <p className="text-xs text-neutral-400 font-light">Handpicked from our archives for a {conciergeData.occasion}.</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {products.slice(0, 3).map((product) => (
                                            <Link 
                                                key={product.id}
                                                to={`/product/${product.id}`}
                                                onClick={handleClose}
                                                className="flex gap-4 group/item"
                                            >
                                                <div className="w-20 h-24 bg-neutral-100 overflow-hidden shrink-0">
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink mb-1">{product.category}</p>
                                                    <h4 className="font-serif text-lg text-neutral-900 group-hover/item:text-brand-pink transition-colors">{product.name}</h4>
                                                    <p className="text-xs font-bold text-neutral-900 mt-2">₹{product.price.toLocaleString()}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-neutral-100">
                                        <Link 
                                            to="/marketplace"
                                            onClick={handleClose}
                                            className="w-full py-4 bg-neutral-950 text-white font-bold text-xs tracking-widest uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            View Full Collection <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GiftingConciergePanel;
