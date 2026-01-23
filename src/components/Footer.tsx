import { Link } from 'react-router-dom';
import { Instagram, Mail, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-brand-beige/30 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-serif font-bold mb-4">Rifa Arts & Crafts</h3>
                        <p className="text-gray-600 mb-6">
                            Customized handmade gifts, woven with emotions and crafted with heart. From your imagination to reality.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-white rounded-full shadow-sm hover:text-brand-pink transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-white rounded-full shadow-sm hover:text-brand-pink transition-colors">
                                <MessageCircle size={20} />
                            </a>
                            <a href="mailto:contact@rifaarts.com" className="p-2 bg-white rounded-full shadow-sm hover:text-brand-pink transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif font-semibold text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link to="/" className="hover:text-brand-pink transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-brand-pink transition-colors">Our Story</Link></li>
                            <li><Link to="/creations" className="hover:text-brand-pink transition-colors">Creations</Link></li>
                            <li><Link to="/combos" className="hover:text-brand-pink transition-colors">Combos</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-serif font-semibold text-lg mb-4">Art Forms</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li>Resin Art</li>
                            <li>Crochet Creations</li>
                            <li>Satin Ribbon Flowers</li>
                            <li>Custom Bouquets</li>
                            <li>Gift Hampers</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif font-semibold text-lg mb-4">Contact Us</h4>
                        <p className="text-gray-600 mb-2">Have an idea?</p>
                        <Link to="/contact" className="text-brand-pink font-medium hover:underline">
                            Get in touch with us
                        </Link>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Rifa Arts & Crafts. All rights reserved.</p>
                    <p className="flex items-center gap-1 mt-2 md:mt-0">
                        Made with <Heart size={14} className="text-red-400 fill-red-400" />
                        <Link to="/admin" className="ml-2 text-transparent hover:text-gray-300 transition-colors w-2 h-2 inline-block">.</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
