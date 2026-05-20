import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, Search, LogOut, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [promotions, setPromotions] = useState<any[]>([]);
    const location = useLocation();

    const [user, setUser] = useState<any>(api.getUser());
    const [pincode, setPincode] = useState<string>(localStorage.getItem('rifa_user_pincode') || '');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [tempPin, setTempPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    // Fallback to database addresses if geolocate fails or is denied
    const fallbackToDbAddress = async () => {
        try {
            const addresses = await api.getAddresses();
            if (addresses && addresses.length > 0) {
                const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
                const pin = defaultAddr.pincode || defaultAddr.postcode;
                if (pin) {
                    localStorage.setItem('rifa_user_pincode', pin);
                    setPincode(pin);
                    return;
                }
            }
        } catch (err) {
            console.error('Failed to get address fallback:', err);
        }
        setPincode('Set Pin');
    };

    const triggerAutoLocate = () => {
        if (navigator.geolocation) {
            setIsLocating(true);
            setPinError('');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        const pin = data.address?.postcode;
                        if (pin) {
                            localStorage.setItem('rifa_user_pincode', pin);
                            setPincode(pin);
                            setTempPin(pin);
                            setIsPinModalOpen(false);
                        } else {
                            await fallbackToDbAddress();
                        }
                    } catch (err) {
                        console.error('Reverse geocode error:', err);
                        await fallbackToDbAddress();
                    } finally {
                        setIsLocating(false);
                    }
                },
                async () => {
                    console.log('Geolocation denied/failed. Falling back to DB addresses.');
                    await fallbackToDbAddress();
                    setIsLocating(false);
                }
            );
        } else {
            fallbackToDbAddress();
        }
    };

    // Auto locate user or fetch DB address on login/mount/navigation
    useEffect(() => {
        const initializePincode = async () => {
            if (!user) {
                setPincode('');
                localStorage.removeItem('rifa_user_pincode');
                return;
            }

            const cachedPin = localStorage.getItem('rifa_user_pincode');
            if (cachedPin) {
                setPincode(cachedPin);
            }

            // Sync with default DB address if available (DB address takes priority on load/nav)
            try {
                const addresses = await api.getAddresses();
                if (addresses && addresses.length > 0) {
                    const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
                    const dbPin = defaultAddr.pincode || defaultAddr.postcode;
                    if (dbPin && dbPin !== cachedPin) {
                        localStorage.setItem('rifa_user_pincode', dbPin);
                        setPincode(dbPin);
                        return;
                    }
                }
            } catch (err) {
                console.error('Error fetching addresses during navbar init:', err);
            }

            if (!cachedPin) {
                triggerAutoLocate();
            }
        };

        initializePincode();
    }, [user, location.pathname]);

    // Handle manual pin save
    const handleSavePin = () => {
        if (/^\d{6}$/.test(tempPin.trim())) {
            localStorage.setItem('rifa_user_pincode', tempPin.trim());
            setPincode(tempPin.trim());
            setIsPinModalOpen(false);
        } else {
            setPinError('Please enter a valid 6-digit pincode.');
        }
    };

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const data = await api.getPromotions();
                setPromotions(data || []);
            } catch (err) {
                console.error('Navbar promotions fetch error:', err);
            }
        };
        fetchPromotions();
    }, []);

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
                if (!currentUser) {
                    setPincode('');
                    localStorage.removeItem('rifa_user_pincode');
                }
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
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/marketplace' },
        { name: 'Creations', path: '/creations' },
        { name: 'Combos', path: '/combos' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 flex flex-col ${
                scrolled 
                    ? 'bg-[#FAF7F2]/95 backdrop-blur-md border-b border-neutral-200 shadow-sm' 
                    : 'bg-transparent'
            }`}
        >
            {/* Dynamic Active Promotions Marquee */}
            {promotions.length > 0 && (
                <div 
                    className={`bg-neutral-950 text-white text-[9px] uppercase tracking-[0.25em] font-black overflow-hidden whitespace-nowrap border-b border-white/5 transition-all duration-500 relative z-50 ${
                        scrolled ? 'h-0 py-0 opacity-0 pointer-events-none' : 'py-2.5 opacity-100'
                    }`}
                >
                    <div className="animate-marquee inline-block whitespace-nowrap">
                        {promotions.map((p, i) => (
                            <span key={i} className="mx-12 inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink"></span>
                                ✨ {p.title}: USE CODE <span className="text-brand-pink font-black border border-brand-pink/20 px-2 py-0.5 rounded bg-brand-pink/5">{p.code}</span> FOR {p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`} OFF! ✨
                            </span>
                        ))}
                        {promotions.map((p, i) => (
                            <span key={`dup-${i}`} className="mx-12 inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink"></span>
                                ✨ {p.title}: USE CODE <span className="text-brand-pink font-black border border-brand-pink/20 px-2 py-0.5 rounded bg-brand-pink/5">{p.code}</span> FOR {p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`} OFF! ✨
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className={`transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                    {/* Logo & Delivery Location */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-3xl font-serif font-bold text-neutral-950 tracking-tighter hover:opacity-60 transition-opacity duration-300">
                            Rifa Arts <span className="font-light italic">&</span> Crafts
                        </Link>
                        {user && (
                            <div 
                                onClick={() => {
                                    setTempPin(pincode && pincode !== 'Set Pin' ? pincode : '');
                                    setPinError('');
                                    setIsPinModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200/60 rounded-full bg-white/40 hover:bg-white hover:border-neutral-400 transition-all cursor-pointer select-none group"
                                title="Click to change delivery location"
                            >
                                <MapPin size={12} className="text-brand-pink group-hover:scale-110 transition-transform animate-pulse" />
                                <div className="flex flex-col text-[9px] leading-tight">
                                    <span className="font-medium text-neutral-400 uppercase tracking-wider hidden sm:inline">Deliver to</span>
                                    <span className="font-black text-neutral-800 tracking-wider">{pincode || 'Set Pin'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {/* Search Trigger */}
                    <Link 
                        to="/search"
                        className="p-2 text-neutral-500 hover:text-neutral-950 transition-colors"
                        title="Search Archives"
                    >
                        <Search size={18} strokeWidth={1.5} />
                    </Link>

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
                            {user.role === 'artisan' && (
                                <Link 
                                    to="/craftmaker/dashboard" 
                                    className="text-xs font-bold tracking-widest uppercase text-brand-pink hover:text-neutral-950 transition-colors"
                                >
                                    Maker Dashboard
                                </Link>
                            )}
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
                                <Link to="/search" className="block text-center text-xs font-bold tracking-widest uppercase text-neutral-500 hover:text-brand-pink transition-colors py-3 flex items-center justify-center gap-2 border border-neutral-100 rounded-sm bg-white mb-2">
                                    <Search size={14} className="text-neutral-400" /> Search Archives
                                </Link>
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
                                {user?.role === 'artisan' ? (
                                    <Link to="/craftmaker/dashboard" className="block text-center text-xs font-bold tracking-widest uppercase text-brand-pink hover:text-neutral-950 transition-colors">
                                        Maker Dashboard
                                    </Link>
                                ) : (
                                    <Link to="/collaborate" className="block text-center text-xs font-bold tracking-widest uppercase text-neutral-500 hover:text-neutral-950 transition-colors">
                                        Sell with Us
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Pincode Modal */}
            <AnimatePresence>
                {isPinModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#FAF7F2] border border-neutral-200 p-8 max-w-sm w-full rounded-sm shadow-2xl relative text-left"
                        >
                            <button 
                                onClick={() => setIsPinModalOpen(false)}
                                className="absolute right-4 top-4 p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                            >
                                <X size={18} />
                            </button>
                            
                            <h3 className="text-lg font-serif font-black text-neutral-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-brand-pink" /> Set Delivery Location
                            </h3>
                            <p className="text-xs text-neutral-500 mb-6 font-light leading-relaxed">
                                Enter your 6-digit delivery pincode to see accurate shipping times and craft availability.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <input 
                                        type="text" 
                                        maxLength={6}
                                        value={tempPin}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setTempPin(val);
                                            setPinError('');
                                        }}
                                        placeholder="Enter 6-digit pincode"
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 text-sm font-bold tracking-widest text-neutral-800 placeholder:text-neutral-300 focus:border-brand-pink focus:outline-none transition-colors rounded-sm"
                                    />
                                    {pinError && (
                                        <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1.5">{pinError}</p>
                                    )}
                                </div>

                                <button 
                                    onClick={handleSavePin}
                                    className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl rounded-sm"
                                >
                                    Confirm Pincode
                                </button>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-neutral-200"></div>
                                    <span className="flex-shrink mx-4 text-[9px] uppercase font-bold tracking-widest text-neutral-400">or</span>
                                    <div className="flex-grow border-t border-neutral-200"></div>
                                </div>

                                <button 
                                    onClick={triggerAutoLocate}
                                    disabled={isLocating}
                                    className="w-full py-3.5 bg-white border border-neutral-200 hover:border-neutral-950 text-neutral-800 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2"
                                >
                                    {isLocating ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></span>
                                            Detecting Location...
                                        </>
                                    ) : (
                                        <>
                                            <MapPin size={12} className="text-brand-pink" />
                                            Detect Automatically
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
