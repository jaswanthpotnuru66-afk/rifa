
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Palette, Gift, Sparkles, ArrowRight, Lightbulb, ScrollText } from 'lucide-react';
import heroBg from '../assets/hero_banner.png';

const Home = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center px-4">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-transparent to-transparent"></div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.3 } }
                    }}
                    className="relative z-10 max-w-4xl mx-auto space-y-6 pt-16"
                >
                    <motion.h1
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                        }}
                        className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white drop-shadow-md leading-tight"
                    >
                        Customized Handmade Gifts, <br />
                        <span className="bg-gradient-to-r from-blue-900 to-slate-800 bg-clip-text text-transparent italic">Made With Heart</span>
                    </motion.h1>

                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                        }}
                        className="text-lg md:text-2xl text-white/90 font-light max-w-2xl mx-auto"
                    >
                        No fixed catalogue. No limits. Just your imagination turned into reality.
                    </motion.p>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                        }}
                        className="pt-8"
                    >
                        <Link to="/custom-order" className="px-8 py-4 bg-slate-900 text-white rounded-full text-lg shadow-lg hover:scale-105 hover:bg-slate-800 transform border border-white/20 transition-all duration-300">
                            👉 Customize Your Gift
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Our Essence */}
            <section className="section-padding text-center bg-brand-cream relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                </div>

                <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-text">
                        Our Essence
                    </h2>
                    <div className="space-y-8 text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                        <p>
                            <span className="font-semibold text-brand-text">Rifa Arts & Crafts</span> is a multi-art, customization-based handmade gifting brand with no fixed catalogue.
                            Customers can combine <span className="italic text-gray-900">resin art, crochet, satin ribbon flowers, pipe cleaners, clay art, canvas art, bouquets,</span> and more into a single customized creation.
                        </p>

                        <div className="flex items-center justify-center gap-4 opacity-50">
                            <div className="h-px w-12 bg-brand-text"></div>
                            <Heart size={16} className="text-brand-rose-500" />
                            <div className="h-px w-12 bg-brand-text"></div>
                        </div>

                        <p>
                            Every product is handcrafted with <span className="font-medium text-brand-rose-600">emotional involvement</span>, offered at affordable pricing, and includes a complimentary handmade gift.
                            The brand focuses on <span className="text-gray-900 font-medium">trust, personalization, and long-term relationship building</span> rather than mass production.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Why We Are Different - Features */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {/* Feature 1 */}
                        <motion.div variants={fadeInUp} className="p-8 bg-brand-rose-50 rounded-2xl text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-brand-rose-200 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-rose-500">
                                <Palette size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-3">No Fixed Catalogue</h3>
                            <p className="text-gray-600">Your imagination is our catalogue. Pinterest-to-product customization is our specialty.</p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div variants={fadeInUp} className="p-8 bg-brand-rose-50 rounded-2xl text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-brand-rose-200 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-rose-500">
                                <Gift size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-3">Affordable & Personal</h3>
                            <p className="text-gray-600">Premium quality at affordable prices, plus a complimentary handmade gift with every order.</p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div variants={fadeInUp} className="p-8 bg-brand-rose-50 rounded-2xl text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-brand-rose-200 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-rose-500">
                                <Heart size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-3">Made with Emotion</h3>
                            <p className="text-gray-600">Every piece is crafted patience, attention, and emotional involvement.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Art Forms Grid */}
            <section className="section-padding bg-brand-cream">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Art Forms We Master</h2>
                    <p className="text-gray-600">All designs are customizable references.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        'Resin Art', 'Crochet', 'Satin Flowers', 'Pipe Cleaners',
                        'Clay Art', 'Canvas Art', 'Bouquets', 'Hampers'
                    ].map((item, index) => (
                        <motion.div
                            key={item}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center border border-brand-rose-100 flex flex-col items-center justify-center aspect-square"
                        >
                            <Sparkles className="text-brand-gold mb-3 opacity-50" />
                            <h3 className="font-serif font-medium text-lg leading-tight">{item}</h3>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-text">How Custom Orders Work</h2>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {[
                            { step: 1, title: 'Share Your Idea', icon: <Lightbulb size={28} />, desc: 'Pinterest, Instagram or just your imagination.' },
                            { step: 2, title: 'Details', icon: <Palette size={28} />, desc: 'Choose budget, colors, size & occasion.' },
                            { step: 3, title: 'Confirmation', icon: <ScrollText size={28} />, desc: 'We personally confirm details and pricing.' },
                            { step: 4, title: 'Handcrafting', icon: <Heart size={28} />, desc: 'Your gift is created with extreme care.' },
                            { step: 5, title: 'Delivery', icon: <Gift size={28} />, desc: 'Delivered with a free handmade gift! 🎁' }
                        ].map((s, index) => (
                            <motion.div
                                key={s.step}
                                custom={index}
                                variants={{
                                    hidden: { opacity: 0, y: 50 },
                                    visible: (i) => ({
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            delay: i * 0.15,
                                            duration: 0.8,
                                            ease: [0.215, 0.610, 0.355, 1.000], // Cubic bezier for smooth 'pop'
                                        }
                                    })
                                }}
                                whileHover={{ scale: 1.05 }}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className="relative">
                                    <motion.div
                                        className="w-16 h-16 bg-brand-rose-50 text-brand-text rounded-full flex items-center justify-center font-serif text-xl font-medium mb-6 shadow-sm border border-brand-rose-100 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-shadow duration-300 relative z-10"
                                    >
                                        {s.icon}
                                    </motion.div>

                                    {/* Arrow (Hidden on mobile, visible on desktop) */}
                                    {index < 4 && (
                                        <div className="hidden md:block absolute top-1/2 -right-[4.5rem] -translate-y-1/2 -mt-3 text-brand-rose-300 z-0">
                                            <ArrowRight size={28} strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-serif font-bold text-xl mb-3 text-brand-text">{s.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed px-2">{s.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Trust & Journey */}
            {/* Trust & Journey */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto bg-white rounded-[2rem] p-12 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-3xl font-serif font-bold mb-10">Our Journey of Trust</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-4">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">27+</div>
                            <p className="text-gray-600 font-medium">Orders in Month 1</p>
                        </div>
                        <div className="p-4">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">100%</div>
                            <p className="text-gray-600 font-medium">Handmade with Love</p>
                        </div>
                        <div className="p-4">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">Premium</div>
                            <p className="text-gray-600 font-medium">Quality Guaranteed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-brand-text text-white text-center px-4">
                <h2 className="text-4xl font-serif font-bold mb-6">Have an Idea in Mind?</h2>
                <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">Let's create something meaningful together. Your special person deserves a gift as unique as they are.</p>
                <Link to="/custom-order" className="btn-primary !bg-white !text-brand-text hover:!bg-brand-rose-100">
                    Customize Your Gift
                </Link>
            </section>
        </div>
    );
};

export default Home;
