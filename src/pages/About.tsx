import { motion } from 'framer-motion';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import aboutBg from '../assets/about_founder_crafting.png';

const milestones = [
    { year: 'Aug 2025', label: 'Founded on Rakhi' },
    { year: 'Month 1', label: '27 orders received' },
    { year: 'Dec 2025', label: 'Relaunched stronger' },
    { year: 'Now',      label: 'Still crafting with heart' },
];

const values = [
    {
        icon: <Heart size={24} strokeWidth={1.5} />,
        title: 'Made with Heart',
        desc: 'Every detail is considered personally, ensuring your gift carries the exact emotional weight you intended.',
    },
    {
        icon: <Users size={24} strokeWidth={1.5} />,
        title: 'Customer First',
        desc: "Your happiness is our ultimate success metric. We don't rest until the final piece is absolutely perfect.",
    },
];

const About = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-transparent">

            {/* Hero Header */}
            <section className="relative py-16 md:py-24 bg-white border-b border-neutral-200 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mx-auto px-4 text-center"
                >
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-6">Our Heritage</h2>
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-neutral-950 tracking-tighter mb-8 leading-[0.9]">
                        The Story<br />
                        <span className="italic font-light text-neutral-400">of Rifa.</span>
                    </h1>
                    <p className="text-xl text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto">
                        Born from a belief that gifts should carry emotions, not just price tags — founded on Rakhi, August 7, 2025.
                    </p>
                </motion.div>

                {/* Milestone timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-4xl mx-auto px-4 mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-neutral-200"
                >
                    {milestones.map((m, i) => (
                        <div key={i} className={`py-8 px-4 text-center ${i < milestones.length - 1 ? 'border-r border-neutral-200' : ''}`}>
                            <div className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-2">{m.year}</div>
                            <div className="font-serif text-lg font-bold text-neutral-950">{m.label}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-16 space-y-16">

                {/* Chapter I — How it Started */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">Chapter I</h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 tracking-tight leading-tight">How It Started</h3>
                        </div>
                        <div className="space-y-6 text-lg text-neutral-600 font-light leading-relaxed">
                            <p>
                                Rifa Arts &amp; Crafts was founded on August 7, 2025, on the occasion of Rakhi, with a clear vision — to build a trusted handmade gifting brand where creativity has no limits.
                            </p>
                            <p>
                                In the very first month, we received 27 orders, proving that people genuinely value handmade and personalised gifts. After a short academic break, we relaunched on December 2nd and haven't looked back since.
                            </p>
                        </div>

                        {/* Pull stat */}
                        <div className="flex items-baseline gap-4 border-l-2 border-brand-pink pl-6">
                            <span className="text-5xl font-serif font-bold text-neutral-950">27</span>
                            <span className="text-neutral-500 font-light">orders in our very first month</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] overflow-hidden bg-neutral-100 relative group">
                            <img
                                src={aboutBg}
                                alt="Founder crafting"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                        {/* Offset border accent */}
                        <div className="absolute -bottom-4 -right-4 w-full h-full border border-neutral-300 pointer-events-none -z-10" />
                    </motion.div>
                </div>

                {/* Philosophy — Dark editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-neutral-950 text-white p-12 md:p-24 max-w-6xl mx-auto"
                >
                    <div className="space-y-10 text-center">
                        <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink">The Philosophy</h2>

                        <p className="font-serif italic text-3xl md:text-5xl leading-tight max-w-4xl mx-auto text-white">
                            "I chose the handmade gifting field because I believe gifts should carry emotions, not just price tags."
                        </p>

                        <div className="space-y-6 text-lg text-neutral-400 font-light leading-relaxed max-w-3xl mx-auto pt-8 border-t border-neutral-800">
                            <p>
                                Every product I make is imagined as if it were my own gift for someone I care about. I spend hours crafting each item with patience, attention, and emotional involvement — something mass-produced products can never offer.
                            </p>
                            <p>
                                This brand is also my foundation as an entrepreneur. Rifa Arts &amp; Crafts is my learning ground, my passion, and my stepping stone toward building a larger, trusted brand.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Vision & Values */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto border-t border-neutral-200 pt-16">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">The Future</h2>
                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 tracking-tight mb-8 leading-tight">Our Vision</h3>
                        <p className="text-neutral-600 text-xl font-light leading-relaxed border-l-2 border-brand-pink pl-6 mb-12">
                            To become a one-stop destination for customised handmade gifts, décor, and emotional gifting — where every customer feels understood, valued, and excited to create something uniquely theirs.
                        </p>
                        <Link
                            to="/custom-order"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-950 text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-700 transition-all duration-300 group"
                        >
                            Commission a Piece
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="space-y-6"
                    >
                        {values.map((v, i) => (
                            <div key={i} className="group flex items-start gap-6 p-8 border border-neutral-200 bg-white hover:border-neutral-950 hover:shadow-lg transition-all duration-500">
                                <div className="flex-shrink-0 w-12 h-12 border border-neutral-200 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white text-neutral-700 flex items-center justify-center transition-all duration-500">
                                    {v.icon}
                                </div>
                                <div>
                                    <h4 className="font-serif text-xl font-bold text-neutral-950 mb-2">{v.title}</h4>
                                    <p className="text-neutral-500 font-light leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default About;
