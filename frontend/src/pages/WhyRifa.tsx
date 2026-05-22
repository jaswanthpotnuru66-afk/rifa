import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Gift, Globe,
    ShieldCheck, Zap, 
    ArrowRight, Lightbulb, Gem,
    Users, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WhyRifa = () => {
    const [activeTab, setActiveTab] = useState<'customer' | 'maker'>('customer');

    const customerBenefits = [
        {
            icon: <Lightbulb className="text-brand-pink" size={32} />,
            title: "We Create What You Imagine",
            description: "No fixed catalogues. If you have a Pinterest board or a rough sketch, we turn it into a tangible masterpiece."
        },
        {
            icon: <Palette className="text-brand-pink" size={32} />,
            title: "Multi-Disciplinary Mastery",
            description: "Combine resin, crochet, clay, and canvas in a single creation. We are the architects of hybrid art."
        },
        {
            icon: <Gem className="text-brand-pink" size={32} />,
            title: "Premium Yet Accessible",
            description: "High-fashion quality at honest prices. We believe luxury should be measured by emotion, not just cost."
        },
        {
            icon: <Gift className="text-brand-pink" size={32} />,
            title: "A Gift With Every Order",
            description: "Every commission comes with a complimentary handcrafted surprise — our way of sharing the joy."
        }
    ];

    const makerBenefits = [
        {
            icon: <Globe className="text-brand-pink" size={32} />,
            title: "Global Stage for Local Art",
            description: "We bring your craft to high-intent luxury seekers who value authenticity over mass production."
        },
        {
            icon: <ShieldCheck className="text-brand-pink" size={32} />,
            title: "Standardized Treasury",
            description: "Focus on your art while we handle the financial complexity with our secure, automated payout system."
        },
        {
            icon: <Zap className="text-brand-pink" size={32} />,
            title: "Zero Marketing Cost",
            description: "We act as your dedicated PR and marketing team, driving high-quality traffic to your creations."
        },
        {
            icon: <Users className="text-brand-pink" size={32} />,
            title: "Artisan Community",
            description: "Join an elite circle of master makers. Collaborate on cross-discipline projects and grow together."
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-8 px-6 overflow-hidden border-b border-neutral-100">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-pink mb-6"
                    >
                        The Rifa Manifesto
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 mb-8 leading-[0.95]"
                    >
                        Where Imagination <br />
                        <span className="italic text-neutral-400 font-light">Meets Mastery.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-neutral-500 max-w-2xl mx-auto font-medium"
                    >
                        Whether you are seeking a one-of-a-kind treasure or looking to share your craft with the world, Rifa is the bridge between emotion and art.
                    </motion.p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-pink/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
            </section>

            {/* Tab Navigation */}
            <section className="relative z-40 bg-[#FAF7F2] border-b border-neutral-100 py-4">
                <div className="max-w-xl mx-auto px-6">
                    <div className="flex p-1 bg-neutral-200/50 rounded-sm">
                        <button
                            onClick={() => setActiveTab('customer')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${activeTab === 'customer' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            For the Customer
                        </button>
                        <button
                            onClick={() => setActiveTab('maker')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${activeTab === 'maker' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            For the Artisan
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                <motion.section 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="py-12 px-6 max-w-7xl mx-auto"
                >
                    <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                        <div>
                            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-brand-pink mb-6">
                                {activeTab === 'customer' ? 'The Seeker\'s Journey' : 'The Maker\'s Stage'}
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 mb-8 leading-tight">
                                {activeTab === 'customer'
                                    ? "Stop buying goods. Start commissioning emotions."
                                    : "Scale your craft without losing your soul."
                                }
                            </h3>
                            <p className="text-neutral-500 text-lg font-medium leading-relaxed mb-10">
                                {activeTab === 'customer'
                                    ? "We provide a direct channel to India's finest artisans, allowing you to bypass the mass-market and co-create pieces that tell your unique story."
                                    : "Rifa provides the infrastructure of a global enterprise with the intimacy of a local boutique. Join us to preserve heritage and build a sustainable business."
                                }
                            </p>
                            <Link
                                to={activeTab === 'customer' ? '/custom-order' : '/collaborate'}
                                className="inline-flex items-center gap-3 px-10 py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-pink transition-all"
                            >
                                {activeTab === 'customer' ? 'Commission Now' : 'Apply to be a Maker'}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="relative aspect-square">
                            <div className="absolute inset-0 bg-neutral-200 rounded-sm overflow-hidden">
                                <img loading="lazy"
                                    src={activeTab === 'customer' 
                                        ? "/customer_lifestyle.png" 
                                        : "/artisan_studio.png"
                                    }
                                    alt={activeTab === 'customer' ? "Rifa Lifestyle" : "Artisan Mastery"}
                                    className="w-full h-full object-cover grayscale-[10%]"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b border-r border-brand-pink/30 hidden md:block" />
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {(activeTab === 'customer' ? customerBenefits : makerBenefits).map((benefit, idx) => (
                            <div
                                key={idx}
                                className="p-8 bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 transition-all group"
                            >
                                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">
                                    {benefit.icon}
                                </div>
                                <h4 className="text-lg font-bold text-neutral-950 mb-3">{benefit.title}</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </AnimatePresence>

            {/* Philosophy Section */}
            <section className="bg-neutral-950 py-32 px-6 text-center relative overflow-hidden">
                <Sparkles className="text-brand-pink/40 mx-auto mb-8 animate-pulse" size={48} />
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 italic">
                    "In the digital age, the human touch <br /> is the ultimate luxury."
                </h2>
                <div className="w-24 h-px bg-brand-pink/30 mx-auto mb-12" />
                <div className="flex justify-center gap-12">
                    <div>
                        <p className="text-2xl font-serif font-bold text-white">50+</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Master Makers</p>
                    </div>
                    <div>
                        <p className="text-2xl font-serif font-bold text-white">100%</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Customized</p>
                    </div>
                    <div>
                        <p className="text-2xl font-serif font-bold text-white">8+</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Art Forms</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 text-center bg-white border-t border-neutral-100">
                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-6 tracking-tight">Be part of the movement.</h2>
                <p className="text-neutral-500 mb-12 font-medium max-w-xl mx-auto">Whether you are buying or building, your journey with Rifa starts with a single step towards authenticity.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/marketplace"
                        className="w-full sm:w-auto px-12 py-5 bg-neutral-950 text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl"
                    >
                        Explore the Shop
                    </Link>
                    <Link
                        to="/collaborate"
                        className="w-full sm:w-auto px-12 py-5 border border-neutral-200 text-neutral-950 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
                    >
                        Collaborate with Us
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default WhyRifa;
