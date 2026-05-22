import { Mail, Instagram, MessageCircle, ArrowRight } from 'lucide-react';

const Contact = () => {
    return (
        <div className="pt-32 pb-32 min-h-screen flex items-center justify-center bg-transparent">
            <div className="max-w-4xl w-full px-4 sm:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-brand-pink mb-4">Inquiries</h2>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-950 tracking-tighter mb-6">Get in Touch</h1>
                    <p className="text-xl text-neutral-500 font-serif italic max-w-lg mx-auto">
                        "Talk directly to our support team."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-neutral-200 bg-white">
                    <a href="https://wa.me/918367337381" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-6 p-12 border-b md:border-b-0 md:border-r border-neutral-200 hover:bg-neutral-950 hover:text-white transition-all duration-500 group">
                        <div className="w-14 h-14 bg-brand-rose-100 flex items-center justify-center rounded-full group-hover:bg-brand-pink/20 transition-colors">
                            <MessageCircle size={28} strokeWidth={1} className="text-brand-pink group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif text-2xl font-bold mb-2">WhatsApp</h3>
                            <p className="text-sm text-neutral-500 font-light group-hover:text-neutral-400">Instant replies</p>
                        </div>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mt-4" />
                    </a>

                    <a href="https://www.instagram.com/rifa_crafts_and_gifts?igsh=MWlkYnhrdm1yajIzNQ==" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-6 p-12 border-b md:border-b-0 md:border-r border-neutral-200 hover:bg-neutral-950 hover:text-white transition-all duration-500 group">
                        <div className="w-14 h-14 bg-brand-rose-100 flex items-center justify-center rounded-full group-hover:bg-brand-pink/20 transition-colors">
                            <Instagram size={28} strokeWidth={1} className="text-brand-pink group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif text-2xl font-bold mb-2">Instagram</h3>
                            <p className="text-sm text-neutral-500 font-light group-hover:text-neutral-400">Our portfolio</p>
                        </div>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mt-4" />
                    </a>

                    <a href="mailto:rifaartscrafts@gmail.com" className="flex flex-col items-center justify-center gap-6 p-12 hover:bg-neutral-950 hover:text-white transition-all duration-500 group">
                        <div className="w-14 h-14 bg-brand-rose-100 flex items-center justify-center rounded-full group-hover:bg-brand-pink/20 transition-colors">
                            <Mail size={28} strokeWidth={1} className="text-brand-pink group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif text-2xl font-bold mb-2">Email</h3>
                            <p className="text-sm text-neutral-500 font-light group-hover:text-neutral-400">Detailed requests</p>
                        </div>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mt-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Contact;

