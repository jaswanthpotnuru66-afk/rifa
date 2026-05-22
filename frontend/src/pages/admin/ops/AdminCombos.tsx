import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, IndianRupee, Tag, Package, Store } from 'lucide-react';
import AdminOpsLayout from '../../../layouts/AdminOpsLayout';
import { api } from '../../../lib/api';

const AdminCombos = () => {
    const [combos, setCombos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form selection state
    const [artisans, setArtisans] = useState<any[]>([]);
    const [selectedArtisanId, setSelectedArtisanId] = useState<string>('');
    const [artisanProducts, setArtisanProducts] = useState<any[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    
    // Form data state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Combos');

    useEffect(() => {
        fetchCombos();
        fetchArtisans();
    }, []);

    useEffect(() => {
        if (selectedArtisanId) {
            fetchArtisanProducts(selectedArtisanId);
        } else {
            setArtisanProducts([]);
            setSelectedProductIds([]);
        }
    }, [selectedArtisanId]);

    const fetchCombos = async () => {
        setIsLoading(true);
        try {
            // Fetch products where is_combo is true
            const data = await api.getProducts({ is_combo: true });
            setCombos(data || []);
        } catch (error) {
            console.error('Failed to fetch combos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchArtisans = async () => {
        try {
            const data = await api.getAdminArtisans();
            setArtisans(data || []);
        } catch (error) {
            console.error('Failed to fetch artisans:', error);
        }
    };

    const fetchArtisanProducts = async (artisanId: string) => {
        try {
            // Note: Wait, api.getAdminProducts takes artisanId? Actually, api.getProducts can take artisan_id directly
            const data = await api.getProducts({ artisan_id: artisanId });
            // Filter out existing combos from the list of selectable products
            setArtisanProducts((data || []).filter((p: any) => !p.is_combo));
        } catch (error) {
            console.error('Failed to fetch artisan products:', error);
        }
    };

    const openModal = () => {
        setSelectedArtisanId('');
        setSelectedProductIds([]);
        setName('');
        setPrice('');
        setDescription('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleProductToggle = (id: string) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProductIds.length === 0) {
            alert('Please select at least one product to include in the combo.');
            return;
        }

        setIsSaving(true);
        
        try {
            const payload = {
                artisan_id: selectedArtisanId,
                is_combo: true,
                combo_items: selectedProductIds,
                name,
                price: Number(price),
                description,
                category
            };

            await api.createAdminCombo(payload);
            
            closeModal();
            fetchCombos();
        } catch (error) {
            console.error('Failed to save combo:', error);
            alert('Failed to save combo. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    // The backend does not have a dedicated delete for virtual products in AdminCombos API anymore,
    // we would need an admin product delete endpoint. Assuming delete product endpoint exists or we skip delete for now.
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to unpublish this combo?')) return;
        setIsLoading(true);
        try {
            const success = await api.deleteAdminProduct(id);
            if (success) {
                setCombos(prev => prev.filter(c => c.id !== id));
            } else {
                alert('Failed to unpublish combo.');
            }
        } catch (error) {
            console.error('Error unpublishing combo:', error);
            alert('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminOpsLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Platform Content</p>
                        <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Virtual Combos</h1>
                        <p className="text-neutral-500 text-sm font-light mt-1">Manage single-origin bundled products across the platform.</p>
                    </div>
                    <button 
                        onClick={openModal}
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white hover:bg-neutral-800 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <Plus size={14} /> Add Virtual Product
                    </button>
                </div>

                {/* Combos List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-pink" size={32} />
                    </div>
                ) : combos.length === 0 ? (
                    <div className="bg-white border border-neutral-100 p-12 text-center flex flex-col items-center">
                        <Package size={32} className="text-neutral-300 mb-4" />
                        <h3 className="text-lg font-serif font-bold mb-2">No Virtual Combos Active</h3>
                        <p className="text-sm text-neutral-500 font-light max-w-md mx-auto mb-6">Create single-origin bundles to showcase on the marketplace.</p>
                        <button 
                            onClick={openModal}
                            className="px-6 py-3 border border-neutral-200 text-neutral-900 hover:bg-neutral-50 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            Create Virtual Product
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {combos.map((combo) => (
                            <div key={combo.id} className="bg-white border border-neutral-200 relative overflow-hidden group">
                                {combo.is_custom && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <span className="bg-neutral-950 text-white text-[8px] uppercase tracking-widest font-black px-2 py-1">Custom Built</span>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-serif font-black text-neutral-500 leading-none">
                                            {combo.artisan?.name || 'Unknown Maker'}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDelete(combo.id)} className="p-1.5 text-neutral-400 hover:text-red-500 bg-neutral-50 hover:bg-red-50 rounded-sm">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2 truncate">{combo.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">{combo.combo_items?.length} Items Bundled</p>
                                    
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                            <IndianRupee size={12} /> {combo.price}
                                        </div>
                                        {combo.category && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-pink bg-brand-pink/5 px-2 py-1 rounded-sm">
                                                <Tag size={10} /> {combo.category}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-2xl">
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                            <h2 className="text-lg font-serif font-bold text-neutral-900">Create Virtual Product</h2>
                            <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-900 text-2xl font-light leading-none">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            
                            {/* Step 1: Select Maker */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                    <Store size={12} /> Select Maker (Single-Origin Law)
                                </label>
                                <select 
                                    required
                                    value={selectedArtisanId} 
                                    onChange={e => setSelectedArtisanId(e.target.value)} 
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors"
                                >
                                    <option value="" disabled>-- Choose a Maker --</option>
                                    {artisans.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.specialty || 'Artisan'})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 2: Select Items */}
                            {selectedArtisanId && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Select Items to Bundle</label>
                                    {artisanProducts.length === 0 ? (
                                        <p className="text-sm text-neutral-500 italic">This maker has no available standard products.</p>
                                    ) : (
                                        <div className="max-h-40 overflow-y-auto border border-neutral-200 p-2 space-y-2 bg-neutral-50">
                                            {artisanProducts.map(p => (
                                                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white cursor-pointer border border-transparent hover:border-neutral-200 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedProductIds.includes(p.id)}
                                                        onChange={() => handleProductToggle(p.id)}
                                                        className="w-4 h-4 text-brand-pink border-neutral-300 rounded focus:ring-brand-pink"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-neutral-900">{p.name}</p>
                                                        <p className="text-xs text-neutral-500">₹{p.price} {p.is_custom && <span className="text-brand-pink font-bold ml-2">(Custom Trap Active)</span>}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Bundle Details */}
                            {selectedProductIds.length > 0 && (
                                <div className="space-y-4 border-t border-neutral-100 pt-6 animate-in slide-in-from-top-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Virtual Product Name</label>
                                            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Diwali Hamper" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Discounted Price (₹)</label>
                                            <input required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="1500" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Description</label>
                                        <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the combo..." className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Category</label>
                                        <input required type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-brand-pink transition-colors" />
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-neutral-100 flex justify-end gap-4">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-colors">
                                    Cancel
                                </button>
                                <button disabled={isSaving || selectedProductIds.length === 0} type="submit" className="px-6 py-2.5 bg-brand-pink text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-pink/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                                    Publish Virtual Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminOpsLayout>
    );
};

export default AdminCombos;
