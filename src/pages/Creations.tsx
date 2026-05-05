import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categories = [
    { name: 'Resin Art',            img: '/art_forms/resin_art.png',    items: ['Frames', 'Keychains', 'Phone Cases', 'Clocks', 'Preservations'] },
    { name: 'Crochet Creations',    img: '/art_forms/crochet.png',      items: ['Bouquets', 'Wearables', 'Accessories', 'Keychains'] },
    { name: 'Satin Ribbon Flowers', img: '/art_forms/satin_flowers.png',items: ['Bouquets', 'Single Flowers', 'Combos'] },
    { name: 'Pipe Cleaner Art',     img: '/art_forms/pipe_cleaners.png',items: ['Flowers', 'Decor', 'Keychains'] },
    { name: 'Customized Bouquets',  img: '/art_forms/bouquets.png',     items: ['Mixed Media', 'With Gifts', 'Chocolates'] },
    { name: 'Gift Hampers',         img: '/art_forms/hampers.png',      items: ['Birthday', 'Anniversary', 'Surprise Boxes'] },
    { name: 'Clay Art',             img: '/art_forms/clay_art.png',     items: ['Trays', 'Frames', 'Charms'] },
    { name: 'Canvas Art',           img: '/art_forms/canvas_art.png',   items: ['Wall Art', 'Portraits', 'Mini Frames'] },
];

const galleryImports = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,webp}', { eager: true });
const galleryImages = Object.values(galleryImports).map((img: any) => img.default);

const Creations = () => {
    return (
        <div className="pt-32 pb-32 min-h-screen bg-transparent">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-24 max-w-3xl mx-auto"
                >
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">The Archive</h2>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-neutral-950 tracking-tighter mb-8">Our Creations</h1>
                    <p className="text-xl text-neutral-500 font-light leading-relaxed">
                        A curated exhibition of our artistic capabilities. Everything you see here can be tailored precisely to your vision.
                    </p>
                </motion.div>

                {/* Disciplines — Image Grid */}
                <div className="mb-32">
                    <div className="flex justify-between items-end border-b border-neutral-950 pb-4 mb-10">
                        <h2 className="text-3xl font-serif font-bold text-neutral-950">Disciplines</h2>
                        <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">Index 01</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07, duration: 0.6, ease: 'easeOut' }}
                                viewport={{ once: true }}
                                className="group relative overflow-hidden aspect-[3/4] cursor-pointer bg-neutral-200"
                            >
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                                />
                                {/* Always-visible dark gradient at bottom */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                    <h3 className="font-serif font-bold text-base md:text-lg text-white mb-2 group-hover:-translate-y-1 transition-transform duration-500">
                                        {cat.name}
                                    </h3>
                                    {/* Sub-items reveal on hover */}
                                    <div className="flex flex-wrap gap-1.5 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 ease-in-out">
                                        {cat.items.map(item => (
                                            <span
                                                key={item}
                                                className="text-[10px] text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Pull Quote */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 max-w-4xl mx-auto text-center border-y border-neutral-200 py-20"
                >
                    <p className="font-serif italic text-3xl md:text-4xl text-neutral-800 leading-tight">
                        "Every piece in this archive was built from a feeling — not a template."
                    </p>
                    <span className="block mt-8 text-xs font-bold tracking-widest uppercase text-neutral-400">
                        Rifa Arts &amp; Crafts
                    </span>
                </motion.div>

                {/* Exhibition Gallery — Full colour by default */}
                <div className="mb-32">
                    <div className="flex justify-between items-end border-b border-neutral-950 pb-4 mb-10">
                        <h2 className="text-3xl font-serif font-bold text-neutral-950">Exhibition</h2>
                        <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">Index 02</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                        {(galleryImages.length > 0 ? galleryImages : [1, 2, 3, 4, 5, 6]).map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: idx * 0.06, duration: 0.8 }}
                                viewport={{ once: true }}
                                className={`relative group overflow-hidden bg-neutral-100 w-full aspect-[4/5] ${
                                    idx % 5 === 0 ? 'md:col-span-2 md:aspect-[8/5]' : ''
                                }`}
                            >
                                {galleryImages.length > 0 ? (
                                    <img
                                        src={item as string}
                                        alt={`Gallery piece ${idx + 1}`}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-100">
                                        <span className="font-serif italic text-lg tracking-widest">Plate {item}</span>
                                    </div>
                                )}

                                {/* Hover label */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="bg-white/90 backdrop-blur-sm text-neutral-950 text-xs font-bold tracking-widest uppercase px-6 py-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                                        Examine
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-neutral-950 text-white p-16 md:p-24 text-center mx-auto max-w-5xl"
                >
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-6">Bespoke Commissions</h2>
                    <h3 className="text-4xl md:text-5xl font-serif font-bold mb-8">Materialize Your Vision</h3>
                    <p className="text-lg text-neutral-400 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                        If your desired piece is not within our archives, our artisans are prepared to build it from the ground up.
                    </p>
                    <Link
                        to="/custom-order"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-white text-neutral-950 text-xs font-bold tracking-widest uppercase hover:bg-brand-pink hover:text-white transition-colors duration-500 group"
                    >
                        Commission a Piece
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

            </div>
        </div>
    );
};

export default Creations;
