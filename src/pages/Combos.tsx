import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const Combos = () => {
    const offers = [
        { title: "Student Friendly", price: "₹500", desc: "A sweet simple gift combo (e.g. Keychain + Mini Frame)" },
        { title: "Standard Love", price: "₹1000", desc: "Bouquet + Resin Frame + Chocolate" },
        { title: "Premium Hamper", price: "₹1500+", desc: "Large Bouquet + Clock + Customized Gift Box" },
    ];

    return (
        <div className="pt-24 pb-16 min-h-screen bg-brand-cream">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-6">Combos & Offers</h1>
                <p className="text-gray-600 mb-12">Budget-friendly gifting with a premium touch.</p>

                <div className="mt-6 inline-block bg-white border border-brand-rose-200 px-6 py-2 rounded-full shadow-sm text-brand-rose-600 font-medium animate-pulse">
                    🎁 Free Handmade Gift with every order
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-12">
                    {offers.map((offer, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-xl shadow-lg border-2 border-brand-rose-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="absolute top-0 right-0 bg-brand-pink text-white px-4 py-1 rounded-bl-lg font-bold">
                                {offer.price}
                            </div>
                            <Gift className="w-12 h-12 text-brand-pink mb-4" />
                            <h3 className="text-2xl font-serif font-bold mb-2">{offer.title}</h3>
                            <p className="text-gray-600 mb-6">{offer.desc}</p>
                            <Link to="/custom-order" className="btn-secondary w-full block bg-transparent hover:bg-brand-rose-50">Order This</Link>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-brand-rose-50 p-8 rounded-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-brand-rose-100">
                    <div className="text-left">
                        <h3 className="text-2xl font-serif font-bold mb-2 text-brand-text">Surprise Mystery Box 🎁</h3>
                        <p className="text-gray-600 text-lg">Tell us your budget and a little about the person, and we'll create a surprise mystery box worth more than what you pay!</p>
                    </div>
                    <Link to="/custom-order" className="btn-primary whitespace-nowrap">Get a Surprise Box</Link>
                </div>
            </div>
        </div>
    );
};

export default Combos;
