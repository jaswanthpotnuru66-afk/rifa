import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Lightbulb, Heart, Gift } from 'lucide-react';

const CustomCursor = () => {
    const [cursorType, setCursorType] = useState('default');
    const [isVisible, setIsVisible] = useState(false);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a')) {
                setCursorType('pointer');
            } else if (target.closest('img') || target.closest('[data-cursor="view"]')) {
                setCursorType('view');
            } else {
                setCursorType('default');
            }
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleMouseOver);
        
        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY, isVisible]);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-neutral-400 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: '-50%',
                translateY: '-50%',
            }}
            animate={{
                width: cursorType === 'view' ? 80 : cursorType === 'pointer' ? 40 : 20,
                height: cursorType === 'view' ? 80 : cursorType === 'pointer' ? 40 : 20,
                backgroundColor: cursorType === 'view' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
                border: cursorType === 'default' ? '1px solid rgba(255,255,255,0.5)' : '0px solid transparent'
            }}
        >
            <AnimatePresence>
                {cursorType === 'view' && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="text-[10px] font-bold tracking-widest text-black uppercase"
                    >
                        VIEW
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FloatingWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-bespoke-modal', handleOpen);
        return () => window.removeEventListener('open-bespoke-modal', handleOpen);
    }, []);

    return (
        <>
            {/* Spinning Widget */}
            <div className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-[9000]">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-16 h-16 lg:w-24 lg:h-24 flex items-center justify-center cursor-pointer group"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-dashed border-neutral-300 rounded-full group-hover:border-brand-pink transition-colors"
                    />
                    
                    {/* SVG Text Ring */}
                    <svg className="absolute inset-0 w-full h-full group-hover:text-brand-pink transition-colors" viewBox="0 0 100 100">
                        <defs>
                            <path id="circlePath" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                        </defs>
                        <text fontSize="9.5" fontWeight="900" className="fill-neutral-950 uppercase" style={{ letterSpacing: '4.5px' }}>
                            <textPath href="#circlePath">HANDMADE • CUSTOM • RIFA • </textPath>
                        </text>
                    </svg>

                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white shadow-xl">
                        <Sparkles size={14} className="lg:hidden" />
                        <Sparkles size={16} className="hidden lg:block" />
                    </div>
                </motion.div>
            </div>

            {/* Bespoke Process Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-md z-[9999] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white max-w-lg w-full p-10 relative"
                        >
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xs font-bold tracking-widest text-brand-pink uppercase mb-2">Bespoke Process</h2>
                                    <h3 className="text-3xl font-serif font-bold text-neutral-950">How we create.</h3>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { icon: <Lightbulb size={20} />, title: "The Vision", desc: "Share your Pinterest board or a simple sketch. Your imagination is our only limit." },
                                        { icon: <Heart size={20} />, title: "The Craft", desc: "Our artisans handcraft your piece over days, infusing it with true emotional value." },
                                        { icon: <Gift size={20} />, title: "The Reveal", desc: "Receive your custom masterpiece, complete with a unique handmade surprise gift." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-10 h-10 shrink-0 bg-neutral-50 flex items-center justify-center text-neutral-900 border border-neutral-100">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-neutral-900 mb-1">{item.title}</h4>
                                                <p className="text-xs text-neutral-500 font-light leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-neutral-950 text-white font-bold text-xs tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                                >
                                    Start Your Custom Order
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export { CustomCursor, FloatingWidget };
