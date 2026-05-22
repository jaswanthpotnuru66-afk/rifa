import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MessageSquare, Mail, MapPin, BadgeCheck, ShieldCheck } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 size={32} className="text-brand-pink animate-spin" />
            <p className="text-sm font-medium text-neutral-500">Loading shop details...</p>
        </div>
    );

    if (!artisan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Shop Not Found</h2>
                <p className="text-neutral-500 mb-6">The artisan shop you are looking for does not exist or has been removed.</p>
                <Link to="/" className="px-6 py-2 bg-brand-pink text-white rounded-md font-medium hover:bg-brand-pink/90 transition-colors">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">

            {/* --- TOP BANNER --- */}
            <div className="w-full h-48 md:h-64 bg-neutral-200 relative">
                <img loading="lazy"
                    src={artisan.process_img || "/assets/studio_bg.png"}
                    alt={`${artisan.name} Banner`}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- SHOP PROFILE HEADER --- */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 md:p-8 -mt-16 relative z-10 mb-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start">

                    {/* Artisan Image */}
                    <div className="shrink-0 relative -mt-12 md:-mt-16 bg-white p-2 rounded-full shadow-md">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100">
                            <img loading="lazy"
                                src={artisan.img || "https://ui-avatars.com/api/?name=" + artisan.name}
                                alt={artisan.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-3 right-3 bg-blue-500 text-white rounded-full p-1 border-2 border-white" title="Verified Artisan">
                            <BadgeCheck size={16} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{artisan.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 mb-4">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} className="text-neutral-400" />
                                {artisan.location || 'India'}
                            </span>
                            <span className="text-neutral-300">|</span>
                            <span className="flex items-center gap-1 font-medium">
                                <span className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </span>
                                (124 Reviews)
                            </span>
                            <span className="text-neutral-300">|</span>
                            <span className="flex items-center gap-1">
                                <ShieldCheck size={16} className="text-green-600" />
                                Rifa Protected
                            </span>
                        </div>
                        <p className="text-neutral-600 text-sm leading-relaxed max-w-3xl">
                            {artisan.story || "A dedication to preserving ancient techniques. Every piece is a dialogue between legacy and modernity, crafted specifically for the discerning collector."}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 md:min-w-[200px]">
                        {artisan.whatsapp_number && (
                            <a href={`https://wa.me/${String(artisan.whatsapp_number).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                                <MessageSquare size={16} /> Contact Shop
                            </a>
                        )}
                        {artisan.email && (
                            <a href={`mailto:${artisan.email}`}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                                <Mail size={16} /> Email Artisan
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* --- LEFT SIDEBAR (Shop Info & Categories) --- */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Shop Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">About the Maker</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Specialty</p>
                                    <p className="text-sm font-medium text-neutral-900">{artisan.specialty || 'Handcrafted Goods'}</p>
                                </div>
                                {artisan.heritage && (
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-1">Heritage</p>
                                        <p className="text-sm font-medium text-neutral-900">{artisan.heritage}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Total Products</p>
                                    <p className="text-sm font-medium text-neutral-900">{displayProducts.length} items</p>
                                </div>
                            </div>
                        </div>

                        {/* Request Custom Order Card */}
                        <div className="bg-brand-pink/5 rounded-xl border border-brand-pink/20 p-6 text-center">
                            <h3 className="text-sm font-bold text-neutral-900 mb-2">Want something unique?</h3>
                            <p className="text-xs text-neutral-600 mb-4">This artisan accepts bespoke requests and custom commissions.</p>
                            <Link to="/custom-order" className="block w-full py-2 bg-white border border-brand-pink text-brand-pink font-medium rounded text-sm hover:bg-brand-pink hover:text-white transition-colors">
                                Request Custom Order
                            </Link>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT (Products Grid) --- */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-900">All Items</h2>
                            <div className="text-sm text-neutral-500">{displayProducts.length} items found</div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {displayProducts.map((product: any) => {
                                if (!product) return null;
                                return (
                                    <Link key={product.id} to={product.isCustom ? `/custom-product/${product.id}` : `/product/${product.id}`} className="group bg-white rounded-lg overflow-hidden border border-neutral-100 hover:shadow-lg transition-all duration-200 flex flex-col">
                                        <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                                            <img loading="lazy"
                                                src={product.images?.[0] || '/assets/placeholder.png'}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Badges */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                {product.isCustom && (
                                                    <span className="bg-white/95 text-neutral-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                        Bespoke
                                                    </span>
                                                )}
                                                {product.isReady && (
                                                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                        Ready to Ship
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1 group-hover:text-brand-pink transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-neutral-500 mb-2">{product.category}</p>
                                            <div className="mt-auto">
                                                <p className="text-lg font-bold text-neutral-900">₹{Number(product.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ArtisanDetail;
