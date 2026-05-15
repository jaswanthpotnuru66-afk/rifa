import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, Search, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>({ products: [], artisans: [] });
    const [isSearching, setIsSearching] = useState(false);
    const location = useLocation();

    const [user, setUser] = useState<any>(api.getUser());

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Periodically check if user changed in localStorage or just rely on state
        const checkUser = () => {
            const currentUser = api.getUser();
            if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
                setUser(currentUser);
            }
        };
        const interval = setInterval(checkUser, 1000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, [user]);

    // Close mobile menu on route change
    useEffect(() => {
        if (isOpen) setIsOpen(false);
        if (isSearchOpen) setIsSearchOpen(false);
    }, [location]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`http://localhost:3001/api/search?q=${searchQuery}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data);
                    }
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ products: [], artisans: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/marketplace' },
        { name: 'Creations', path: '/creations' },
        { name: 'Combos', path: '/combos' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#FAF7F2] border-b border-neutral-200 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-3xl font-serif font-bold text-neutral-950 tracking-tighter hover:opacity-60 transition-opacity duration-300">
                    Rifa Arts <span className="font-light italic">&</span> Crafts
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {/* Search Trigger */}
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 text-neutral-500 hover:text-neutral-950 transition-colors"
                    >
                        <Search size={18} strokeWidth={1.5} />
                    </button>

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
                    {user && (
                        <>
                            <Link to="/profile" className="p-2 text-neutral-500 hover:text-neutral-950 transition-colors" title="Profile">
                                <User size={18} strokeWidth={1.5} />
                            </Link>
                            <button 
                                onClick={() => {
                                    api.logout();
                                    window.location.href = '/';
                                }}
                                className="text-xs font-bold tracking-widest uppercase text-neutral-500 hover:text-brand-pink transition-colors flex items-center gap-2"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </>
                    )}
                    {!user && (
                        <Link to="/auth" className="text-xs font-bold tracking-widest uppercase text-brand-pink hover:text-neutral-950 transition-colors flex items-center gap-2">
                            <LogIn size={14} />
                            Sign In
                        </Link>
                    )}
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
                        <div className="px-4 py-8 space-y-6 flex flex-col items-center bg-[#FAF7F2]">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.1 }}
                                >
                                    <Link
                                        to={link.path}
                                        className="text-lg font-serif font-bold tracking-widest uppercase text-neutral-950"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: navLinks.length * 0.1 + 0.1 }}
                                className="w-full space-y-4"
                            >
                                {user ? (
                                    <>
                                        <Link to="/profile" className="block text-center text-xs font-bold tracking-widest uppercase text-neutral-950 flex items-center justify-center gap-2">
                                            <User size={14} /> {user.user_metadata?.full_name || 'Profile'}
                                        </Link>
                                        <Link to="/custom-order" className="btn-primary w-full text-center block">
                                            Customize Order
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/auth" className="block text-center text-xs font-bold tracking-widest uppercase text-brand-pink flex items-center justify-center gap-2">
                                        <LogIn size={14} /> Sign In
                                    </Link>
                                )}
                                <Link to="/collaborate" className="block text-center text-xs font-bold tracking-widest uppercase text-neutral-500 hover:text-neutral-950 transition-colors">
                                    Sell with Us
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Global Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-[100] overflow-y-auto"
                    >
                        <div className="max-w-4xl mx-auto px-4 py-12">
                            <div className="flex justify-between items-center mb-16">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink">Global Archive</span>
                                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="relative mb-20">
                                <Search size={24} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-300" />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search Masterpieces or Artisans..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-6 text-4xl md:text-6xl font-serif font-light bg-transparent border-b border-neutral-100 outline-none placeholder:text-neutral-100 focus:border-neutral-900 transition-all"
                                />
                                {isSearching && <div className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-pink text-xs font-bold uppercase tracking-widest">Searching...</div>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-20">
                                {/* Products */}
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-8 border-b border-neutral-50 pb-4">Products</h3>
                                    <div className="space-y-8">
                                        {searchResults.products.length > 0 ? searchResults.products.map((p: any) => (
                                            <Link key={p.id} to={`/product/${p.id}`} className="flex gap-6 group">
                                                <div className="w-16 h-16 bg-neutral-100 shrink-0 overflow-hidden">
                                                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-serif text-lg text-neutral-900 group-hover:text-brand-pink transition-colors">{p.name}</h4>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{p.category}</p>
                                                </div>
                                            </Link>
                                        )) : <p className="text-sm text-neutral-300 font-light italic">No products matched your vision.</p>}
                                    </div>
                                </div>

                                {/* Artisans */}
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-8 border-b border-neutral-50 pb-4">Artisans</h3>
                                    <div className="space-y-8">
                                        {searchResults.artisans.length > 0 ? searchResults.artisans.map((a: any) => (
                                            <Link key={a.id} to={`/artisan/${a.id}`} className="flex items-center gap-6 group">
                                                <div className="w-16 h-16 bg-neutral-100 shrink-0 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                                    <img src={a.img} alt={a.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-serif text-lg text-neutral-900 group-hover:text-brand-pink transition-colors">{a.name}</h4>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{a.specialty}</p>
                                                </div>
                                            </Link>
                                        )) : <p className="text-sm text-neutral-300 font-light italic">No artisans found in this discipline.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
