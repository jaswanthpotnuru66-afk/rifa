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

// PRO TIP: This dynamically imports all images from the gallery folder!
// No need to manually import each one. Just drop files there.
const galleryImports = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,webp}', { eager: true });
const galleryImages = Object.values(galleryImports).map((img: any) => img.default);

const Creations = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-brand-cream">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-4">Our Creations</h1>
                    <div className="bg-brand-rose-50 border border-brand-rose-100 rounded-xl p-4 md:p-6 max-w-3xl mx-auto shadow-sm mt-6">
                        <p className="text-brand-text font-medium text-lg leading-relaxed">
                            
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
                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-rose-100 hover:border-brand-rose-200 border-t-4 border-t-brand-pink group"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-serif font-bold text-brand-text group-hover:text-brand-pink transition-colors">
                                        {cat.name}
                                    </h3>
                                    <span className="bg-brand-rose-50 text-brand-text/60 p-2 rounded-full group-hover:bg-brand-pink/10 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.048 4.025a3 3 0 0 1-5.94-.276c0-2.444.886-4.76 2.376-6.691a3.001 3.001 0 0 1 3.83.008h.005a7.5 7.5 0 0 1 2.336 3.935 21.47 21.47 0 0 0 3.28-2.72m0 0a8.7 8.7 0 0 1-1.928-3.516A11.147 11.147 0 0 1 11.896 1.75a2 2 0 0 0-3.792 0 11.147 11.147 0 0 1-3.235 4.486A8.701 8.701 0 0 0 1.054 12" />
                                        </svg>
                                    </span>
                                </div>
                                <ul className="space-y-3">
                                    {cat.items.map((item) => (
                                        <li key={item} className="text-gray-600 flex items-center gap-3 group/item">
                                            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full group-hover/item:scale-125 transition-transform"></span>
                                            <span className="group-hover/item:text-brand-text transition-colors">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Gallery of Possibilities Section */}
                <div className="mt-24 mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-4">Gallery of Possibilities</h2>
                        <p className="text-brand-text/70 max-w-2xl mx-auto text-lg">
                            A mix of our original masterpieces and curated inspirations.
                            We can bring any of these concepts to life for you.
                        </p>
                    </div>

                    {/* Placeholder Grid for Images */}
                    {/* 
                        USER INSTRUCTION: 
                        1. Add your images to the 'src/assets/gallery' folder (create it if it doesn't exist).
                        2. Import them here or use their paths.
                        3. For now, duplication used to simulate content.
                    */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(galleryImages.length > 0 ? galleryImages : [1, 2, 3, 4, 5, 6, 7, 8]).map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative group overflow-hidden rounded-2xl bg-brand-rose-100 ${
                                    // Masonry logic: Make every 3rd item span 2 cols/rows (if we have enough items)
                                    galleryImages.length > 0
                                        ? (idx % 5 === 0 ? 'md:col-span-2 md:row-span-2' : '') // Randomize slightly for real images
                                        : (idx % 3 === 0 ? 'md:col-span-2 md:row-span-2' : '')
                                    }`}
                            >
                                {galleryImages.length > 0 ? (
                                    <img
                                        src={item as string}
                                        alt={`Gallery piece ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    /* Placeholder Content */
                                    <div className="aspect-square w-full h-full flex items-center justify-center text-brand-text/30 bg-brand-rose-50 hover:bg-brand-rose-100 transition-colors duration-500">
                                        <span className="font-serif italic text-lg">Image {item}</span>
                                    </div>
                                )}

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <p className="text-white font-medium tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View Art</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
