import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
    { name: 'Resin Art', items: ['Frames', 'Keychains', 'Phone Cases', 'Clocks', 'Preservations'] },
    { name: 'Crochet Creations', items: ['Bouquets', 'Wearables', 'Accessories', 'Keychains'] },
    { name: 'Satin Ribbon Flowers', items: ['Bouquets', 'Single Flowers', 'Combos'] },
    { name: 'Pipe Cleaner Art', items: ['Flowers', 'Decor', 'Keychains'] },
    { name: 'Customized Bouquets', items: ['Mixed Media', 'With Gifts', 'Chocolates'] },
    { name: 'Gift Hampers', items: ['Birthday', 'Anniversary', 'Surprise Boxes'] },
    { name: 'Clay Art', items: ['Trays', 'Frames', 'Charms'] },
    { name: 'Home Decor', items: ['Fridge Magnets', 'Mini Frames'] },
];

const Creations = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-brand-cream">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-4">Our Creations</h1>
                    <div className="bg-brand-rose-50 border border-brand-rose-100 rounded-xl p-4 md:p-6 max-w-3xl mx-auto shadow-sm mt-6">
                        <p className="text-brand-text font-medium text-lg leading-relaxed">
                            ⚠️ Note: This is an inspiration gallery, not a shop. All designs shown are for reference only.
                            Sizes, colors, materials, and combinations are fully customizable.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-brand-rose-100"
                        >
                            <div className="h-48 bg-brand-rose-100 flex items-center justify-center text-brand-text/50 font-serif italic text-xl">
                                {/* Placeholder for real images */}
                                {cat.name} Image
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-serif font-bold mb-4">{cat.name}</h3>
                                <ul className="space-y-2">
                                    {cat.items.map((item) => (
                                        <li key={item} className="text-gray-600 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-brand-text text-white rounded-[2rem] p-12 text-center shadow-lg md:mx-auto max-w-5xl"
                >
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to create your own?</h2>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                        If you didn't see exactly what you wanted, don't worry. That's our specialty. Let's build it from scratch.
                    </p>
                    <Link
                        to="/custom-order"
                        className="inline-block px-8 py-4 bg-white text-brand-text font-medium rounded-full hover:bg-brand-rose-50 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    >
                        Start Customizing
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Creations;
