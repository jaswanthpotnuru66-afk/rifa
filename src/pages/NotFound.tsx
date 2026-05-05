import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#F9F9F6] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">

            {/* Large background number */}
            <div className="absolute select-none pointer-events-none">
                <span className="text-[20rem] md:text-[28rem] font-serif font-bold text-neutral-100 leading-none">
                    404
                </span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-xl"
            >
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-brand-pink mb-8">
                    Page Not Found
                </span>

                <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter mb-6 leading-tight">
                    This page doesn't<br />
                    <span className="italic font-light text-neutral-400">exist yet.</span>
                </h1>

                <p className="text-lg text-neutral-500 font-light leading-relaxed mb-12 max-w-md mx-auto">
                    The piece you're looking for hasn't been crafted yet — or may have moved. Let us guide you back.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-950 text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-700 transition-all duration-300 group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <Link
                        to="/custom-order"
                        className="inline-flex items-center gap-3 px-8 py-4 border border-neutral-300 text-neutral-950 text-xs font-bold tracking-widest uppercase hover:border-neutral-950 transition-all duration-300 group"
                    >
                        Commission a Piece
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>

            {/* Bottom decorative line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-950 origin-left"
            />
        </div>
    );
};

export default NotFound;
