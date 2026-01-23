import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';
import aboutBg from '../assets/about_founder_crafting.png';

const About = () => {
    return (
        <div className="pt-16 min-h-screen bg-brand-cream">
            {/* Header */}
            <section className="relative py-20 bg-brand-rose-50 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto px-4"
                >
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-4">Our Story</h1>
                    <p className="text-lg text-gray-600">Founded on Rakhi, August 7, 2025</p>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
                {/* Section 1: How it Started (Text Left, Image Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl font-serif font-bold text-brand-text">How it Started</h2>
                        <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                            <p>
                                Rifa Arts & Crafts was founded on August 7, 2025, on the occasion of Rakhi, with a clear vision — to build a trusted handmade gifting brand where creativity has no limits.
                            </p>
                            <p>
                                In the very first month, we received 27 orders, proving that people genuinely value handmade and personalized gifts. After a short academic break, we restarted on December 2nd and haven't looked back since.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-all duration-500">
                            <img src={aboutBg} alt="Founder crafting" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                </div>

                {/* Section 2: Why I Chose This Field (Card Style) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center max-w-5xl mx-auto relative overflow-hidden"
                >

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl font-serif font-bold text-brand-text">Why I Chose This Field</h2>
                        <div className="space-y-6 text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                            <p className="font-serif italic text-xl text-brand-menu-text">
                                "I chose the handmade gifting field because I believe gifts should carry emotions, not just price tags."
                            </p>
                            <p>
                                "Every product I make is imagined as if it were my own gift for someone I care about. I spend hours crafting each item with patience, attention, and emotional involvement — something mass-produced products can never offer."
                            </p>
                            <p>
                                "This brand is also my foundation as an entrepreneur. Rifa Arts & Crafts is my learning ground, my passion, and my stepping stone toward building a larger, trusted brand."
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Our Vision & Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-serif font-bold mb-6 text-brand-text">Our Vision</h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            To become a one-stop destination for customized handmade gifts, décor, and emotional gifting — where customers feel understood, valued, and excited to create something unique.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-brand-rose-100"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-rose-50 rounded-full text-brand-pink">
                                    <Heart size={24} className="fill-current" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-text">Made with Heart</h4>
                                    <p className="text-sm text-gray-500">Every detail matters personally.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-rose-50 rounded-full text-brand-pink">
                                    <Users size={24} className="fill-current" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-text">Customer First</h4>
                                    <p className="text-sm text-gray-500">Your happiness is our success.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
