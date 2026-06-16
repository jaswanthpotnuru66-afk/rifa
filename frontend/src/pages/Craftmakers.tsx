import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Animated counter hook ──────────────────────────────────────
function useCounter(target: number, duration = 1600, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start || target === 0) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, start, duration]);
    return count;
}

const Craftmakers = () => {
    const [artisans, setArtisans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredArtisan, setHoveredArtisan] = useState<any>(null);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    const [heroVisible, setHeroVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        const fetchArtisans = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/artisans`);
                if (res.ok) {
                    const data = await res.json();
                    setArtisans(data || []);
                }
            } catch (err) {
                console.error('Error fetching artisans:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtisans();
        window.scrollTo(0, 0);
        const t = setTimeout(() => setHeroVisible(true), 100);

        // Close dropdown on outside click
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearTimeout(t);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Derived stats
    const totalMakers = artisans.length;
    const uniqueCities = new Set(artisans.map(a => a.location).filter(Boolean)).size;
    const uniqueCrafts = new Set(artisans.map(a => a.specialty).filter(Boolean)).size;

    const counterMakers = useCounter(totalMakers, 1500, heroVisible && !loading);
    const counterCities = useCounter(uniqueCities, 1200, heroVisible && !loading);
    const counterCrafts = useCounter(uniqueCrafts, 1000, heroVisible && !loading);

    // All specialties for filter chips
    const allSpecialties = Array.from(
        new Set(artisans.map(a => a.specialty).filter(Boolean))
    ).sort();

    // Filter artisans
    const filteredArtisans = artisans.filter(artisan => {
        const matchesSearch =
            artisan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artisan.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artisan.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = !activeFilter || artisan.specialty === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Alphabetical grouping
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const groupedArtisans = filteredArtisans.reduce((acc, artisan) => {
        const firstChar = (artisan.name || '').trim().charAt(0).toUpperCase();
        const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
        if (!acc[key]) acc[key] = [];
        acc[key].push(artisan);
        return acc;
    }, {} as { [key: string]: any[] });

    Object.keys(groupedArtisans).forEach(key => {
        groupedArtisans[key].sort((a: any, b: any) => a.name.localeCompare(b.name));
    });

    const activeLetters = alphabet.filter(l => groupedArtisans[l]?.length > 0);

    // Running index
    let globalIndex = 0;

    return (
        <div
            className="min-h-screen bg-[#FAF7F2] relative overflow-x-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* ── Subtle warm background texture ─────────────────────── */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.018]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* ── Ambient blobs (warm tones matching brand) ──────────── */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(212,84,122,0.07) 0%, transparent 65%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(232,160,32,0.05) 0%, transparent 65%)',
                        filter: 'blur(80px)',
                    }}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════════
                  HERO  
            ═══════════════════════════════════════════════════════════ */}
            <motion.div
                ref={heroRef}
                className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-28 text-center"
            >
                {/* ── WOW background: scrolling craft names at large scale ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">

                    {/* Row 1 — large, leftward */}
                    <div className="absolute w-full overflow-hidden" style={{ top: '8%' }}>
                        <div className="animate-marquee inline-block whitespace-nowrap" style={{ animationDuration: '28s' }}>
                            {['POTTERY', 'WEAVING', 'JEWELLERY', 'CARVING', 'EMBROIDERY', 'LACQUERWARE', 'BLOCK PRINT', 'POTTERY', 'WEAVING', 'JEWELLERY', 'CARVING', 'EMBROIDERY', 'LACQUERWARE', 'BLOCK PRINT'].map((w, i) => (
                                <span key={i} className="font-serif italic mx-8"
                                    style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', color: 'rgba(107,101,96,0.07)', fontWeight: 400, letterSpacing: '0.04em' }}>
                                    {w} <span style={{ color: 'rgba(212,84,122,0.10)' }}>✦</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Row 2 — medium, rightward */}
                    <div className="absolute w-full overflow-hidden" style={{ top: '30%' }}>
                        <div className="animate-marquee-reverse inline-block whitespace-nowrap" style={{ animationDuration: '36s' }}>
                            {['HAND-BLOCK PRINTING', 'TANT WEAVING', 'JAMDANI', 'KANTHA', 'TEAKWOOD INLAY', 'DHOKRA', 'PATTACHITRA', 'HAND-BLOCK PRINTING', 'TANT WEAVING', 'JAMDANI', 'KANTHA', 'TEAKWOOD INLAY', 'DHOKRA', 'PATTACHITRA'].map((w, i) => (
                                <span key={i} className="font-serif italic mx-6"
                                    style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: 'rgba(107,101,96,0.065)', fontWeight: 400, letterSpacing: '0.06em' }}>
                                    {w} <span style={{ color: 'rgba(212,84,122,0.09)' }}>·</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Row 3 — huge, leftward, behind headline */}
                    <div className="absolute w-full overflow-hidden" style={{ top: '48%' }}>
                        <div className="animate-marquee inline-block whitespace-nowrap" style={{ animationDuration: '22s' }}>
                            {['ARTISAN', 'GUILD', 'HERITAGE', 'HANDMADE', 'INDIA', 'CRAFTMAKER', 'ARTISAN', 'GUILD', 'HERITAGE', 'HANDMADE', 'INDIA', 'CRAFTMAKER'].map((w, i) => (
                                <span key={i} className="font-serif italic mx-10"
                                    style={{ fontSize: 'clamp(4rem, 9vw, 7rem)', color: 'rgba(107,101,96,0.055)', fontWeight: 400, letterSpacing: '0.02em' }}>
                                    {w}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Row 4 — medium-small, rightward */}
                    <div className="absolute w-full overflow-hidden" style={{ top: '72%' }}>
                        <div className="animate-marquee-reverse inline-block whitespace-nowrap" style={{ animationDuration: '42s' }}>
                            {['BLUE POTTERY', 'SILVER FILIGREE', 'MADHUBANI', 'KALAMKARI', 'BANDHANI', 'PASHMINA', 'ZARDOZI', 'BLUE POTTERY', 'SILVER FILIGREE', 'MADHUBANI', 'KALAMKARI', 'BANDHANI', 'PASHMINA', 'ZARDOZI'].map((w, i) => (
                                <span key={i} className="font-serif italic mx-6"
                                    style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)', color: 'rgba(107,101,96,0.06)', fontWeight: 400, letterSpacing: '0.07em' }}>
                                    {w} <span style={{ color: 'rgba(212,84,122,0.08)' }}>◆</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Colour blooms on top for warmth */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 'min(50vw,520px)', height: 'min(50vw,520px)',
                        background: 'radial-gradient(circle, rgba(212,84,122,0.10) 0%, transparent 65%)', filter: 'blur(60px)' }} />
                    <div style={{ position: 'absolute', bottom: '-8%', left: '-8%', width: 'min(45vw,480px)', height: 'min(45vw,480px)',
                        background: 'radial-gradient(circle, rgba(214,140,40,0.08) 0%, transparent 65%)', filter: 'blur(70px)' }} />
                </div>

                {/* Eyebrow */}

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <div className="h-px w-10 bg-[#D4547A]" />
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-[#D4547A]">
                        The Rifa Guild
                    </span>
                    <div className="h-px w-10 bg-[#D4547A]" />
                </motion.div>

                {/* Big headline — single italic serif */}
                <div className="overflow-hidden mb-10">
                    <motion.h1
                        initial={{ y: '110%' }}
                        animate={heroVisible ? { y: '0%' } : {}}
                        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="font-serif italic leading-none"
                        style={{
                            fontSize: 'clamp(3.8rem, 11vw, 9.5rem)',
                            color: '#6B6560',
                            fontWeight: 400,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Craftmakers.
                    </motion.h1>
                </div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.44 }}
                    className="max-w-sm text-neutral-600 text-base font-light leading-relaxed mb-14"
                >
                    India's finest independent creators — every product carries the
                    fingerprint of a dedicated artisan.
                </motion.p>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.58 }}
                    className="flex items-stretch gap-0 border border-neutral-200 divide-x divide-neutral-200 mb-14"
                >
                    {[
                        { value: loading ? '—' : counterMakers, label: 'Artisans' },
                        { value: loading ? '—' : counterCities, label: 'Cities' },
                        { value: loading ? '—' : counterCrafts, label: 'Crafts' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center px-8 py-5">
                            <div className="font-serif font-bold text-neutral-950 text-3xl leading-none">
                                {stat.value}
                            </div>
                            <div className="text-[11px] font-black uppercase tracking-[0.35em] text-neutral-600 mt-2">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={heroVisible ? { opacity: 1 } : {}}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="flex flex-col items-center gap-2 text-neutral-600"
                >
                    <span className="text-[11px] uppercase tracking-[0.4em] font-black">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <ArrowDown size={13} />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════
                  DIRECTORY SECTION  
            ═══════════════════════════════════════════════════════════ */}
            <div className="relative z-10 border-t border-neutral-200/70">

                {/* ── Sticky top bar ─────────────────────────────────── */}
                <div className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 py-3.5 flex flex-col md:flex-row items-start md:items-center gap-3">

                        {/* Search */}
                        <div className="relative group flex-shrink-0">
                            <Search
                                size={11}
                                className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#D4547A] transition-colors"
                            />
                            <input
                                type="text"
                                placeholder="Search name, craft, city…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-transparent pl-5 pr-4 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 border-b border-neutral-300 focus:border-[#D4547A] outline-none transition-colors w-52 font-sans tracking-wide"
                            />
                        </div>

                        <div className="hidden md:block h-4 w-px bg-neutral-300" />

                        {/* ── Craft filter dropdown ─────────────────── */}
                        <div ref={dropdownRef} className="relative flex-shrink-0">
                            <button
                                onClick={() => setDropdownOpen(o => !o)}
                                className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.25em] font-black border px-3 py-1.5 transition-all duration-300 min-w-[180px] justify-between"
                                style={{
                                    borderColor: activeFilter ? '#D4547A' : '#a3a3a3',
                                    color: activeFilter ? '#D4547A' : '#404040',
                                    background: activeFilter ? 'rgba(212,84,122,0.05)' : 'transparent',
                                }}
                            >
                                <span className="truncate max-w-[160px]">
                                    {activeFilter || 'All Crafts'}
                                </span>
                                <motion.svg
                                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    width="10" height="10" viewBox="0 0 10 10"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    className="flex-shrink-0"
                                >
                                    <polyline points="2,3 5,7 8,3" />
                                </motion.svg>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
                                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                        exit={{ opacity: 0, y: -6, scaleY: 0.92 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        style={{ transformOrigin: 'top' }}
                                        className="absolute top-full left-0 mt-1 w-64 bg-[#FAF7F2] border border-neutral-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                                    >
                                        {/* All option */}
                                        <button
                                            onClick={() => { setActiveFilter(null); setDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-200 flex items-center gap-2"
                                            style={{
                                                color: !activeFilter ? '#D4547A' : '#404040',
                                                background: !activeFilter ? 'rgba(212,84,122,0.06)' : 'transparent',
                                            }}
                                            onMouseEnter={e => { if (activeFilter) (e.currentTarget as HTMLElement).style.background = '#F2EBE0'; }}
                                            onMouseLeave={e => { if (activeFilter) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                        >
                                            {!activeFilter && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4547A] flex-shrink-0" />
                                            )}
                                            All Crafts
                                        </button>

                                        {/* Divider */}
                                        <div className="h-px bg-neutral-200 mx-3" />

                                        {/* Specialty options */}
                                        {allSpecialties.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setActiveFilter(s); setDropdownOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-200 flex items-center gap-2"
                                                style={{
                                                    color: activeFilter === s ? '#D4547A' : '#404040',
                                                    background: activeFilter === s ? 'rgba(212,84,122,0.06)' : 'transparent',
                                                }}
                                                onMouseEnter={e => { if (activeFilter !== s) (e.currentTarget as HTMLElement).style.background = '#F2EBE0'; }}
                                                onMouseLeave={e => { if (activeFilter !== s) (e.currentTarget as HTMLElement).style.background = activeFilter === s ? 'rgba(212,84,122,0.06)' : 'transparent'; }}
                                            >
                                                {activeFilter === s && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4547A] flex-shrink-0" />
                                                )}
                                                {s}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* A–Z jump (desktop) */}
                        <div className="hidden lg:flex items-center gap-0.5 ml-auto">
                            {alphabet.map(letter => {
                                const has = !!groupedArtisans[letter]?.length;
                                return (
                                    <button
                                        key={letter}
                                        disabled={!has}
                                        onClick={() =>
                                            document
                                                .getElementById(`ls-${letter}`)
                                                ?.scrollIntoView({ behavior: 'smooth' })
                                        }
                                        className={`w-5 h-5 text-[11px] font-serif font-bold transition-all ${
                                            has
                                                ? 'text-neutral-700 hover:text-[#D4547A] cursor-pointer'
                                                : 'text-neutral-300 cursor-not-allowed'
                                        }`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Artisan rows ───────────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
                    {loading ? (
                        <div className="space-y-0 pt-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-8 py-6 border-b border-neutral-100 animate-pulse"
                                >
                                    <div className="w-10 h-3.5 rounded bg-neutral-200" />
                                    <div className="flex-1 h-7 rounded bg-neutral-200" />
                                    <div className="w-24 h-3 rounded bg-neutral-200" />
                                    <div className="w-16 h-3 rounded bg-neutral-200" />
                                </div>
                            ))}
                        </div>
                    ) : activeLetters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
                            <span className="font-serif text-5xl mb-4">∅</span>
                            <p className="text-xs uppercase tracking-widest font-bold">No makers found</p>
                        </div>
                    ) : (
                        activeLetters.map((letter, groupIdx) => {
                            const group = groupedArtisans[letter];
                            return (
                                <motion.div
                                    key={letter}
                                    id={`ls-${letter}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.45, delay: groupIdx * 0.03 }}
                                    className="scroll-mt-20"
                                >
                                    {/* Group header */}
                                    <div className="sticky top-[57px] z-20 flex items-center gap-5 py-2.5 bg-[#FAF7F2]/90 backdrop-blur-sm border-b border-neutral-200/50">
                                        <span
                                            className="font-serif font-black leading-none select-none"
                                            style={{
                                                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                                                color: '#D4547A',
                                            }}
                                        >
                                            {letter}
                                        </span>
                                        <div className="h-px flex-1 bg-neutral-200" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-600">
                                            {group.length} maker{group.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Rows */}
                                    <div className="divide-y divide-neutral-100">
                                        {group.map((artisan: any) => {
                                            globalIndex++;
                                            const num = String(globalIndex).padStart(3, '0');
                                            const isHovered = activeRowId === artisan.id;
                                            const anyHovered = activeRowId !== null;

                                            return (
                                                <div
                                                    key={artisan.id}
                                                    onMouseEnter={() => {
                                                        setHoveredArtisan(artisan);
                                                        setActiveRowId(artisan.id);
                                                    }}
                                                    onMouseLeave={() => {
                                                        setHoveredArtisan(null);
                                                        setActiveRowId(null);
                                                    }}
                                                    className="group relative flex items-center gap-6 md:gap-10 py-5 md:py-6 cursor-none overflow-hidden"
                                                    style={{
                                                        // Non-hovered rows fade when any row is hovered
                                                        opacity: anyHovered ? (isHovered ? 1 : 0.3) : 1,
                                                        transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1)',
                                                    }}
                                                >
                                                    {/* Invert fill — cream → charcoal on hover */}
                                                    <div
                                                        className="absolute inset-0 -z-0"
                                                        style={{
                                                            background: isHovered ? '#0A0A0A' : 'transparent',
                                                            transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                                                            transformOrigin: 'left',
                                                            transition: 'transform 0.55s cubic-bezier(0.16,1,0.3,1), background 0.3s',
                                                        }}
                                                    />

                                                    {/* Pink left accent on hover */}
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 w-[3px] z-10"
                                                        style={{
                                                            background: isHovered
                                                                ? 'linear-gradient(180deg, transparent, #D4547A, transparent)'
                                                                : 'transparent',
                                                            transition: 'background 0.4s',
                                                        }}
                                                    />

                                                    {/* Serial number */}
                                                    <span
                                                        className="relative z-10 font-mono text-xs font-bold pl-4 flex-shrink-0"
                                                        style={{
                                                            color: isHovered ? 'rgba(212,84,122,1)' : 'rgba(10,10,10,0.45)',
                                                            transition: 'color 0.35s',
                                                        }}
                                                    >
                                                        {num}
                                                    </span>

                                                    {/* Name */}
                                                    <div className="relative z-10 flex-1 min-w-0">
                                                        <h3
                                                            className="font-serif font-bold leading-none tracking-tight truncate"
                                                            style={{
                                                                fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)',
                                                                color: isHovered ? '#FAF7F2' : '#0A0A0A',
                                                                transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
                                                                transition: 'color 0.35s, transform 0.55s cubic-bezier(0.16,1,0.3,1)',
                                                            }}
                                                        >
                                                            {artisan.name}
                                                        </h3>
                                                    </div>

                                                    {/* Specialty */}
                                                    <div className="relative z-10 hidden md:block flex-shrink-0">
                                                        <span
                                                            className="text-[11px] font-black uppercase tracking-[0.25em]"
                                                            style={{
                                                                color: isHovered ? '#D4547A' : 'rgba(10,10,10,0.55)',
                                                                transition: 'color 0.35s',
                                                            }}
                                                        >
                                                            {artisan.specialty || 'Artisan'}
                                                        </span>
                                                    </div>

                                                    {/* Dot */}
                                                    <div
                                                        className="relative z-10 hidden md:block w-[4px] h-[4px] rounded-full flex-shrink-0"
                                                        style={{
                                                            background: isHovered ? '#D4547A' : 'rgba(10,10,10,0.35)',
                                                            transition: 'background 0.35s',
                                                        }}
                                                    />

                                                    {/* Location */}
                                                    <span
                                                        className="relative z-10 text-[11px] font-black uppercase tracking-[0.25em] flex-shrink-0 pr-6 hidden sm:block"
                                                        style={{
                                                            color: isHovered ? 'rgba(250,247,242,0.7)' : 'rgba(10,10,10,0.55)',
                                                            transition: 'color 0.35s',
                                                        }}
                                                    >
                                                        {artisan.location || 'India'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Cursor-follow preview card (light mode) ────────────── */}
            <AnimatePresence>
                {hoveredArtisan && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 10 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                        style={{
                            position: 'fixed',
                            left: mousePos.x + 22,
                            top: mousePos.y - 150,
                            pointerEvents: 'none',
                            zIndex: 9999,
                            background: '#FAF7F2',
                        }}
                        className="w-52 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.18)] border border-neutral-200"
                    >
                        <div>
                            {/* Accent bar */}
                            <div className="h-[2px] w-full bg-gradient-to-r from-[#D4547A] via-[#E8A020] to-[#7C6FCD]" />

                            {/* Image or monogram */}
                            {hoveredArtisan.img ? (
                                <div className="w-full aspect-[4/3] overflow-hidden bg-neutral-100">
                                    <img
                                        src={hoveredArtisan.img}
                                        alt={hoveredArtisan.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-full aspect-[4/3] flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #F2EBE0 0%, #FAF7F2 100%)' }}
                                >
                                    <span
                                        className="font-serif font-black select-none"
                                        style={{
                                            fontSize: '5rem',
                                            lineHeight: 1,
                                            color: 'rgba(212,84,122,0.15)',
                                        }}
                                    >
                                        {(hoveredArtisan.name || 'A').charAt(0)}
                                    </span>
                                </div>
                            )}

                            {/* Info */}
                            <div className="p-3 space-y-1 bg-[#FAF7F2]">
                                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#D4547A] block">
                                    Rifa Partner
                                </span>
                                <h4 className="font-serif text-sm font-bold text-neutral-950 leading-tight">
                                    {hoveredArtisan.name}
                                </h4>
                                <p className="text-[10px] uppercase tracking-wider text-neutral-700 font-bold">
                                    {hoveredArtisan.specialty || 'Master Craftmaker'}
                                </p>
                                <div className="pt-2 flex items-center justify-between border-t border-neutral-200 mt-2">
                                    <span className="text-[10px] text-neutral-700 uppercase tracking-wider font-bold">
                                        {hoveredArtisan.location || 'India'}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-neutral-700">
                                        {hoveredArtisan.productCount || 0} pieces
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Craftmakers;
