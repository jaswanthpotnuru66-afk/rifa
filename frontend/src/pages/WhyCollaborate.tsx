import { motion } from 'framer-motion';
import { 
    Globe, ShieldCheck, Zap, 
    Heart, BarChart3, Users,
    ArrowRight, Star, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WhyCollaborate = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const benefits = [
        {
            icon: <Globe className="text-brand-pink" size={32} />,
            title: "Global Reach, Local Soul",
            description: "We bring your local craftsmanship to a global audience of high-intent collectors and luxury seekers who value authenticity over mass production."
        },
        {
            icon: <ShieldCheck className="text-brand-pink" size={32} />,
            title: "Secure Treasury System",
            description: "Experience worry-free commerce with our standardized payout system. We handle the financial complexity so you can focus on your art."
        },
        {
            icon: <Zap className="text-brand-pink" size={32} />,
            title: "Zero Marketing Overhead",
            description: "Stop spending on ads. We curate the marketplace and drive high-quality traffic to your shop, acting as your dedicated PR and marketing team."
        },
        {
            icon: <Heart className="text-brand-pink" size={32} />,
            title: "Preserve the Heritage",
            description: "Our platform is built specifically for natural materials and traditional techniques. We tell the story behind every piece you create."
        },
        {
            icon: <BarChart3 className="text-brand-pink" size={32} />,
            title: "Advanced Analytics",
            description: "Gain deep insights into buyer behavior, trending art forms, and seasonal demands through our bespoke artisan dashboard."
        },
        {
            icon: <Users className="text-brand-pink" size={32} />,
            title: "Artisan Community",
            description: "Join an elite circle of master makers. Collaborate on cross-discipline projects and share knowledge in our exclusive forums."
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-neutral-100">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAF7F2]/90 z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop" 
                        alt="Artisan at work" 
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>

                <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
                    <motion.p 
                        {...fadeIn}
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-pink mb-6"
                    >
                        The Future of Craftsmanship
                    </motion.p>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 mb-8 leading-tight"
                    >
                        Empowering Artisans to <br /> 
                        <span className="italic text-neutral-400">Scale the Soul.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto font-medium"
                    >
                        Rifa isn't just a marketplace; it's a high-fashion ecosystem designed to bridge the gap between traditional mastery and modern luxury commerce.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Link 
                            to="/collaborate" 
                            className="inline-flex items-center gap-3 px-10 py-5 bg-neutral-950 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-pink transition-all shadow-2xl group"
                        >
                            Begin Your Journey
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Value Props Grid */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-950 mb-4">Why Collaborate with Rifa?</h2>
                    <p className="text-neutral-500 max-w-xl mx-auto">We provide the infrastructure of a global enterprise with the intimacy of a local boutique.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {benefits.map((benefit, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 bg-white border border-neutral-100 rounded-sm hover:border-brand-pink/30 hover:shadow-xl hover:shadow-brand-pink/5 transition-all group"
                        >
                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-bold text-neutral-950 mb-3">{benefit.title}</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed font-medium">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Statement Section */}
            <section className="bg-neutral-950 py-32 px-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <Star className="text-brand-pink mb-8 mx-auto" size={40} />
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-12 leading-tight italic">
                        "In a world of mass-produced plastic, <br /> 
                        the hand of the maker is the ultimate luxury."
                    </h2>
                    <div className="w-24 h-px bg-brand-pink/30 mx-auto mb-8" />
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Our Core Philosophy</p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 text-center bg-white border-t border-neutral-100">
                <div className="max-w-2xl mx-auto">
                    <Sparkles className="text-brand-pink mb-6 mx-auto" size={32} />
                    <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-6">Ready to redefine your craft?</h2>
                    <p className="text-neutral-500 mb-12 font-medium">Join 200+ master makers already scaling their soul through Rifa.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/collaborate" 
                            className="w-full sm:w-auto px-12 py-5 bg-brand-pink text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-pink-dark transition-all shadow-xl shadow-brand-pink/20"
                        >
                            Apply to be a Maker
                        </Link>
                        <Link 
                            to="/contact" 
                            className="w-full sm:w-auto px-12 py-5 border border-neutral-200 text-neutral-950 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
                        >
                            Speak with an Advisor
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WhyCollaborate;
