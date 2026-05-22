import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';

const CreateCombo = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchMakerProducts();
    }, []);

    const fetchMakerProducts = async () => {
        setIsLoading(true);
        try {
            // A Maker's products can be fetched from the public endpoint using their artisan_id
            // However, it's easier to just call api.getProducts without artisan_id if the backend
            const data = await api.getArtisanProducts();
            setProducts((data || []).filter((p: any) => !p.is_combo));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductToggle = (id: string) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProductIds.length === 0) {
            alert('Please select at least one product to bundle.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name,
                price: Number(price),
                original_price: originalPrice ? Number(originalPrice) : null,
                description,
                category: 'Combos',
                is_combo: true,
                combo_items: selectedProductIds,
                images: imageUrl ? [imageUrl] : [],
                tag: 'Virtual Bundle'
            };

            await api.createProduct(payload);
            
            navigate('/craftmaker/listings');
        } catch (error) {
            console.error('Failed to save combo:', error);
            alert('Failed to save combo. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CraftMakerLayout>
            <div className="max-w-3xl mx-auto pb-24">
                <button 
                    onClick={() => navigate('/craftmaker/listings')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 text-[10px] font-black uppercase tracking-widest"
                >
                    <ArrowLeft size={14} /> Back to Listings
                </button>

                <div>
                    <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-2">Create Virtual Combo</h1>
                    <p className="text-neutral-500 font-light text-sm mb-8">Bundle your existing products together. We will automatically sum the weights and enforce single-box shipping.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-8 bg-white p-8 border border-neutral-200">
                    
                    {/* Step 1: Select Items */}
                    <div className="space-y-4">
                        <div className="border-b border-neutral-100 pb-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">1. Select Products</h2>
                            <p className="text-xs text-neutral-500 mt-1">Select the items to include in this bundle.</p>
                        </div>
                        
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-brand-pink" size={24} />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-neutral-50 p-6 text-center border border-neutral-200">
                                <p className="text-sm text-neutral-500">You don't have any standard products to bundle.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                                {products.map(p => (
                                    <label key={p.id} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${selectedProductIds.includes(p.id) ? 'border-brand-pink bg-brand-pink/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedProductIds.includes(p.id)}
                                            onChange={() => handleProductToggle(p.id)}
                                            className="mt-1 w-4 h-4 text-brand-pink border-neutral-300 rounded focus:ring-brand-pink"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-neutral-900 leading-tight">{p.name}</p>
                                            <p className="text-xs text-neutral-500 mt-1">₹{p.price}</p>
                                            {p.is_custom && <p className="text-[10px] font-bold text-brand-pink mt-1 uppercase">Custom Order</p>}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        
                        {selectedProductIds.length > 0 && (
                            <div className="bg-neutral-50 p-4 border border-neutral-200">
                                <p className="text-xs text-neutral-700">
                                    <span className="font-bold">{selectedProductIds.length}</span> items selected. 
                                    {products.some(p => selectedProductIds.includes(p.id) && p.is_custom) && (
                                        <span className="text-brand-pink font-bold ml-2">Note: This combo will be marked as Custom because it contains custom items.</span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Details */}
                    <div className="space-y-4">
                        <div className="border-b border-neutral-100 pb-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">2. Bundle Details</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Combo Title</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Perfect Gift Set" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Discounted Price (₹)</label>
                                    <input required type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="Final selling price" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Original Value (₹) Optional</label>
                                    <input type="number" min="1" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="Total individual value" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Description</label>
                                <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what makes this combination special..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors resize-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Cover Image URL</label>
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="text-neutral-400" size={16} />
                                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100 flex justify-end">
                        <button disabled={isSaving || selectedProductIds.length === 0} type="submit" className="px-8 py-4 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSaving && <Loader2 size={14} className="animate-spin" />}
                            Publish Virtual Combo
                        </button>
                    </div>
                </form>
            </div>
        </CraftMakerLayout>
    );
};

export default CreateCombo;
