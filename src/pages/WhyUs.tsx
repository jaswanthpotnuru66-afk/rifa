import { motion } from 'framer-motion';
import { Lightbulb, Palette, Gem, Gift, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhyUs = () => {
    const features = [
        {
            icon: <Lightbulb size={32} />,
            title: "We Don't Sell Products. We Create What You Imagine.",
            description: "Most brands have a fixed catalogue. We don’t. If you have an idea, a Pinterest reference, or a rough imagination, we build the product around YOU."
        },
        {
            icon: <Palette size={32} />,
            title: "One Brand. Multiple Art Forms.",
            description: "Resin, Crochet, Satin, Clay, Canvas... we combine them all. You can create a bouquet with Resin + Crochet + Satin all in one!"
        },
        {
            icon: <Gem size={32} />,
            title: "Premium Quality Without Premium Pricing",
            description: "Comparable to market prices of ₹150-200, we offer better quality at around ₹100. Handmade should be accessible."
        },
        {
            icon: <Gift size={32} />,
            title: "Complimentary Gifts",
            description: "Every order includes a complimentary handmade gift. Because we want to say thank you for trusting us with your emotions."
        },
        {
            icon: <Clock size={32} />,
            title: "Handcrafted With Time",
            description: "We don't mass produce. Every piece is crafted with patience and emotional involvement, just like a gift for our own loved ones."
        },
        {
            icon: <Users size={32} />,
            title: "Built by an Entrepreneur",
            description: "This is a vision to build a trusted brand. We are consistent, we communicate, and we care about your experience."
        }
    ];

    return (
        <div className="pt-24 pb-16 min-h-screen bg-brand-cream">
            <div className="max-w-4xl mx-auto px-4 text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-6"
                >
                    Why Choose Rifa Arts & Crafts?
                </motion.h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    In a world full of handmade brands, we exist for people who don't want "just a product" —
                    they want meaning, emotion, and freedom.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose-100 hover:shadow-md transition-all"
                    >
                        <div className="w-16 h-16 bg-brand-rose-50 text-brand-pink rounded-full flex items-center justify-center mb-6">
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-4 text-gray-800">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </motion.div>
                ))}
            </div>

            <div className="text-center mt-16">
                <h2 className="text-3xl font-serif font-bold mb-6">Ready to Create Something Unique?</h2>
                <Link to="/custom-order" className="btn-primary inline-flex items-center gap-2 text-lg">
                    Start Customizing <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
};

export default WhyUs;
