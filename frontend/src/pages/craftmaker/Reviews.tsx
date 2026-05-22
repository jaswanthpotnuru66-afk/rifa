import { useState, useEffect } from 'react';
import { Star, Reply, Send, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';

const FILTER_TABS = ['All', '5★', '4★', '3★', '2★', '1★', 'Unanswered', 'Replied'];

const Reviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        const data = await api.getArtisanReviews();
        setReviews(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        const res = await api.replyToReview(reviewId, replyText);
        setSubmittingReply(false);
        if (res) {
            setReplyingTo(null);
            setReplyText('');
            // update local state
            setReviews(reviews.map(r => r.id === reviewId ? { ...r, maker_reply: replyText } : r));
        }
    };

    const filtered = reviews.filter(r => {
        if (activeTab === 'All') return true;
        if (activeTab.includes('★')) return r.rating === parseInt(activeTab);
        if (activeTab === 'Unanswered') return !r.maker_reply;
        if (activeTab === 'Replied') return !!r.maker_reply;
        return true;
    });

    const total = reviews.length;
    const ratingMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { ratingMap[r.rating] = (ratingMap[r.rating] || 0) + 1; });

    // Calculate Average Rating
    const averageRating = total > 0 
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / total).toFixed(1)
        : '0.0';

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Buyer Feedback</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Customer Reviews</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Monitor feedback and build buyer trust.</p>
                </div>

                {/* Rating Summary Hero */}
                <div className="relative bg-[#0a0a0a] rounded-sm p-10 overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-2/5 bg-gradient-to-l from-brand-pink/20 to-transparent pointer-events-none" />
                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                        {/* Left: Big rating */}
                        <div className="flex items-center gap-8">
                            <div>
                                <p className="text-8xl font-serif font-bold text-white leading-none tracking-tighter">{averageRating}</p>
                                <div className="flex gap-1 mt-3 text-brand-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill="currentColor" className={i < Math.round(Number(averageRating)) ? '' : 'opacity-20'} />
                                    ))}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-3">{total} Total Reviews</p>
                            </div>
                        </div>
                        {/* Right: Distribution bars */}
                        <div className="space-y-3">
                            {[5,4,3,2,1].map(star => {
                                const count = ratingMap[star] || 0;
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-white/40 w-4">{star}★</span>
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[9px] font-bold text-white/30 w-8 text-right">{Math.round(pct)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-3 border-b border-neutral-100 pb-px overflow-x-auto no-scrollbar">
                    {FILTER_TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 px-1 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'}`}
                        >
                            {tab}
                            {activeTab === tab && <motion.div layoutId="reviewTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                        </button>
                    ))}
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-neutral-400 bg-white border border-neutral-100">
                            <Loader className="animate-spin mb-4" size={24} />
                            <p className="text-xs uppercase tracking-widest font-black">Loading customer reviews...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filtered.map(review => (
                                <motion.div key={review.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm hover:border-brand-pink/20 hover:shadow-md transition-all"
                                >
                                    {/* Top row */}
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center font-black text-neutral-300 text-sm capitalize">
                                                {review.user_name?.charAt(0) || 'B'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-950 capitalize">{review.user_name || 'Buyer'}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{review.product_name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                                    <span className="text-[10px] text-neutral-300">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-brand-gold' : 'text-neutral-100'} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Review text */}
                                    <p className="text-sm text-neutral-600 font-light leading-relaxed">"{review.comment}"</p>

                                    {/* Photos */}
                                    {review.product_image && (
                                        <div className="flex gap-2 mt-5">
                                            <div className="w-16 h-16 rounded-sm border border-neutral-100 overflow-hidden">
                                                <img loading="lazy" src={review.product_image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Maker reply / Reply form */}
                                    <div className="mt-6">
                                        {review.maker_reply ? (
                                            <div className="bg-teal-50 border border-teal-100 rounded-sm p-5 relative">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-teal-600 mb-2">Your Reply</p>
                                                <p className="text-sm text-teal-800 font-medium leading-relaxed">"{review.maker_reply}"</p>
                                                <button onClick={() => { setReplyText(review.maker_reply); setReplyingTo(review.id); }} className="mt-3 text-[9px] font-black uppercase tracking-widest text-teal-500 hover:text-teal-800 transition-colors">Edit Reply</button>
                                            </div>
                                        ) : (
                                            <AnimatePresence mode="wait">
                                                {replyingTo === review.id ? (
                                                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-neutral-100 pt-5">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-3">Write a Reply</p>
                                                        <textarea
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            placeholder="Thank the buyer or address their feedback professionally..."
                                                            className="w-full bg-neutral-50 border border-neutral-100 p-4 text-sm font-light outline-none focus:border-brand-pink transition-all min-h-[110px] resize-none"
                                                        />
                                                        <div className="flex gap-3 mt-3">
                                                            <button 
                                                                onClick={() => handleReply(review.id)}
                                                                disabled={submittingReply || !replyText.trim()}
                                                                className="flex-1 py-3 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-brand-pink-dark transition-all disabled:opacity-50"
                                                            >
                                                                {submittingReply ? <Loader className="animate-spin" size={12} /> : <Send size={12} />}
                                                                Post Reply
                                                            </button>
                                                            <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-6 py-3 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:text-neutral-950 transition-all">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.button key="btn" onClick={() => setReplyingTo(review.id)}
                                                        className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-950 hover:border-neutral-950 transition-all"
                                                    >
                                                        <Reply size={13} /> Reply to Review
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="py-24 px-6 flex flex-col items-center text-center bg-white border border-dashed border-neutral-200 rounded-sm">
                            <img loading="lazy" src="https://illustrations.popsy.co/amber/shining-stars.svg" alt="Empty Reviews" className="w-48 h-48 opacity-80 mb-4" />
                            <h3 className="text-xl font-serif font-bold text-neutral-950 mb-2">No reviews found</h3>
                            <p className="text-neutral-500 text-sm max-w-sm mb-6">Looks like you don't have any reviews in this filter. Don't worry, 5-star ratings are coming your way soon!</p>
                            <button onClick={() => setActiveTab('All')} className="bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-sm shadow-md hover:bg-brand-pink-dark transition-all">
                                View All Reviews
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Reviews;
