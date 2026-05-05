import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Creations', path: '/creations' },
        { name: 'Combos', path: '/combos' },
        { name: 'Why Us', path: '/why-us' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#F9F9F6] border-b border-neutral-200 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-3xl font-serif font-bold text-neutral-950 tracking-tighter hover:opacity-60 transition-opacity duration-300">
                    Rifa Arts <span className="font-light italic">&</span> Crafts
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-xs font-bold tracking-widest uppercase transition-colors hover:text-neutral-950 ${location.pathname === link.path ? 'text-neutral-950 border-b border-neutral-950 pb-1' : 'text-neutral-500'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link to="/custom-order" className="flex items-center gap-2 px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-700 transition-all duration-300">
                        <ShoppingBag size={14} />
                        Customize
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-neutral-950 hover:opacity-60 transition-opacity"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-8 space-y-6 flex flex-col items-center bg-[#F9F9F6]">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-lg font-serif font-bold tracking-widest uppercase text-neutral-950"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link to="/custom-order" className="btn-primary w-full text-center mt-4">
                                Customize Order
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

