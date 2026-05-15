import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Star, Heart, ArrowRight, CheckCircle2, MessageSquare, UserPlus, Zap, Shield, Sparkles } from 'lucide-react';
import { 
    Loader2
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const ArtisanDetail = () => {
    const { id } = useParams();
    
    const [artisan, setArtisan] = useState<any>(null);
    const [displayProducts, setDisplayProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtisan = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/artisans/${id}`);
                if (!res.ok) throw new Error('Artisan not found');
                const data = await res.json();
                setArtisan(data);
                setDisplayProducts(data.products || []);
            } catch (err) {
                console.error('Fetch artisan error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArtisan();
            window.scrollTo(0, 0);
        }
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] gap-4">
            <Loader2 size={40} className="text-brand-pink animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Visiting Studio...</p>
        </div>
    );

    if (!artisan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FAF7F2]">
                <h2 className="text-2xl font-serif mb-4">Artisan Not Found</h2>
                <Link to="/" className="text-brand-pink underline">Back to Gallery</Link>
            </div>
        );
    }

    const fadeInUp: Variants = {
        initial: { opacity: 0, y: 20 },
        animate: (custom: number = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: custom
            }
        })
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] selection:bg-brand-pink/20">
            {/* Hero Background */}
            <div className="relative h-[250px] w-full overflow-hidden">
                <img
                    src="/assets/studio_bg.png"
                    alt="Studio Background"
                    className="w-full h-full object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Profile Card Section */}
            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-neutral-200/40 text-center border border-neutral-100"
                >
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md mx-auto">
                            <img
                                src={artisan.img}
                                alt={artisan.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-serif font-bold text-neutral-950 mb-1">{artisan.name}</h1>
                    
                    <div className="flex items-center justify-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < 4 ? "fill-blue-400 text-blue-400" : "text-neutral-200"} />
                        ))}
                        <span className="text-[10px] text-neutral-400 ml-1">5.0 (124 Reviews)</span>
                    </div>

                    <p className="text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto mb-6 text-sm">
                        {artisan.story?.split('.')[0]}. Curating intentional home decor through traditional {artisan.specialty?.toLowerCase()} and contemporary aesthetics.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <button className="px-8 py-2.5 bg-brand-pink text-white text-[10px] font-bold tracking-widest uppercase rounded hover:bg-brand-pink/90 transition-all shadow-md flex items-center gap-2">
                            <UserPlus size={12} /> Follow
                        </button>
                        <button className="px-8 py-2.5 border border-neutral-200 text-neutral-600 text-[10px] font-bold tracking-widest uppercase rounded hover:bg-neutral-50 transition-all flex items-center gap-2">
                            <MessageSquare size={12} /> Message
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Values of Craftsmanship - The "Something Extra" */}
            <section className="pt-16 pb-8 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: <Zap size={20} />, title: "Precision", text: "Every thread and stroke is placed with absolute mastery." },
                        { icon: <Shield size={20} />, title: "Heritage", text: "Centuries of oral tradition preserved in every piece." },
                        { icon: <Sparkles size={20} />, title: "Passion", text: "Crafted with deep emotional involvement and soul." }
                    ].map((val, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/50 border border-neutral-100 p-6 rounded-xl hover:bg-white transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-400 group-hover:text-white transition-all">
                                {val.icon}
                            </div>
                            <h4 className="text-sm font-serif font-bold text-neutral-950 mb-2">{val.title}</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed font-light">{val.text}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Featured Creations - With Common Products */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex items-end justify-between mb-8">
                    <h2 className="text-3xl font-serif font-bold text-neutral-950">Featured Creations</h2>
                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <span className="italic">Including Signature Essentials</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayProducts.map((product: any, idx: number) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            viewport={{ once: true }}
                            className="group bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <Link to={product.isCustom ? `/custom-product/${product.id}` : `/product/${product.id}`}>
                                <div className="relative aspect-square overflow-hidden bg-neutral-50">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {product.isCustom && (
                                            <span className="bg-brand-pink text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg shadow-brand-pink/20">
                                                <Sparkles size={8} className="fill-current" /> Customized Product
                                            </span>
                                        )}
                                        {product.isReady && (
                                            <span className="bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                                                <Zap size={8} className="fill-current" /> Ready to Deliver
                                            </span>
                                        )}
                                    </div>
                                    <button className="absolute bottom-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-neutral-400 hover:text-brand-pink transition-colors">
                                        <Heart size={16} />
                                    </button>
                                </div>
                                <div className="p-4 space-y-1">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">{product.category}</p>
                                    <h3 className="text-sm font-serif font-bold text-neutral-950 group-hover:text-brand-pink transition-colors line-clamp-1">{product.name}</h3>
                                    <p className="text-brand-pink font-bold text-sm">Rs. {product.price.toLocaleString()}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* The Story Split Section - Updated with Fixed Image */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="bg-white rounded-3xl overflow-hidden grid lg:grid-cols-2 items-center shadow-sm border border-neutral-100">
                    <div className="h-[350px] md:h-[450px] w-full overflow-hidden bg-neutral-100">
                        <img
                            src="/assets/artisan_process.png"
                            alt="The Process"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-8 md:p-12 lg:p-16 space-y-6">
                        <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 block">The Story</span>
                            <h3 className="text-3xl font-serif italic font-bold text-neutral-950 leading-tight">
                                "{artisan.quote}"
                            </h3>
                        </div>
                        <p className="text-neutral-500 font-light leading-relaxed text-sm">
                            {artisan.story}. {artisan.heritage}. Every piece is a dialogue between legacy and modernity, crafted specifically for the discerning collector.
                        </p>
                        <Link to="/custom-order" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-600 transition-all group border-b border-blue-100 pb-0.5">
                            Learn about our process <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ArtisanDetail;
