import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Mail, Lock, User, ArrowRight, 
    ChevronLeft, Sparkles, ShieldCheck,
    Facebook
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Get the path to redirect to after login (default to home)
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate Auth Delay
        setTimeout(() => {
            setIsLoading(false);
            navigate(from, { replace: true });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 pt-32 pb-20 selection:bg-brand-pink/20">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-pink/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-pink/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Back to Home */}
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-950 transition-all mb-8 group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Gallery
                </Link>

                <div className="bg-white rounded-sm border border-neutral-100 shadow-2xl overflow-hidden relative">
                    {/* Premium Header */}
                    <div className="p-10 pb-6 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-neutral-950 flex items-center justify-center text-brand-pink relative">
                                <Sparkles size={24} />
                                <div className="absolute inset-0 border-2 border-brand-pink/20 rounded-full animate-ping opacity-20" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 leading-none tracking-tight">
                            {mode === 'login' ? 'Welcome Back' : 'Join the Collective'}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mt-4">
                            {mode === 'login' ? 'Access your personal collection' : 'Become a Collector or Artisan'}
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex px-10 gap-8 border-b border-neutral-50 mb-8">
                        <button 
                            type="button"
                            onClick={() => setMode('login')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${mode === 'login' ? 'text-neutral-950' : 'text-neutral-300 hover:text-neutral-400'}`}
                        >
                            Sign In
                            {mode === 'login' && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setMode('signup')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${mode === 'signup' ? 'text-neutral-950' : 'text-neutral-300 hover:text-neutral-400'}`}
                        >
                            Register
                            {mode === 'signup' && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                        </button>
                    </div>

                    {/* Auth Form */}
                    <div className="px-10 pb-10 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {mode === 'signup' && (
                                        <div className="space-y-1">
                                            <label htmlFor="full-name" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Full Name</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                                <input 
                                                    id="full-name"
                                                    type="text" 
                                                    placeholder="Sai Sampath"
                                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                            <input 
                                                id="email"
                                                type="email" 
                                                placeholder="sai@example.com"
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label htmlFor="pass" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Secure Password</label>
                                            {mode === 'login' && (
                                                <button type="button" className="text-[8px] font-black uppercase tracking-widest text-neutral-300 hover:text-brand-pink transition-colors">Forgot?</button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                            <input 
                                                id="pass"
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-b-2 border-neutral-100 focus:border-brand-pink outline-none text-sm font-bold transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-2xl flex items-center justify-center gap-4 group"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Enter Gallery' : 'Create Account'} 
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Social Dividers */}
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-neutral-50"></div>
                            <span className="flex-shrink mx-4 text-[8px] font-black uppercase tracking-widest text-neutral-300">Quick Access</span>
                            <div className="flex-grow border-t border-neutral-50"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-3 py-4 border border-neutral-100 rounded-sm hover:bg-neutral-50 transition-all group">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-3 py-4 border border-neutral-100 rounded-sm hover:bg-neutral-50 transition-all group">
                                <Facebook size={16} className="text-neutral-400 group-hover:text-[#1877F2] transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-8 flex items-center justify-center gap-3 text-neutral-300">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Secure Member Vault</span>
                </div>
            </div>
        </div>
    );
};

export default Auth;
