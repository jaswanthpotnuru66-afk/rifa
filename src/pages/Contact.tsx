import { Mail, Instagram, MessageCircle } from 'lucide-react';

const Contact = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-brand-cream flex items-center justify-center">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-2xl w-full text-center border border-gray-100">
                <h1 className="text-4xl font-serif font-bold text-brand-text mb-6">Get in Touch</h1>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                    Have an idea, reference, or question? We’re happy to talk.
                    <br />
                    <strong>“Talk directly to the maker.”</strong>
                </p>

                <div className="space-y-6">
                    <a href="#" className="flex items-center justify-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-pink hover:bg-brand-rose-50 transition-all group">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800">WhatsApp</h3>
                            <p className="text-gray-500 text-sm">Chat for instant replies</p>
                        </div>
                    </a>

                    <a href="#" className="flex items-center justify-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-pink hover:bg-brand-rose-50 transition-all group">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Instagram size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800">Instagram</h3>
                            <p className="text-gray-500 text-sm">See our latest work</p>
                        </div>
                    </a>

                    <a href="#" className="flex items-center justify-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-pink hover:bg-brand-rose-50 transition-all group">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800">Email</h3>
                            <p className="text-gray-500 text-sm">Send detailed inquiries</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Contact;
