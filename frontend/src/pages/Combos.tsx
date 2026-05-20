import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Check, Sparkles, Ticket, Copy, CheckSquare } from 'lucide-react';
import { api } from '../lib/api';

const galleryImports = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,webp}', { eager: true });
const galleryImages = Object.entries(galleryImports)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, img]) => (img as { default: string }).default);

// Fallback images from public art_forms if gallery is insufficient
const fallbackImages = [
    '/art_forms/bouquets.png',
    '/art_forms/crochet.png',
    '/art_forms/satin_flowers.png',
];
const getImg = (idx: number): string =>
    (galleryImages[idx] as string | undefined) ?? fallbackImages[idx % fallbackImages.length];

const combos = [
    {
        tier:     '01',
        title:    'Student Friendly',
        subtitle: 'The Thoughtful Starter',
        price:    '₹500',
        tag:      'Great for Students',
        imgIdx:   2,
        dark:     false,
        includes: [
            'Handcrafted Keychain',
            'Mini Resin Frame',
            'Complimentary gift wrap',
            'Personalised note card',
        ],
    },
    {
        tier:     '02',
        title:    'Standard Love',
        subtitle: 'The Signature Set',
        price:    '₹1,000',
        tag:      'Most Popular',
        imgIdx:   10,
        dark:     true,
        includes: [
            'Handcrafted Bouquet',
            'Resin Photo Frame',
            'Premium Chocolate',
            'Complimentary gift wrap',
            'Personalised note card',
        ],
    },
    {
        tier:     '03',
        title:    'Premium Hamper',
        subtitle: 'The Statement Gift',
        price:    '₹1,500+',
        tag:      'Best Value',
        imgIdx:   18,
        dark:     false,
        includes: [
            'Large Handcrafted Bouquet',
            'Custom Resin Clock',
            'Curated Gift Box',
            'Surprise Add-ons',
            'Complimentary gift wrap',
            'Personalised note card',
        ],
    },
];

const Combos = () => {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const data = await api.getPromotions();
                setPromotions(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-transparent">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12 max-w-3xl mx-auto"
                >
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">Curated Sets</h2>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter mb-6">Offers &amp; Combos</h1>
                    <p className="text-xl text-neutral-500 font-light leading-relaxed">
                        Thoughtfully curated combinations for every occasion, every budget — without compromising on quality.
                    </p>
                    <motion.div
                        className="border-l-2 border-brand-pink pl-4 mt-8 inline-flex items-center gap-2 text-brand-pink text-xs uppercase tracking-widest font-bold"
                    >
                        <Gift size={14} /> A complimentary handmade gift with every order
                    </motion.div>
                </motion.div>

                {/* Active Artisan Promotions Section */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <Ticket className="text-brand-pink" size={20} />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-950">Active Artisan Offers &amp; Promo Codes</h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="border border-neutral-100 p-6 rounded-sm space-y-4 bg-white animate-pulse">
                                    <div className="h-4 bg-neutral-100 rounded w-1/3" />
                                    <div className="h-6 bg-neutral-100 rounded w-2/3" />
                                    <div className="h-4 bg-neutral-100 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : promotions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {promotions.map((promo) => (
                                <div key={promo.id} className="border border-neutral-200/80 p-6 rounded-sm bg-white relative overflow-hidden group shadow-sm hover:shadow-md hover:border-brand-pink/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-pink" />
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2.5 py-1 bg-brand-pink/5 text-brand-pink text-[8px] font-black uppercase tracking-widest rounded-sm border border-brand-pink/10">
                                            {promo.type === 'percentage' ? `${promo.value}% Off` : promo.type === 'fixed' ? `₹${promo.value} Off` : 'Free Shipping'}
                                        </span>
                                        <button 
                                            onClick={() => copyToClipboard(promo.code)}
                                            className="text-neutral-400 hover:text-neutral-900 transition-colors"
                                            title="Copy Code"
                                        >
                                            {copiedCode === promo.code ? <CheckSquare size={14} className="text-green-600" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    
                                    <h3 className="text-lg font-serif font-bold text-neutral-900 mb-1">{promo.title}</h3>
                                    <p className="text-xs text-neutral-500 font-light mb-5">{promo.description || 'Valid on artisan store purchases.'}</p>
                                    
                                    <div className="flex justify-between items-center pt-4 border-t border-neutral-50 bg-neutral-50/50 -mx-6 -mb-6 px-6 py-3.5">
                                        <div className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-sm select-all">
                                            {promo.code}
                                        </div>
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                                            Ends: {new Date(promo.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-neutral-50 border border-neutral-100 p-8 text-center text-sm text-neutral-500 italic rounded-sm">
                            No shop promotions are running at the moment. Check back soon for exclusive deals!
                        </div>
                    )}
                </div>

                {/* Combo Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {combos.map((combo, idx) => {
                        const img = getImg(combo.imgIdx);
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className={`group flex flex-col overflow-hidden border ${combo.dark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'}`}
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                    <img
                                        src={img}
                                        alt={combo.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className={`absolute inset-0 ${combo.dark ? 'bg-black/30' : 'bg-black/10'}`} />

                                    {/* Tag badge */}
                                    <span className={`absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 ${combo.dark ? 'bg-white text-neutral-950' : 'bg-neutral-950 text-white'}`}>
                                        {combo.tag}
                                    </span>

                                    {/* Tier number watermark */}
                                    <span className={`absolute bottom-4 right-5 font-serif text-6xl font-bold leading-none ${combo.dark ? 'text-white/10' : 'text-white/30'}`}>
                                        {combo.tier}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className={`p-8 flex flex-col flex-grow ${combo.dark ? 'text-white' : 'text-neutral-950'}`}>
                                    <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${combo.dark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                        {combo.subtitle}
                                    </p>
                                    <h3 className="text-2xl font-serif font-bold mb-1">{combo.title}</h3>
                                    <div className={`text-4xl font-serif font-light mb-6 ${combo.dark ? 'text-white' : 'text-neutral-950'}`}>
                                        {combo.price}
                                    </div>

                                    {/* What's Included */}
                                    <ul className={`space-y-2.5 mb-8 pt-6 border-t flex-grow ${combo.dark ? 'border-neutral-800' : 'border-neutral-100'}`}>
                                        {combo.includes.map(item => (
                                            <li key={item} className="flex items-center gap-3 text-sm font-light">
                                                <Check size={13} className={`flex-shrink-0 ${combo.dark ? 'text-brand-pink' : 'text-brand-pink'}`} />
                                                <span className={combo.dark ? 'text-neutral-300' : 'text-neutral-600'}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link
                                        to="/custom-order"
                                        className={`mt-auto w-full flex items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-500 group/btn ${
                                            combo.dark
                                                ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                                                : 'bg-neutral-950 text-white hover:bg-neutral-700'
                                        }`}
                                    >
                                        Select This Combo
                                        <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mystery Box — Full Dark Editorial Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden bg-neutral-950 text-white"
                >
                    {/* Background Image */}
                    {getImg(26) && (
                        <div className="absolute inset-0">
                            <img
                                src={getImg(26)}
                                alt=""
                                className="w-full h-full object-cover opacity-15"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/95 to-neutral-950/50" />
                        </div>
                    )}

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-12 md:p-20 lg:p-24">
                        {/* Left — Text */}
                        <div>
                            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-white/20 bg-white/5 text-xs font-bold tracking-widest uppercase">
                                <Sparkles size={12} /> Fully Personalised
                            </div>
                            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">The Ultimate Gift</h2>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-[1.1]">
                                Surprise<br/>Mystery Box
                            </h3>
                            <p className="text-neutral-400 text-lg font-light leading-relaxed mb-10 max-w-md">
                                Share your budget and a few details about your recipient. Our artisans hand-pick and craft an exclusive mystery box — always exceeding the value of your investment.
                            </p>

                            <ul className="space-y-3 mb-12">
                                {[
                                    'Fully curated by our artisans',
                                    'Value always exceeds your budget',
                                    'Surprise unboxing experience',
                                    'Complimentary handmade gift included',
                                    'Personalised message card',
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-neutral-300 font-light">
                                        <Check size={13} className="text-brand-pink flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/custom-order"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-950 text-xs font-bold tracking-widest uppercase hover:bg-brand-pink hover:text-white transition-all duration-500 group"
                            >
                                Commission a Mystery Box
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Right — Accent Image */}
                        {getImg(29) && (
                            <div className="hidden md:block relative">
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img
                                        src={getImg(29)}
                                        alt="Mystery box preview"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                    />
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-full h-full border border-white/10 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Combos;
