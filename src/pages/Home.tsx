import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Palette, Gift, ArrowRight, Lightbulb, ScrollText, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import heroBg from '../assets/hero_banner.png';
import { useEffect, useRef, useState } from 'react';
import MagneticButton from '../components/MagneticButton';
import { products } from '../lib/products';

const SECTIONS = [
    { id: 'home-hero',        label: 'Home' },
    { id: 'home-essence',     label: 'Our Essence' },
    { id: 'home-why',         label: 'Why Us' },
    { id: 'home-art-forms',   label: 'Art Forms' },
    { id: 'home-process',     label: 'The Process' },
    { id: 'home-marketplace', label: 'Marketplace' },
    { id: 'home-artisans',    label: 'Artisans' },
    { id: 'home-gallery',     label: 'Gallery' },
    { id: 'home-cta',         label: 'Get Started' },
];

const ScrollDotNav = ({ activeId }: { activeId: string }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const activeIndex  = SECTIONS.findIndex(s => s.id === activeId);
    const progressPct  = SECTIONS.length > 1
        ? (activeIndex / (SECTIONS.length - 1)) * 100
        : 0;
    const activeLabel  = SECTIONS[activeIndex]?.label ?? '';

    return (
        <>
            {/* ── Desktop: right-side dots ── */}
            <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3 items-center">
                {SECTIONS.map((section) => {
                    const isActive = activeId === section.id;
                    return (
                        <div
                            key={section.id}
                            className="relative flex items-center justify-end group"
                            onMouseEnter={() => setHoveredId(section.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Label tooltip */}
                            <AnimatePresence>
                                {hoveredId === section.id && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-6 whitespace-nowrap text-[10px] font-bold tracking-widest uppercase text-neutral-500 bg-white border border-neutral-200 px-2 py-1 shadow-sm pointer-events-none"
                                    >
                                        {section.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Dot */}
                            <button
                                onClick={() => scrollTo(section.id)}
                                aria-label={`Scroll to ${section.label}`}
                                className="w-2 h-2 rounded-full transition-all duration-500 cursor-pointer focus:outline-none"
                                style={{
                                    backgroundColor: isActive ? '#0a0a0a' : 'transparent',
                                    border: isActive ? '1.5px solid #0a0a0a' : '1.5px solid #a3a3a3',
                                    transform: isActive ? 'scale(1.35)' : 'scale(1)',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* ── Mobile: bottom progress bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
                {/* Track */}
                <div className="h-[3px] w-full bg-neutral-200">
                    <motion.div
                        className="h-full bg-neutral-950"
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                </div>
                {/* Label */}
                <div className="bg-white/90 backdrop-blur-sm border-t border-neutral-100 px-4 py-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                        {activeIndex + 1} / {SECTIONS.length}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-950">
                        {activeLabel}
                    </span>
                </div>
            </div>
        </>
    );
};

const GalleryCard = ({ item, index }: { item: any, index: number }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            viewport={{ once: true, margin: '-60px' }}
            className="w-[70vw] md:w-[320px] shrink-0 snap-center relative cursor-pointer perspective-1000 h-[450px]"
            onMouseEnter={() => window.innerWidth >= 1024 && setIsFlipped(true)}
            onMouseLeave={() => window.innerWidth >= 1024 && setIsFlipped(false)}
            onClick={() => window.innerWidth < 1024 && setIsFlipped(!isFlipped)}
        >
            <motion.div 
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden rounded-sm overflow-hidden border border-neutral-100 bg-white shadow-sm">
                    <img src={`/gallery/img${item.num}.png`} alt={item.title} className="w-full h-full object-cover grayscale-[10%]" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">{item.type}</p>
                        <h4 className="text-white font-serif text-xl">{item.title}</h4>
                        <div className="lg:hidden mt-2 text-[8px] text-white/50 uppercase tracking-[0.2em]">Tap to read story</div>
                    </div>
                </div>

                {/* Back Side (The Flip) */}
                <div className="absolute inset-0 backface-hidden rounded-sm bg-neutral-900 p-8 flex flex-col justify-center border border-neutral-800 shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
                    <div className="space-y-6">
                        <div>
                            <span className="text-brand-pink text-[9px] uppercase tracking-widest font-black mb-2 block">Discipline</span>
                            <h4 className="text-white font-serif text-2xl mb-1">{item.title}</h4>
                            <p className="text-neutral-500 text-xs italic">{item.type}</p>
                        </div>

                        <div className="h-[1px] w-12 bg-brand-pink/30"></div>

                        <div>
                            <span className="text-neutral-500 text-[9px] uppercase tracking-widest font-bold mb-2 block">Technique</span>
                            <p className="text-neutral-300 text-sm font-light leading-relaxed">{item.technique}</p>
                        </div>

                        <div>
                            <span className="text-neutral-500 text-[9px] uppercase tracking-widest font-bold mb-2 block">The Story</span>
                            <p className="text-neutral-400 text-xs font-light leading-relaxed italic">"{item.story}"</p>
                        </div>

                        <Link to="/custom-order" className="pt-4 text-brand-pink text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/btn">
                            Order Similar <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                        
                        <div className="lg:hidden mt-4 text-[8px] text-white/30 uppercase tracking-[0.2em] text-center">Tap to flip back</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Home = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
            setScrollProgress(progress);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const sectionTops = useRef<Record<string, number>>({});

    useEffect(() => {
        // Phase 1: calculate each section's absolute position from the document top
        const calculatePositions = () => {
            SECTIONS.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el) {
                    sectionTops.current[id] =
                        el.getBoundingClientRect().top + window.scrollY;
                }
            });
        };

        // Phase 2: on every scroll, compare scrollY against stored positions
        const handleScroll = () => {
            const scrollPos = window.scrollY + window.innerHeight * 0.33;
            let current = SECTIONS[0].id;
            for (const { id } of SECTIONS) {
                if ((sectionTops.current[id] ?? Infinity) <= scrollPos) {
                    current = id;
                }
            }
            setActiveSection(current);
        };

        calculatePositions();
        handleScroll(); // set correct dot on initial paint

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', calculatePositions, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', calculatePositions);
        };
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-20px' },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <div className="overflow-x-hidden bg-[#FAF7F2] text-neutral-900 font-sans">
            {/* Grain Texture Overlay handled by App.tsx globally */}

            {/* Scroll Dot Navigator */}
            <ScrollDotNav activeId={activeSection} />

            {/* Hero Section */}
            <section id="home-hero" className="relative min-h-screen flex items-center pt-24 pb-12 px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto border-b border-neutral-200">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center w-full z-10">
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="order-2 lg:order-1 pt-10 lg:pt-0"
                    >
                        <motion.div variants={fadeInUp}>
                            <span className="inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-widest uppercase border border-brand-pink text-brand-pink rounded-full">
                                Bespoke Gifting
                            </span>
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-neutral-950 leading-[0.95] tracking-tighter mb-8">
                            Custom <br/> Handmade <br/> 
                            <span className="italic font-light text-neutral-500">Masterpieces.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-neutral-600 font-light max-w-md mb-12 leading-relaxed">
                            No fixed catalogue. No limits. Just your imagination turned into reality by India's finest artisans.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-6">
                            <MagneticButton>
                                <Link to="/marketplace" className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-950 text-white font-bold text-xs tracking-widest uppercase hover:bg-neutral-800 transition-all">
                                    Shop the Collection <ArrowRight size={16} />
                                </Link>
                            </MagneticButton>
                            <Link to="/custom-order" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-950 transition-all border-b border-transparent hover:border-neutral-950 pb-1">
                                Bespoke Commissions
                            </Link>
                        </motion.div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="order-1 lg:order-2 relative h-[50vh] lg:h-[75vh] w-full mt-10 lg:mt-0"
                    >
                        <div className="absolute inset-0 bg-neutral-200 rounded-sm overflow-hidden">
                            <img src={heroBg} alt="Handmade gifts" className="w-full h-full object-cover grayscale-[15%]" />
                        </div>
                        {/* High-fashion editorial frame markers */}
                        <div className="hidden lg:block absolute -top-6 -right-6 w-32 h-32 border-t-[1px] border-r-[1px] border-neutral-400"></div>
                        <div className="hidden lg:block absolute -bottom-6 -left-6 w-32 h-32 border-b-[1px] border-l-[1px] border-neutral-400"></div>
                    </motion.div>
                </div>
            </section>

            {/* Our Essence */}
            <section id="home-essence" className="py-16 md:py-20 px-4 border-b border-neutral-200 bg-[#FAF7F2]">
                <motion.div 
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="max-w-5xl mx-auto text-center space-y-8"
                >
                    <motion.h2 variants={fadeInUp} className="text-xs font-bold tracking-widest uppercase text-brand-pink">Our Essence</motion.h2>
                    <motion.h3 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight text-neutral-950 max-w-4xl mx-auto">
                        Rifa Arts & Crafts is a multi-art, customization-based handmade gifting brand with no fixed catalogue. 
                    </motion.h3>
                    <motion.div variants={fadeInUp} className="flex justify-center items-center gap-6 opacity-40">
                        <div className="w-16 h-[1px] bg-neutral-900"></div>
                        <Star size={12} className="fill-current" />
                        <div className="w-16 h-[1px] bg-neutral-900"></div>
                    </motion.div>
                    <motion.p variants={fadeInUp} className="text-lg md:text-xl text-neutral-500 font-light leading-relaxed max-w-3xl mx-auto">
                        Customers can combine <span className="italic font-serif text-neutral-800">resin art, crochet, satin flowers, clay art, canvas art,</span> and more into a single customized creation. Every product is handcrafted with profound emotional involvement, focusing on trust and personalization rather than mass production.
                    </motion.p>
                </motion.div>
            </section>

            {/* Why We Are Different */}
            <section id="home-why" className="py-16 md:py-20 bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
                    >
                        {[
                            { icon: <Palette size={28} strokeWidth={1.5} />, title: 'No Fixed Catalogue', desc: 'Your imagination is our catalogue. Pinterest-to-product customization is our absolute specialty.', bg: 'bg-brand-rose-100', text: 'text-brand-pink' },
                            { icon: <Gift size={28} strokeWidth={1.5} />, title: 'Affordable & Personal', desc: 'Premium quality at honest prices, plus a complimentary handmade gift included with every single order.', bg: 'bg-amber-50', text: 'text-brand-gold' },
                            { icon: <Heart size={28} strokeWidth={1.5} />, title: 'Made with Emotion', desc: 'Every piece is crafted with immense patience, meticulous attention to detail, and true emotional involvement.', bg: 'bg-emerald-50', text: 'text-brand-sage' }
                        ].map((feature, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="flex flex-col items-center md:items-start text-center md:text-left group">
                                <div className={`mb-6 ${feature.bg} ${feature.text} w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-4 text-neutral-950">{feature.title}</h3>
                                <p className="text-neutral-500 font-light leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Art Forms Grid */}
            <section id="home-art-forms" className="py-16 md:py-20 px-4 border-b border-neutral-200 bg-[#FAF7F2]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">Disciplines</h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 tracking-tight">Art Forms We Master</h3>
                        </div>
                        <p className="text-neutral-500 text-lg font-light">All designs are customizable references.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {[
                            { title: 'Resin Art', img: '/art_forms/resin_art.png', details: ['UV Resistant', 'Custom Embeds', 'Crystal Clear Finish'] },
                            { title: 'Crochet', img: '/art_forms/crochet.png', details: ['Eco-friendly Yarn', 'Intricate Patterns', 'Washable'] },
                            { title: 'Satin Flowers', img: '/art_forms/satin_flowers.png', details: ['Premium Satin', 'Hand-pleated', 'Everlasting'] },
                            { title: 'Pipe Cleaners', img: '/art_forms/pipe_cleaners.png', details: ['Flexible Wire', 'Soft Texture', 'Vibrant Colors'] },
                            { title: 'Clay Art', img: '/art_forms/clay_art.png', details: ['Air-dry Clay', 'Hand-painted', 'Lightweight'] },
                            { title: 'Canvas Art', img: '/art_forms/canvas_art.png', details: ['Professional Grade', 'Texture Work', 'Varnished'] },
                            { title: 'Bouquets', img: '/art_forms/bouquets.png', details: ['Custom Theme', 'Gift Wrapping', 'Scented Options'] },
                            { title: 'Hampers', img: '/art_forms/hampers.png', details: ['Curated Mix', 'Premium Box', 'Personalized Note'] }
                        ].map((item, index) => (
                            <Link
                                key={item.title}
                                to="/marketplace"
                                state={{ category: item.title }}
                                className="block"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
                                    viewport={{ once: true, margin: '-20px' }}
                                    className="group relative bg-neutral-200 overflow-hidden aspect-[4/5] cursor-pointer"
                                >
                                    <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%]" />
                                    
                                    {/* Bottom Title Overlay (Visible by default) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 z-10 group-hover:opacity-0 transition-opacity duration-300">
                                        <h3 className="font-serif font-bold text-xl md:text-2xl text-white">{item.title}</h3>
                                    </div>

                                    {/* Glassmorphism Hover Drawer */}
                                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-20">
                                        <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-6 md:p-8">
                                            <h3 className="font-serif font-bold text-xl md:text-2xl text-white mb-4">{item.title}</h3>
                                            <div className="space-y-3">
                                                {item.details.map((detail, dIdx) => (
                                                    <div key={dIdx} className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-pink/60"></div>
                                                        <span className="text-white/80 text-xs tracking-widest uppercase font-medium">{detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase">
                                                Explore <ArrowRight size={10} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works (Compact Premium Rows) */}
            <section id="home-process" className="py-16 md:py-16 bg-neutral-950 text-white overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">The Process</h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold tracking-tighter leading-tight">How Custom Orders Work</h3>
                        </div>
                        <p className="text-neutral-400 text-base font-light max-w-sm leading-relaxed pb-2">
                            A seamless journey from your imagination to a tangible, handcrafted masterpiece.
                        </p>
                    </div>

                    <div className="border-t border-neutral-800">
                        {[
                            { step: '01', title: 'Share Your Idea', desc: 'Whether it is a Pinterest board, an Instagram post, or just a vivid description straight from your imagination.', icon: <Lightbulb className="w-20 h-20" strokeWidth={0.5} /> },
                            { step: '02', title: 'Discuss Details', desc: 'We collaborate to align on your budget constraints, preferred color palettes, sizing requirements, and the special occasion.', icon: <Palette className="w-20 h-20" strokeWidth={0.5} /> },
                            { step: '03', title: 'Confirmation', desc: 'Our team personally confirms the final intricacies of the design and provides a transparent, upfront pricing breakdown.', icon: <ScrollText className="w-20 h-20" strokeWidth={0.5} /> },
                            { step: '04', title: 'Handcrafting', desc: 'Your gift is brought to life by master artisans over days of painstaking effort, created with extreme care and emotion.', icon: <Heart className="w-20 h-20" strokeWidth={0.5} /> },
                            { step: '05', title: 'Delivery', desc: 'Securely packaged and delivered straight to your doorstep, always accompanied by a complimentary handmade gift.', icon: <Gift className="w-20 h-20" strokeWidth={0.5} /> }
                        ].map((s, index) => (
                            <motion.div 
                                key={s.step} 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="group border-b border-neutral-800 relative cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-neutral-900/40 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[0.16,1,0.3,1] z-0"></div>
                                
                                <div className="flex flex-col md:flex-row md:items-center py-6 md:py-8 justify-between gap-6 relative z-10 px-4 md:px-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 lg:w-3/4">
                                        <span className="text-3xl md:text-4xl font-serif text-neutral-700 group-hover:gradient-text-rose transition-colors duration-500 font-light w-16"><span className="group-hover:text-brand-pink transition-colors duration-500">{s.step}</span></span>
                                        <div>
                                            <h4 className="text-2xl md:text-3xl font-serif text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">{s.title}</h4>
                                            <p className="text-neutral-400 text-base font-light max-w-2xl leading-relaxed group-hover:translate-x-2 transition-transform duration-500 delay-75">{s.desc}</p>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex justify-end lg:w-1/4 text-neutral-800 group-hover:text-white/20 group-hover:scale-110 transition-all duration-700">
                                        {s.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Boutique */}
            <section id="home-marketplace" className="py-16 md:py-16 bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">Available Now</h2>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter leading-[0.95]">
                                The<br />
                                <span className="italic font-light text-neutral-400">Boutique.</span>
                            </h1>
                        </div>
                        <div className="flex flex-col md:items-end gap-6">
                            <p className="text-neutral-500 font-light md:text-right max-w-[280px] hidden md:block leading-relaxed">
                                Handcrafted masterpieces ready for immediate delivery. Discover our selection of curated gift items.
                            </p>
                            <Link to="/marketplace" className="inline-flex items-center gap-4 px-8 py-4 bg-neutral-950 text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-neutral-800 transition-all shadow-xl group">
                                Shop All Pieces <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {products.map((product, idx) => (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                viewport={{ once: true, margin: '-20px' }}
                                className="group flex flex-col h-full"
                            >
                                <Link to={`/product/${product.id}`} className="block h-full cursor-pointer">
                                    <div className="relative aspect-[4/5] bg-white overflow-hidden mb-6 border border-neutral-100">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        {product.tag && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="badge-rose text-[10px] shadow-lg">
                                                    {product.tag}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col flex-grow">
                                        <p className="text-xs text-neutral-400 font-bold tracking-widest uppercase mb-2">{product.category}</p>
                                        <h3 className="font-serif text-lg text-neutral-900 mb-3 leading-snug group-hover:text-neutral-500 transition-colors">{product.name}</h3>
                                        
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg key={i} className={`w-3 h-3 ${ i < Math.floor(product.rating) ? 'text-neutral-900' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-neutral-400 font-medium">{product.rating} ({product.reviewCount})</span>
                                        </div>

                                        <div className="mt-auto flex items-baseline gap-3">
                                            <span className="text-lg font-bold text-neutral-900">Rs. {product.price.toLocaleString()}</span>
                                            {product.originalPrice && (
                                                <>
                                                    <span className="text-sm text-neutral-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                                                    <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded-full text-white" style={{background:'linear-gradient(135deg,#4A8C6F,#2E6A50)'}}>{Math.round((1 - product.price/product.originalPrice)*100)}% off</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Collaborated CraftMakers (Image-Backed Editorial Cards) */}
            <section id="home-artisans" className="py-16 md:py-20 bg-[#FAF7F2] border-b border-neutral-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
                    <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div>
                            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">The Collective</h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 tracking-tight">Heritage Artisans</h3>
                        </div>
                        <p className="text-neutral-500 text-lg font-light max-w-sm pb-2 leading-relaxed">
                            Discover the master craftspeople behind our most exquisite creations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: "weavers-of-bengal", name: "Weavers of Bengal", location: "West Bengal", products: "140+", tags: ["Tant Cotton"], img: "/artisans/bengal_weaver.png" },
                            { id: "rajesh-woodworks", name: "Rajesh Woodworks", location: "Uttar Pradesh", products: "85+", tags: ["Teakwood Inlay"], img: "/artisans/rajesh_woodworks.png" },
                            { id: "jaipur-collective", name: "Jaipur Collective", location: "Rajasthan", products: "210+", tags: ["Blue Pottery"], img: "/artisans/jaipur_pottery.png" },
                            { id: "kashmiri-thread-co", name: "Kashmiri Thread Co.", location: "Kashmir", products: "55+", tags: ["Pashmina"], img: "/artisans/kashmir_thread.png" }
                        ].map((maker, idx) => (
                            <Link 
                                key={idx}
                                to={`/artisan/${maker.id}`}
                                className="block"
                            >
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    viewport={{ once: true, margin: '-20px' }}
                                    className="group relative aspect-[3/4] overflow-hidden cursor-pointer rounded-sm"
                                >
                                    {/* Background Image */}
                                    <img src={maker.img} alt={maker.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    
                                    {/* Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                    
                                    {/* Content */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <span className="bg-white/10 backdrop-blur-md text-white text-[9px] uppercase tracking-widest px-3 py-1.5 border border-white/20">
                                                {maker.products} items
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                <ArrowRight size={14} className="text-white -rotate-45" />
                                            </div>
                                        </div>
                                        
                                        <div className="lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-400">
                                            <p className="text-white/70 text-[10px] tracking-widest uppercase font-bold flex items-center gap-1.5 mb-2">
                                                <MapPin size={12} className="text-brand-pink" /> {maker.location}
                                            </p>
                                            <h3 className="font-serif text-2xl font-bold text-white mb-3 leading-tight">{maker.name}</h3>
                                            
                                            <div className="w-8 h-[1px] bg-brand-pink mb-3 lg:group-hover:w-16 transition-all duration-400"></div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {maker.tags.map(tag => (
                                                    <span key={tag} className="text-[11px] text-white/90 font-serif italic">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Inspiration Gallery */}
            <section id="home-gallery" className="py-16 md:py-24 bg-white border-b border-neutral-200 overflow-hidden">
                <div className="max-w-[1600px] mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">Pinterest to Product</h2>
                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 tracking-tight">Inspiration Gallery</h3>
                    </div>

                    <div className="relative group/gallery">
                        {/* Navigation Buttons */}
                        <button 
                            onClick={() => scroll('left')}
                            className="absolute left-4 lg:left-0 top-1/2 -translate-y-1/2 lg:-translate-x-4 z-20 w-12 h-12 bg-white border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-900 opacity-60 lg:opacity-0 lg:group-hover/gallery:opacity-100 lg:group-hover/gallery:translate-x-0 transition-all duration-300 hover:opacity-100 lg:hover:bg-neutral-950 lg:hover:text-white"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <button 
                            onClick={() => scroll('right')}
                            className="absolute right-4 lg:right-0 top-1/2 -translate-y-1/2 lg:translate-x-4 z-20 w-12 h-12 bg-white border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-900 opacity-60 lg:opacity-0 lg:group-hover/gallery:opacity-100 lg:group-hover/gallery:translate-x-0 transition-all duration-300 hover:opacity-100 lg:hover:bg-neutral-950 lg:hover:text-white"
                        >
                            <ChevronRight size={20} />
                        </button>

                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto pb-8 gap-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 lg:px-8"
                        >
                            {[
                                { num: 1, title: "The Resin Bloom", type: "Resin Art", technique: "Hand-poured Epoxy", story: "Capturing the ephemeral beauty of dried spring botanicals in eternal glass-like suspension." },
                                { num: 2, title: "Midnight Crochet", type: "Textile Art", technique: "Victorian Lace-work", story: "Intricate micro-patterns inspired by vintage lace, reimagined for modern luxury home decor." },
                                { num: 3, title: "Azure Clay Vessel", type: "Ceramic Art", technique: "Hand-molded Clay", story: "Exploring the textures of the Mediterranean coastline through raw terracotta and turquoise glazing." },
                                { num: 5, title: "Satin Elegance", type: "Ribbon Art", technique: "Hand-pleated Silk", story: "Everlasting floral arrangements meticulously crafted from heavy Japanese silk and satin ribbons." },
                                { num: 4, title: "Zen Canvas", type: "Canvas Art", technique: "Abstract Acrylics", story: "A meditative study of silence and space, using layered textures to create depth and serenity." },
                            ].map((item, index) => (
                                <GalleryCard key={index} item={item} index={index} />
                            ))}
                        </div>

                        {/* Scroll Progress Bar */}
                        <div className="max-w-xs mx-auto mt-6 h-[2px] bg-neutral-100 relative overflow-hidden">
                            <motion.div 
                                className="absolute top-0 left-0 h-full bg-brand-pink"
                                style={{ width: `${scrollProgress}%` }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Artisan Seller CTA & Final CTA */}
            <section id="home-cta" className="bg-neutral-950 text-white">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 border-b border-neutral-800">
                    
                    {/* Sell on Rifa */}
                    <div className="p-12 md:p-24 lg:p-32 flex flex-col justify-center items-center text-center hover:bg-neutral-900 transition-colors">
                        <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-6">Partner Program</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">Turn your craft into a business.</h2>
                        <MagneticButton>
                            <Link to="/collaborate" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-950 font-bold text-xs tracking-widest uppercase hover:bg-neutral-200 transition-colors">
                                Apply to Sell <ArrowRight size={16} />
                            </Link>
                        </MagneticButton>
                        <Link to="/auth" className="mt-6 text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                            Already a partner? Sign In
                        </Link>
                    </div>

                    {/* Customer Custom Order */}
                    <div className="p-12 md:p-24 lg:p-32 flex flex-col justify-center items-center text-center hover:bg-neutral-900 transition-colors">
                        <span className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-6">Custom Orders</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">Have an Idea in Mind?</h2>
                        <MagneticButton>
                            <Link to="/custom-order" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-pink text-white font-bold text-xs tracking-widest uppercase hover:bg-brand-pink-dark transition-colors">
                                Customize Your Gift <ArrowRight size={16} />
                            </Link>
                        </MagneticButton>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Home;
