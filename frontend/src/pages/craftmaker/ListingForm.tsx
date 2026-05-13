import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, type UseFormRegister, type UseFormWatch, type UseFormSetValue, type FieldArrayWithId } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Image as ImageIcon, Plus, 
    Trash2, X, AlertTriangle, Info, ChevronDown, 
    GripVertical, Palette, Type, List, Upload, 
    Eye, Star
} from 'lucide-react';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockListings, type CraftMakerListing } from '../../lib/craftmaker';
import MagneticButton from '../../components/MagneticButton';

const categories = [
    'Wood', 'Pottery', 'Leather', 'Textiles', 'Resin Art', 'Crochet',
    'Clay Art', 'Canvas Art', 'Jewellery', 'Home Decor'
];

const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

type FormInputs = Omit<CraftMakerListing, 'id' | 'createdAt' | 'views' | 'ordersCount'>;

const ListingForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const existingListing = isEditMode ? mockListings.find(l => l.id === id) : null;

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormInputs>({
        defaultValues: existingListing ? {
            title: existingListing.title,
            category: existingListing.category,
            subCategory: existingListing.subCategory || '',
            description: existingListing.description,
            tags: existingListing.tags,
            stateOfOrigin: existingListing.stateOfOrigin,
            images: existingListing.images,
            basePrice: existingListing.basePrice,
            compareAtPrice: existingListing.compareAtPrice,
            stock: existingListing.stock,
            isUnlimited: existingListing.isUnlimited,
            isCustomisable: existingListing.isCustomisable,
            processingTime: existingListing.processingTime || 7,
            specFields: existingListing.specFields || [],
            packageWeight: existingListing.packageWeight,
            dimensions: existingListing.dimensions,
            returnWindow: existingListing.returnWindow,
            exchangeAccepted: existingListing.exchangeAccepted,
            status: existingListing.status
        } : {
            title: '',
            category: 'Pottery',
            subCategory: '',
            description: '',
            tags: [],
            stateOfOrigin: 'Rajasthan',
            images: [],
            basePrice: 0,
            stock: 1,
            isUnlimited: false,
            isCustomisable: false,
            processingTime: 7,
            specFields: [],
            packageWeight: 0,
            dimensions: { l: 0, w: 0, h: 0 },
            returnWindow: '7 days',
            exchangeAccepted: true,
            status: 'active'
        }
    });

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control,
        name: 'specFields'
    });

    const [tagInput, setTagInput] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isMaterialNoticeOn, setIsMaterialNoticeOn] = useState(false);

    // Watchers for Live Preview
    const allValues = watch();
    const title = watch('title');
    const price = watch('basePrice');
    const comparePrice = watch('compareAtPrice');
    const images = watch('images');
    const category = watch('category');
    const isCustomisable = watch('isCustomisable');
    const tags = watch('tags');
    const dims = watch('dimensions');
    const weight = watch('packageWeight');

    // DIM Weight calculation
    const dimWeight = useMemo(() => {
        const { l, w, h } = dims || { l: 0, w: 0, h: 0 };
        return Math.round((Number(l) * Number(w) * Number(h)) / 5000 * 1000) / 1000;
    }, [dims]);

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().replace(',', '');
            if (tag && !tags.includes(tag)) {
                setValue('tags', [...tags, tag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', tags.filter(t => t !== tagToRemove));
    };

    const handlePhotoUpload = () => {
        // Mock upload - add a placeholder
        if (images.length < 8) {
            setValue('images', [...images, '/products/pottery.png']);
        }
    };

    const onSubmit = (data: FormInputs) => {
        console.log('Publishing listing:', data);
        // Toast logic would go here
        navigate('/craftmaker/listings');
    };

    return (
        <CraftMakerLayout title={isEditMode ? `Edit Listing — ${existingListing?.title}` : 'New Listing'}>
            <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-10">
                    <Link to="/craftmaker/listings" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-950 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft size={14} /> Back to Archives
                    </Link>
                    <div className="flex items-center gap-4">
                        <button type="button" className="px-8 py-4 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-all hover:border-neutral-950">
                            Save as Draft
                        </button>
                        <MagneticButton>
                            <button type="submit" className="px-10 py-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-opacity-90 transition-all">
                                Publish Listing
                            </button>
                        </MagneticButton>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* LEFT COLUMN: FORM */}
                    <div className="flex-1 space-y-6">
                        
                        {/* SECTION 1: BASIC INFO */}
                        <Card title="Basic Information">
                            <div className="space-y-8">
                                <Field label="Product Title" count={`${title?.length || 0}/100`} error={errors.title && 'Title is required'}>
                                    <input 
                                        {...register('title', { required: true, maxLength: 100 })}
                                        className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all"
                                        placeholder="e.g. Traditional Hand-painted Terracotta Vase"
                                    />
                                </Field>

                                <div className="grid sm:grid-cols-2 gap-8">
                                    <Field label="Primary Category">
                                        <select 
                                            {...register('category')}
                                            className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all appearance-none"
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Sub-category (Optional)">
                                        <input 
                                            {...register('subCategory')}
                                            className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all"
                                            placeholder="e.g. Tableware"
                                        />
                                    </Field>
                                </div>

                                <Field label="Description" count={`${allValues.description?.length || 0}/2000`} error={errors.description && 'Description is required'}>
                                    <textarea 
                                        {...register('description', { required: true, maxLength: 2000 })}
                                        className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-medium transition-all min-h-[150px] resize-none"
                                        placeholder="Tell the story of this piece..."
                                    />
                                </Field>

                                <Field label="Tags">
                                    <div className="space-y-4">
                                        <input 
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all"
                                            placeholder="Type tag and press Enter"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full group">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="text-neutral-300 hover:text-red-500 transition-colors">
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Field>

                                <Field label="State of Origin">
                                    <select 
                                        {...register('stateOfOrigin')}
                                        className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all appearance-none"
                                    >
                                        {states.map(state => <option key={state} value={state}>{state}</option>)}
                                    </select>
                                </Field>
                            </div>
                        </Card>

                        {/* SECTION 2: PHOTOS */}
                        <Card title="Gallery Archives">
                            <div className="space-y-6">
                                <div 
                                    onClick={handlePhotoUpload}
                                    className="border-2 border-dashed border-neutral-200 rounded-sm p-12 text-center cursor-pointer hover:border-brand-pink/50 hover:bg-brand-pink/[0.01] transition-all group"
                                >
                                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="text-neutral-300 group-hover:text-brand-pink transition-colors" size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 group-hover:text-neutral-950">Drop photos here or click to browse</span>
                                    <p className="text-[9px] text-neutral-300 font-bold uppercase mt-2">{images.length} / 8 photos added</p>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-neutral-100 group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <div className="absolute top-0 left-0 bg-brand-pink text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                                                    Cover
                                                </div>
                                            )}
                                            <button 
                                                type="button" 
                                                onClick={() => setValue('images', images.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 8 - images.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center text-neutral-200">
                                            <Plus size={16} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* SECTION 3: PRICING & STOCK */}
                        <Card title="Pricing & Availability">
                            <div className="space-y-10">
                                <div className="grid sm:grid-cols-2 gap-10">
                                    <Field label="Base Price ₹">
                                        <div className="flex items-baseline gap-2 bg-neutral-50 border-b-2 border-neutral-100 p-4 focus-within:border-brand-pink transition-all">
                                            <span className="text-xl font-bold text-neutral-300">₹</span>
                                            <input 
                                                type="number"
                                                {...register('basePrice', { required: true, min: 0 })}
                                                className="w-full bg-transparent outline-none text-2xl font-serif font-bold text-neutral-950"
                                                placeholder="0"
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Compare-at Price ₹ (Optional)">
                                        <div className="flex items-baseline gap-2 bg-neutral-50 border-b-2 border-neutral-100 p-4 focus-within:border-neutral-950 transition-all">
                                            <span className="text-lg font-bold text-neutral-300">₹</span>
                                            <input 
                                                type="number"
                                                {...register('compareAtPrice', { min: 0 })}
                                                className="w-full bg-transparent outline-none text-xl font-serif font-bold text-neutral-400 line-through"
                                                placeholder="0"
                                            />
                                        </div>
                                    </Field>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-10 items-end">
                                    {!allValues.isUnlimited ? (
                                        <Field label="Stock Quantity">
                                            <input 
                                                type="number"
                                                {...register('stock', { required: !allValues.isUnlimited, min: 0 })}
                                                className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all"
                                                placeholder="1"
                                            />
                                        </Field>
                                    ) : <div />}
                                    
                                    <label className="flex items-center gap-4 cursor-pointer p-4 bg-neutral-50 rounded-sm hover:bg-neutral-100 transition-all">
                                        <input 
                                            type="checkbox"
                                            {...register('isUnlimited')}
                                            className="w-5 h-5 rounded border-neutral-300 text-brand-pink focus:ring-brand-pink"
                                        />
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 block">Unlimited Availability</span>
                                            <span className="text-[9px] text-neutral-400 font-bold uppercase">Made to order / digital piece</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-8 border-t border-neutral-100">
                                    <label className="flex items-center justify-between p-6 bg-brand-pink/[0.03] border border-brand-pink/10 rounded-sm cursor-pointer hover:bg-brand-pink/[0.05] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink group-hover:scale-110 transition-transform">
                                                <Palette size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-950">This is a Customisable item</h4>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Unlock bespoke configurations for your buyers</p>
                                            </div>
                                        </div>
                                        <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isCustomisable ? 'bg-brand-pink' : 'bg-neutral-200'}`}>
                                            <input type="checkbox" {...register('isCustomisable')} className="hidden" />
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${isCustomisable ? 'left-8' : 'left-1'}`} />
                                        </div>
                                    </label>

                                    <AnimatePresence>
                                        {isCustomisable && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-8 space-y-10 pl-6 border-l-2 border-brand-pink/20">
                                                    
                                                    {/* Processing Time */}
                                                    <Field label="Production SLA (Processing Time)">
                                                        <select 
                                                            {...register('processingTime')}
                                                            className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all appearance-none"
                                                        >
                                                            <option value={3}>3 Days (Fast)</option>
                                                            <option value={7}>7 Days (Standard)</option>
                                                            <option value={14}>14 Days (Complex)</option>
                                                            <option value={21}>21 Days (Bespoke)</option>
                                                        </select>
                                                    </Field>

                                                    {/* COD Notice */}
                                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex gap-4">
                                                        <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1">COD Disabled for Custom Items</p>
                                                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed uppercase tracking-tight">Buyers must pay upfront via digital methods to prevent losses on personalized pieces.</p>
                                                        </div>
                                                    </div>

                                                    {/* Form Builder */}
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Specification Fields for Buyers</h5>
                                                            <div className="relative group">
                                                                <button type="button" className="inline-flex items-center gap-2 text-brand-pink text-[10px] font-black uppercase tracking-widest hover:underline">
                                                                    <Plus size={14} /> Add Field
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-100 rounded-sm shadow-2xl z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                                                                    {[
                                                                        { label: 'Text Box', type: 'text', icon: Type },
                                                                        { label: 'Dropdown', type: 'dropdown', icon: List },
                                                                        { label: 'Image Upload', type: 'image', icon: Upload },
                                                                        { label: 'Colour Picker', type: 'color', icon: Palette }
                                                                    ].map(opt => (
                                                                        <button 
                                                                            key={opt.type}
                                                                            type="button"
                                                                            onClick={() => appendSpec({ id: Math.random().toString(36).substr(2, 9), type: opt.type as "color" | "image" | "text" | "dropdown", label: '', required: true })}
                                                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
                                                                        >
                                                                            <opt.icon size={14} className="text-neutral-300" /> {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {specFields.map((field, idx) => (
                                                                <SpecFieldCard 
                                                                    key={field.id} 
                                                                    field={field} 
                                                                    index={idx} 
                                                                    remove={() => removeSpec(idx)} 
                                                                    register={register}
                                                                    watch={watch}
                                                                    setValue={setValue}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Material Notice */}
                                                    <div className="space-y-4 pt-6 border-t border-neutral-100">
                                                        <label className="flex items-center justify-between cursor-pointer group">
                                                            <div className="flex-1">
                                                                <h5 className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Natural Material Notice</h5>
                                                                <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Enable for wood, stone, leather, or textiles</p>
                                                            </div>
                                                            <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isMaterialNoticeOn ? 'bg-teal-500' : 'bg-neutral-200'}`}>
                                                                <input type="checkbox" checked={isMaterialNoticeOn} onChange={() => setIsMaterialNoticeOn(!isMaterialNoticeOn)} className="hidden" />
                                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isMaterialNoticeOn ? 'left-7' : 'left-1'}`} />
                                                            </div>
                                                        </label>

                                                        {isMaterialNoticeOn && (
                                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-5 bg-teal-50 border border-teal-200 rounded-sm flex gap-4">
                                                                <Info className="text-teal-600 shrink-0" size={18} />
                                                                <p className="text-[11px] text-teal-800 font-medium leading-relaxed italic">"Natural material variations in grain, texture, and colour are inherent to this product and are not manufacturing defects."</p>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </Card>

                        {/* SECTION 4: SHIPPING */}
                        <Card title="Logistics & Packaging">
                            <div className="space-y-10">
                                <Field label="Actual Weight (grams)">
                                    <input 
                                        type="number"
                                        {...register('packageWeight', { required: true, min: 0 })}
                                        className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all"
                                        placeholder="500"
                                    />
                                </Field>

                                <div className="space-y-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Package Dimensions (cm)</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-neutral-50 border-b-2 border-neutral-100 p-4 focus-within:border-brand-pink transition-all">
                                            <input type="number" {...register('dimensions.l')} className="w-full bg-transparent outline-none text-center font-bold" placeholder="L" />
                                        </div>
                                        <span className="text-neutral-300 text-xs">×</span>
                                        <div className="flex-1 bg-neutral-50 border-b-2 border-neutral-100 p-4 focus-within:border-brand-pink transition-all">
                                            <input type="number" {...register('dimensions.w')} className="w-full bg-transparent outline-none text-center font-bold" placeholder="W" />
                                        </div>
                                        <span className="text-neutral-300 text-xs">×</span>
                                        <div className="flex-1 bg-neutral-50 border-b-2 border-neutral-100 p-4 focus-within:border-brand-pink transition-all">
                                            <input type="number" {...register('dimensions.h')} className="w-full bg-transparent outline-none text-center font-bold" placeholder="H" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-neutral-400">
                                        <span>Dimensional Weight:</span>
                                        <span className="text-neutral-950">{dimWeight}g</span>
                                    </div>

                                    {dimWeight > weight && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex gap-4">
                                            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                                            <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed tracking-tight">
                                                Carrier will bill {dimWeight}g (dimensional weight) instead of {weight}g. Adjust your pricing to account for the difference.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-sm flex gap-4 items-center">
                                    <Info className="text-neutral-300 shrink-0" size={20} />
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase leading-relaxed tracking-tight">Shipping is handled by Rifa. Cost is calculated live per buyer based on their delivery PIN via Shiprocket.</p>
                                </div>
                            </div>
                        </Card>

                        {/* SECTION 5: RETURNS */}
                        <Card title="Refund Policy">
                            <div className="space-y-8">
                                <Field label="Return Window">
                                    <select 
                                        {...register('returnWindow')}
                                        className="w-full bg-neutral-50 border-b-2 border-neutral-100 p-4 outline-none focus:border-brand-pink text-sm font-bold transition-all appearance-none"
                                    >
                                        <option value="No returns">No returns</option>
                                        <option value="3 days">3 Days Window</option>
                                        <option value="7 days">7 Days Window</option>
                                        <option value="14 days">14 Days Window</option>
                                    </select>
                                </Field>

                                {isCustomisable && (
                                    <span className="block text-[9px] text-neutral-400 font-black uppercase tracking-widest leading-relaxed">
                                        Custom orders follow the platform proof-mismatch return policy regardless of this setting.
                                    </span>
                                )}

                                <label className="flex items-center justify-between p-6 bg-neutral-50 border border-neutral-100 rounded-sm cursor-pointer hover:bg-neutral-100 transition-all">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Exchange Accepted</span>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${allValues.exchangeAccepted ? 'bg-neutral-950' : 'bg-neutral-200'}`}>
                                        <input type="checkbox" {...register('exchangeAccepted')} className="hidden" />
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${allValues.exchangeAccepted ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </label>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className="w-full lg:w-[400px] shrink-0">
                        <div className="sticky top-10 space-y-8">
                            
                            {/* Product Card Preview */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Card Preview</h3>
                                <div className="group flex flex-col max-w-[320px]">
                                    <div className="relative aspect-[4/5] bg-white overflow-hidden mb-6 border border-neutral-100">
                                        {images && images[0] ? (
                                            <img src={images[0]} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-50 flex items-center justify-center text-neutral-200"><ImageIcon size={48} strokeWidth={1} /></div>
                                        )}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                            {isCustomisable && (
                                                <span className="bg-brand-pink text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl">Customisable</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-brand-pink transition-colors">{category}</span>
                                            <div className="flex items-center gap-1">
                                                <Star size={10} className="fill-brand-gold text-brand-gold" />
                                                <span className="text-[10px] font-bold text-neutral-950">5.0</span>
                                            </div>
                                        </div>
                                        <h3 className="font-serif text-xl text-neutral-950 mb-4 leading-snug group-hover:italic transition-all">
                                            {title || 'Product Title'}
                                        </h3>
                                        <div className="mt-auto flex items-baseline gap-3">
                                            <span className="text-xl font-bold text-neutral-950">₹ {price ? price.toLocaleString() : '--'}</span>
                                            {Number(comparePrice || 0) > 0 && <span className="text-sm text-neutral-300 line-through font-light">₹ {Number(comparePrice).toLocaleString()}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Spec Form Preview */}
                            {isCustomisable && specFields.length > 0 && (
                                <div className="space-y-6 pt-10 border-t border-neutral-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Spec Form Preview (Buyer View)</h3>
                                    <div className="bg-white border border-neutral-100 p-6 space-y-6">
                                        {specFields.map((field, idx) => (
                                            <div key={idx} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900">{field.label || 'Untitled Field'}</span>
                                                    {field.required && <span className="text-brand-pink text-xs">*</span>}
                                                </div>
                                                {field.type === 'text' && (
                                                    <input disabled className="w-full bg-neutral-50 border border-neutral-100 p-3 text-[10px] uppercase tracking-widest font-bold placeholder:text-neutral-300" placeholder={field.placeholder || 'Type here...'} />
                                                )}
                                                {field.type === 'dropdown' && (
                                                    <div className="relative">
                                                        <div className="w-full bg-neutral-50 border border-neutral-100 p-3 text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex justify-between">Select option <ChevronDown size={14} /></div>
                                                    </div>
                                                )}
                                                {field.type === 'image' && (
                                                    <div className="w-full bg-neutral-50 border-2 border-dashed border-neutral-100 p-6 text-center text-neutral-300"><Upload size={16} className="mx-auto mb-2" /><span className="text-[9px] font-bold uppercase">Upload Photo</span></div>
                                                )}
                                                {field.type === 'color' && (
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-6 h-6 rounded-full border border-neutral-100 bg-neutral-50" />)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview Actions */}
                            <button 
                                type="button" 
                                onClick={() => setShowPreviewModal(true)}
                                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-neutral-950 text-neutral-950 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-950 hover:text-white transition-all shadow-lg"
                            >
                                <Eye size={16} /> Preview as Buyer
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {showPreviewModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-neutral-950/95 flex items-center justify-center p-6 lg:p-20"
                    >
                        <button onClick={() => setShowPreviewModal(false)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                        <div className="w-full h-full bg-[#FAF7F2] overflow-y-auto rounded-sm p-12 lg:p-24 shadow-2xl relative no-scrollbar">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col lg:flex-row gap-20">
                                    <div className="flex-1 aspect-square bg-white border border-neutral-100 flex items-center justify-center">
                                        {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={64} className="text-neutral-100" />}
                                    </div>
                                    <div className="flex-1 space-y-10">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink">{category}</span>
                                            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-neutral-950 mt-4 leading-none">{title || 'Product Title'}</h1>
                                        </div>
                                        <p className="text-lg text-neutral-500 font-light leading-relaxed">{allValues.description || 'Description goes here...'}</p>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-4xl font-bold text-neutral-950">₹{price.toLocaleString()}</span>
                                            {Number(comparePrice || 0) > 0 && <span className="text-xl text-neutral-300 line-through font-light italic">₹{Number(comparePrice).toLocaleString()}</span>}
                                        </div>
                                        <button disabled className="w-full py-6 bg-neutral-950 text-white text-[12px] font-black uppercase tracking-[0.5em] shadow-2xl opacity-50">Add to Vault</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CraftMakerLayout>
    );
};

// HELPER COMPONENTS
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8 border-b border-neutral-50 pb-4">{title}</h3>
        {children}
    </div>
);

const Field = ({ label, children, count, error }: { label: string, children: React.ReactNode, count?: string, error?: string | boolean }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-950">{label}</label>
            {count && <span className="text-[9px] text-neutral-400 font-bold uppercase">{count}</span>}
        </div>
        {children}
        {error && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">{error}</p>}
    </div>
);

interface SpecFieldCardProps {
    field: FieldArrayWithId<FormInputs, "specFields", "id">;
    index: number;
    remove: (index: number) => void;
    register: UseFormRegister<FormInputs>;
    watch: UseFormWatch<FormInputs>;
    setValue: UseFormSetValue<FormInputs>;
}

const SpecFieldCard = ({ field, index, remove, register }: SpecFieldCardProps) => {
    return (
        <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-6 relative group/card">
            <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
            </button>
            <div className="flex gap-6">
                <div className="pt-1 text-neutral-300 cursor-grab"><GripVertical size={16} /></div>
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Field #{index + 1}:</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-neutral-100 rounded-full text-[8px] font-black uppercase tracking-widest text-neutral-950 shadow-sm">
                            {field.type === 'text' && <Type size={10} />}
                            {field.type === 'dropdown' && <List size={10} />}
                            {field.type === 'image' && <Upload size={10} />}
                            {field.type === 'color' && <Palette size={10} />}
                            {field.type}
                        </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <Field label="Field Label">
                            <input {...register(`specFields.${index}.label`, { required: true })} className="w-full bg-white border border-neutral-100 p-3 outline-none focus:border-brand-pink text-xs font-bold transition-all" placeholder="e.g. Personalisation Text" />
                        </Field>
                        {field.type === 'text' && (
                            <Field label="Placeholder">
                                <input {...register(`specFields.${index}.placeholder`)} className="w-full bg-white border border-neutral-100 p-3 outline-none focus:border-brand-pink text-xs font-bold transition-all" placeholder="e.g. Your name here..." />
                            </Field>
                        )}
                    </div>

                    {field.type === 'dropdown' && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-950">Options</label>
                            <div className="space-y-2">
                                {/* Options simplified for mock */}
                                <button type="button" className="text-[9px] font-black uppercase tracking-widest text-brand-pink hover:underline">+ Add Option</button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-neutral-100">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" {...register(`specFields.${index}.required`)} className="w-4 h-4 rounded border-neutral-300 text-brand-pink focus:ring-brand-pink" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Required Field</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Upcharge:</span>
                            <div className="flex items-center gap-1 bg-white border border-neutral-100 px-3 py-1 rounded-sm">
                                <span className="text-[10px] font-bold text-neutral-300">₹</span>
                                <input type="number" {...register(`specFields.${index}.upcharge`)} className="w-16 bg-transparent outline-none text-xs font-bold" placeholder="0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingForm;
