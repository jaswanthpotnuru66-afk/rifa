import { motion } from 'framer-motion';
import { Lightbulb, Palette, Gem, Gift, Clock, Users, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        num: '01',
        icon: <Lightbulb size={22} strokeWidth={1.5} />,
        title: "We Don't Sell Products. We Create What You Imagine.",
        description: "Most brands have a fixed catalogue. We don't. If you have an idea, a Pinterest reference, or a rough imagination, we build the product around you.",
    },
    {
        num: '02',
        icon: <Palette size={22} strokeWidth={1.5} />,
        title: "One Brand. Multiple Art Forms.",
        description: "Resin, Crochet, Satin, Clay, Canvas — we master them all. Combine art forms in a single piece for something completely one-of-a-kind.",
    },
    {
        num: '03',
        icon: <Gem size={22} strokeWidth={1.5} />,
        title: "Premium Quality. Accessible Pricing.",
        description: "Better quality than market alternatives at honest prices. Handmade shouldn't cost a fortune — it should cost what it's worth.",
    },
    {
        num: '04',
        icon: <Gift size={22} strokeWidth={1.5} />,
        title: "Complimentary Gift With Every Order.",
        description: "Every order includes a handcrafted complimentary gift — our way of saying thank you for trusting us with your emotions.",
    },
    {
        num: '05',
        icon: <Clock size={22} strokeWidth={1.5} />,
        title: "Handcrafted With Time & Intention.",
        description: "We don't mass produce. Every piece is made with patience and emotional care — as if it were a gift for our own loved ones.",
    },
    {
        num: '06',
        icon: <Users size={22} strokeWidth={1.5} />,
        title: "Built by an Entrepreneur Who Cares.",
        description: "This is a vision, not just a business. We are consistent, communicative, and deeply invested in your experience from first message to final delivery.",
    },
    {
        num: '07',
        icon: <Palette size={22} strokeWidth={1.5} />,
        title: "The Spirit of Collaboration.",
        description: "We don't just work alone. We collaborate with passionate artisans to bring diverse art forms to your doorstep. Interested? Come collaborate with us.",
    },
];

const stats = [
    { value: '27', label: 'Orders in month one' },
    { value: '8+', label: 'Art forms mastered' },
    { value: '100%', label: 'Custom, no catalogue' },
    { value: '∞', label: 'Creative possibilities' },
];

const WhyUs = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-transparent text-neutral-900 selection:bg-brand-pink/20">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12 max-w-3xl mx-auto pt-12"
                >
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">The Difference</h2>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 tracking-tighter mb-8 leading-[0.95]">
                        Why Choose<br />
                        <span className="italic font-light text-neutral-400">Rifa?</span>
                    </h1>
                    <p className="text-xl text-neutral-500 font-light leading-relaxed">
                        In a world full of mass-produced goods, we exist for those who demand meaning, emotion, and absolute creative freedom.
                    </p>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 border border-neutral-200 bg-white mb-16"
                >
                    {stats.map((s, i) => (
                        <div key={i} className={`p-8 md:p-10 text-center ${i < stats.length - 1 ? 'border-b md:border-b-0 md:border-r border-neutral-200' : ''}`}>
                            <div className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 mb-2">{s.value}</div>
                            <div className="text-xs font-bold tracking-widest uppercase text-brand-pink">{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Feature grid — editorial list style */}
                <div className="mb-16">
                    <div className="flex justify-between items-end border-b border-neutral-950 pb-4 mb-0">
                        <h2 className="text-3xl font-serif font-bold text-neutral-950">Our Advantages</h2>
                        <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">7 Reasons</span>
                    </div>

                    {features.map((f, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group border-b border-neutral-200 relative cursor-default"
                        >
                            <div className="absolute inset-0 bg-neutral-950 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center py-7 md:py-8 gap-6 px-2 md:px-4">
                                <span className="text-3xl md:text-4xl font-serif text-neutral-400 group-hover:text-brand-pink transition-colors duration-500 font-light w-16 flex-shrink-0">
                                    {f.num}
                                </span>
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-rose-100 border border-brand-rose-100 group-hover:bg-brand-pink group-hover:border-brand-pink group-hover:text-white flex items-center justify-center text-brand-pink transition-all duration-500">
                                    {f.icon}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg md:text-xl font-serif font-bold text-neutral-950 group-hover:text-white transition-colors duration-500 mb-1">
                                        {f.title}
                                    </h3>
                                    <p className="text-neutral-500 font-light text-sm leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                                        {f.description}
                                    </p>
                                </div>
                                <div className="hidden lg:flex justify-end w-12 text-neutral-200 group-hover:text-neutral-700 transition-colors duration-500 flex-shrink-0">
                                    <Check size={24} strokeWidth={1} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Artisan Partnership Section */}
                <div className="mb-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center bg-white border border-neutral-100 p-8 md:p-16">
                        <div className="space-y-8">
                            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-brand-pink">For the Masters of Craft</h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 leading-[0.95] tracking-tighter">
                                Your Art. Our Stage.<br />
                                <span className="italic font-light text-neutral-400 text-3xl md:text-4xl">A Sanctuary for Global Artisans.</span>
                            </h3>
                            <p className="text-neutral-500 font-light leading-relaxed max-w-md">
                                Are you a master of your craft seeking a global audience? Rifa is more than a marketplace — it's a collaborative ecosystem designed to elevate heritage art forms to the world stage.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Global Audience & Premium Reach",
                                    "Transparent Fair-Trade Pricing",
                                    "Story-First Narrative Marketing",
                                    "Heritage Preservation Infrastructure"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
                                        <div className="w-1.5 h-1.5 bg-brand-pink rounded-full" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-4">
                                <Link
                                    to="/collaborate"
                                    className="inline-flex items-center gap-3 px-8 py-3 bg-neutral-950 text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-brand-pink transition-all duration-500 group"
                                >
                                    Join the Collective
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-neutral-950 p-8 md:p-12 border border-neutral-800 group overflow-hidden shadow-2xl">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full -ml-32 -mb-32" />

                            <div className="relative z-10 w-full h-full border border-neutral-800 flex flex-col items-center justify-center p-8 text-center space-y-8">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-brand-pink">
                                        <Palette size={20} />
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-brand-gold">
                                        <Gem size={20} />
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400">
                                        <Clock size={20} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold/60">The Artisan Partnership</p>
                                    <h4 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">
                                        Empowering Every<br />
                                        <span className="text-neutral-500 not-italic">Masterpiece.</span>
                                    </h4>
                                </div>

                                <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Join 50+ Global Masters</p>
                                    <p className="text-[8px] text-neutral-600 uppercase tracking-widest italic">Across 8+ Specialized Art Forms</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-neutral-950 text-white p-16 md:p-24 text-center max-w-5xl mx-auto"
                >
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-6">Begin Your Journey</h2>
                    <h3 className="text-4xl md:text-5xl font-serif font-bold mb-8">Ready to Create Something Unique?</h3>
                    <p className="text-neutral-400 font-light text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                        No catalogue. No limits. Just your vision, our hands, and a result that means something.
                    </p>
                    <Link
                        to="/creations"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-white text-neutral-950 text-xs font-bold tracking-widest uppercase hover:bg-brand-pink hover:text-white transition-colors duration-500 group"
                    >
                        Start Customizing
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

            </div>
        </div>
    );
};

export default WhyUs;
