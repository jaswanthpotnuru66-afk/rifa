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
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-serif font-bold text-gray-800 tracking-tight">
                    Rifa Arts <span className="text-brand-pink">&</span> Crafts
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-medium transition-colors hover:text-brand-pink ${location.pathname === link.path ? 'text-brand-pink' : 'text-gray-600'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link to="/custom-order" className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-md">
                        <ShoppingBag size={16} />
                        Customize
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
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
                        <div className="px-4 py-6 space-y-4 flex flex-col items-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-lg font-medium text-gray-700"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link to="/custom-order" className="btn-primary w-full text-center">
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
