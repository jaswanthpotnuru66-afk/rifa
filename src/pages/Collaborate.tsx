import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Check, Image as ImageIcon, Phone, Send,
    Store, Sparkles, ArrowLeft, Shield, Star, MapPin, 
    Shapes, AlignLeft, Trash2, Camera, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export type CollaborationType = 'sell-through-rifa' | 'merchandise-dashboard' | 'both';
export type CreatorStatus = 'new' | 'reviewing' | 'approved' | 'rejected';
export type DashboardStatus = 'not-started' | 'planning' | 'in-progress' | 'live';

export type CreatorApplicationInputs = {
    mobileNumber: string;
    shopName: string;
    shopSlug: string;
    primaryCraftCategory: string;
    homeRegion: string;
    craftOriginStory: string;
    shippingOriginPinCode: string;
};

const craftCategoryOptions = [
    'Wood', 'Pottery', 'Leather', 'Textiles', 'Resin Art', 'Crochet',
    'Clay Art', 'Canvas Art', 'Jewellery', 'Home Decor', 'Paper Craft',
    'Metal Craft', 'Glass Craft',
];

const indianStateOptions = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const slugifyShopName = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

const getVerifiedMobile = () => {
    if (typeof window === 'undefined') return '';
    return (
        localStorage.getItem('rifa_verified_mobile') ||
        localStorage.getItem('rifa_seller_mobile') ||
        ''
    );
};

type ShopAssetKey = 'banner' | 'logo';

const LOCAL_STORAGE_KEY = 'rifa_collaborate_draft';
const loadDraft = (): Partial<CreatorApplicationInputs> => {
    try {
        if (typeof window !== 'undefined') {
            const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (draft) return JSON.parse(draft);
        }
    } catch (e) {}
    return {};
};

const Collaborate = () => {
    const defaultDraft = loadDraft();
    const [step, setStep] = useState(1);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        trigger
    } = useForm<CreatorApplicationInputs>({
        defaultValues: {
            mobileNumber: defaultDraft.mobileNumber || getVerifiedMobile(),
            shopName: defaultDraft.shopName || '',
            shopSlug: defaultDraft.shopSlug || '',
            primaryCraftCategory: defaultDraft.primaryCraftCategory || '',
            homeRegion: defaultDraft.homeRegion || '',
            craftOriginStory: defaultDraft.craftOriginStory || '',
            shippingOriginPinCode: defaultDraft.shippingOriginPinCode || '',
        },
    });

    const [assets, setAssets] = useState<Record<ShopAssetKey, File | null>>({ banner: null, logo: null });
    const [previews, setPreviews] = useState<Record<ShopAssetKey, string | null>>({ banner: null, logo: null });
    const [assetError, setAssetError] = useState('');
    const [isSlugEdited, setIsSlugEdited] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const shopName = watch('shopName');
    const primaryCraftCategory = watch('primaryCraftCategory');
    const homeRegion = watch('homeRegion');
    const craftOriginStory = watch('craftOriginStory') || '';
    const allFields = watch();

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (Object.values(allFields).some(val => val !== '')) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allFields));
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [allFields]);

    const hasStartedTyping = shopName.length > 0 || primaryCraftCategory !== '' || homeRegion !== '' || craftOriginStory.length > 0 || previews.logo || previews.banner;

    React.useEffect(() => {
        if (!isSlugEdited && shopName) {
            setValue('shopSlug', slugifyShopName(shopName), { shouldValidate: true });
        }
    }, [isSlugEdited, setValue, shopName]);

    const handleAssetChange = (key: ShopAssetKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }
        if (previews[key]) URL.revokeObjectURL(previews[key] as string);
        setAssetError('');
        setAssets((prev) => ({ ...prev, [key]: file }));
        setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    };

    const removeAsset = (key: ShopAssetKey) => {
        if (previews[key]) URL.revokeObjectURL(previews[key] as string);
        setAssets((prev) => ({ ...prev, [key]: null }));
        setPreviews((prev) => ({ ...prev, [key]: null }));
    };

    const clearAssets = () => {
        Object.values(previews).forEach((previewUrl) => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        });
        setAssets({ banner: null, logo: null });
        setPreviews({ banner: null, logo: null });
        setAssetError('');
    };

    const uploadShopAsset = async (file: File, folder: ShopAssetKey) => {
        const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const fileName = `shop-${folder}s/${Date.now()}-${safeBaseName}`;
        const { error: uploadError } = await supabase.storage
            .from('creator-product-images')
            .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
            .from('creator-product-images')
            .getPublicUrl(fileName);
        return publicUrl;
    };

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['mobileNumber', 'shopName', 'shopSlug'];
        else if (step === 2) fieldsToValidate = ['primaryCraftCategory', 'homeRegion', 'craftOriginStory'];

        const isStepValid = await trigger(fieldsToValidate as any);
        if (isStepValid) {
            setStep((s) => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep((s) => s - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmit = async (data: CreatorApplicationInputs) => {
        if (step !== 3) return;
        setIsSubmitting(true);
        setSubmitError('');

        if (!assets.banner || !assets.logo) {
            setAssetError('Upload both a shop banner and a shop logo before submitting.');
            setIsSubmitting(false);
            return;
        }

        try {
            const [shopBannerUrl, shopLogoUrl] = await Promise.all([
                uploadShopAsset(assets.banner, 'banner'),
                uploadShopAsset(assets.logo, 'logo'),
            ]);

            const dbData = {
                creator_name: data.shopName,
                brand_name: data.shopName,
                contact: data.mobileNumber,
                email: null,
                location: data.homeRegion,
                collaboration_type: 'sell-through-rifa',
                product_categories: [data.primaryCraftCategory],
                price_range: null,
                product_description: data.craftOriginStory,
                social_link: `rifa.in/${data.shopSlug}`,
                image_url: shopLogoUrl || shopBannerUrl,
                mobile_number: data.mobileNumber,
                shop_name: data.shopName,
                shop_slug: data.shopSlug,
                primary_craft_category: data.primaryCraftCategory,
                home_region: data.homeRegion,
                craft_origin_story: data.craftOriginStory,
                shop_banner_url: shopBannerUrl,
                shop_logo_url: shopLogoUrl,
                shipping_origin_pin_code: data.shippingOriginPinCode,
                status: 'new',
                dashboard_status: 'not-started',
            };

            const { error } = await supabase.from('creator_applications').insert([dbData]);
            if (error) throw error;

            reset();
            clearAssets();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setIsSlugEdited(false);
            setIsSubmitted(true);
        } catch (error: any) {
            console.error('Error submitting seller application:', error);
            setSubmitError(error?.message || 'Something went wrong submitting your profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent relative font-sans flex flex-col lg:flex-row overflow-x-hidden pt-20 md:pt-24 selection:bg-brand-gold/20 selection:text-brand-text text-brand-text">
            {/* Grain Texture Overlay handled globally by App.tsx */}

            {/* Mobile Header */}
            <div className="lg:hidden relative z-10 px-6 pt-10 pb-12 border-b border-neutral-200 bg-transparent">
                <span className="inline-block px-3 py-1 mb-5 text-xs font-bold tracking-widest text-brand-text uppercase bg-white rounded-full border border-neutral-200 shadow-sm">
                    Partner Program
                </span>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 leading-tight text-brand-text tracking-tighter">Apply to Sell<br/>on Rifa</h1>
                <p className="text-neutral-600 text-base sm:text-lg opacity-90 max-w-sm">Join the curated collective of India's finest artisans.</p>
            </div>

            {/* Left Side (Desktop) */}
            <div className="hidden lg:flex w-5/12 flex-col justify-center relative z-10 px-12 xl:px-20 py-12 xl:py-16 border-r border-neutral-200/80 bg-transparent">
                <AnimatePresence mode="wait">
                    {!hasStartedTyping ? (
                        <motion.div
                            key="marketing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col justify-between h-full"
                        >
                            <div>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 mb-16 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm"
                                >
                                    <Sparkles className="text-brand-text w-4 h-4" />
                                    <span className="text-xs font-bold tracking-widest text-brand-text uppercase">Premium Artisan Collective</span>
                                </motion.div>
                                
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-6xl xl:text-8xl font-serif text-brand-text leading-[0.95] mb-8 tracking-tighter"
                                >
                                    Elevate <br className="hidden xl:block"/>
                                    your <br className="hidden xl:block"/>
                                    <span className="italic text-brand-gold font-light">craft.</span>
                                </motion.h1>
                                
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-lg xl:text-xl text-neutral-600 max-w-md mb-16 leading-relaxed font-light"
                                >
                                    Join India's most exclusive marketplace for handmade luxury. Reach global buyers who truly value your authentic artistry.
                                </motion.p>

                                <div className="space-y-6">
                                    {[
                                        { icon: <Store className="w-5 h-5 text-brand-text" />, title: 'Bespoke Storefront', desc: 'A meticulously designed space to showcase your masterpieces.' },
                                        { icon: <Shield className="w-5 h-5 text-brand-text" />, title: 'Curated Audience', desc: 'Connect directly with buyers seeking true craftsmanship.' },
                                        { icon: <Sparkles className="w-5 h-5 text-brand-text" />, title: 'Seamless Experience', desc: 'We handle the technology, you focus on creating.' },
                                    ].map((feature, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.4 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex items-start gap-6 group"
                                        >
                                            <div className="flex-shrink-0 bg-white p-4 rounded-full border border-neutral-200 group-hover:scale-110 group-hover:border-neutral-400 transition-all duration-500 shadow-sm mt-1">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-brand-text tracking-tight">{feature.title}</h3>
                                                <p className="text-neutral-500 text-base font-light mt-1.5 leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="mt-20 pt-10 border-t border-neutral-200"
                            >
                                <div className="flex items-center gap-6">
                                    <div>
                                        <div className="flex items-center gap-1 text-brand-text mb-1">
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                        <span className="text-neutral-600 font-medium text-sm tracking-wide uppercase">Trusted by 500+ Top Artisans</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="live-preview"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                            className="w-full max-w-md mx-auto"
                        >
                            <div className="mb-10 text-center">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-brand-text text-xs font-bold tracking-widest uppercase border border-neutral-200 shadow-sm animate-pulse">
                                    <Sparkles size={14} /> Live Storefront Preview
                                </span>
                            </div>
                            
                            {/* Stark Editorial Store Card Preview */}
                            <div className="bg-white overflow-hidden border border-neutral-200 shadow-2xl shadow-neutral-200/50 transform hover:-translate-y-2 transition-transform duration-500">
                                {/* Banner */}
                                <div className="h-40 bg-neutral-100 relative overflow-hidden group">
                                    {previews.banner ? (
                                        <img src={previews.banner} className="w-full h-full object-cover grayscale-[20%]" alt="Banner Preview" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>
                                {/* Avatar & Content */}
                                <div className="px-10 pb-10 relative">
                                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white absolute -top-12 overflow-hidden shadow-lg flex items-center justify-center z-10">
                                        {previews.logo ? (
                                            <img src={previews.logo} className="w-full h-full object-cover" alt="Logo Preview" />
                                        ) : (
                                            <Store size={32} className="text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="pt-16 text-center">
                                        <h3 className="text-3xl font-serif font-bold text-brand-text leading-tight">
                                            {shopName || <span className="text-neutral-300 italic">Your Shop Name</span>}
                                        </h3>
                                        <p className="text-neutral-500 font-bold text-xs mt-3 flex items-center justify-center gap-2 tracking-widest uppercase">
                                            {primaryCraftCategory || <span className="text-neutral-300">Craft Category</span>}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mt-5 text-neutral-500 text-sm">
                                            <MapPin size={16} className="text-neutral-400" /> 
                                            {homeRegion ? `${homeRegion}, India` : 'Your Region, India'}
                                        </div>
                                        <div className="mt-8 relative">
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-neutral-200" />
                                            <p className="text-neutral-600 text-sm leading-relaxed font-serif italic text-center">
                                                "{craftOriginStory || 'Your unique craft origin story will appear here. Tell buyers what makes your handmade process special and authentic.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex-1 overflow-y-auto flex flex-col relative z-10 w-full lg:pt-16 lg:pb-24 px-4 sm:px-8 lg:px-16 xl:px-24 mb-16">
                {isSubmitted ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex items-center justify-center"
                    >
                        <div className="bg-white p-12 md:p-16 shadow-xl text-center max-w-lg w-full border border-neutral-200 relative overflow-hidden">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 text-green-500 border border-green-100 shadow-inner">
                                <Check size={48} strokeWidth={2} />
                            </div>
                            <h2 className="text-4xl font-serif font-bold text-brand-text mb-6">Application Received</h2>
                            <p className="text-neutral-500 text-lg mb-12 leading-relaxed font-light">
                                Thank you for choosing Rifa. Our curation team will review your profile and reach out to you shortly.
                            </p>
                            <button onClick={() => setIsSubmitted(false)} className="w-full py-4 rounded-xl bg-brand-text text-white font-bold tracking-wide uppercase text-sm hover:bg-neutral-800 transition-all hover:-translate-y-1">
                                Submit Another Profile
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
                        
                        {/* Progress Indicator */}
                        <div className="mb-14 relative z-10">
                            <div className="flex items-center justify-between relative">
                                {/* Track Background */}
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-300 -translate-y-1/2 z-0" />
                                {/* Track Fill */}
                                <div 
                                    className="absolute top-1/2 left-0 h-[2px] bg-brand-text -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
                                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                                />
                                
                                {/* Steps */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center">
                                        <motion.div 
                                            animate={{
                                                backgroundColor: step >= i ? '#0a0a0a' : '#ffffff',
                                                borderColor: step >= i ? '#0a0a0a' : '#d4d4d8',
                                                color: step >= i ? '#ffffff' : '#a1a1aa',
                                                scale: step === i ? 1.15 : 1
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm sm:text-base shadow-sm transition-shadow bg-white"
                                        >
                                            {step > i ? <Check size={20} strokeWidth={3} /> : i}
                                        </motion.div>
                                        <span className={`absolute -bottom-8 whitespace-nowrap text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${
                                            step === i ? 'text-brand-text' : step > i ? 'text-neutral-500' : 'text-neutral-400'
                                        }`}>
                                            {i === 1 ? 'Shop Info' : i === 2 ? 'Craft' : 'Assets'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white shadow-2xl shadow-neutral-200 border border-neutral-200 p-8 sm:p-12 lg:p-14 flex-1 relative overflow-hidden">
                            <form onSubmit={(e) => { e.preventDefault(); if(step===3) handleSubmit(onSubmit)(); }} className="h-full flex flex-col">
                                <AnimatePresence mode="wait">
                                    
                                    {/* STEP 1 */}
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="flex-1 space-y-10"
                                        >
                                            <div>
                                                <h2 className="text-3xl font-serif font-bold text-brand-text mb-3">Let's start with the basics</h2>
                                                <p className="text-neutral-500 text-lg font-light">Tell us about your brand and how we can reach you.</p>
                                            </div>

                                            <div className="space-y-8">
                                                <Field label="Mobile Number" icon={<Phone size={18} />} error={errors.mobileNumber && 'Enter a valid 10-digit mobile number'}>
                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        {...register('mobileNumber', { required: true, pattern: /^[6-9]\d{9}$/ })}
                                                        className="w-full px-5 py-4 border-b border-neutral-300 bg-transparent focus:border-brand-pink transition-all outline-none text-neutral-950 placeholder:text-neutral-400 font-medium"
                                                        placeholder="9876543210"
                                                    />
                                                </Field>

                                                <Field label="Shop Name" icon={<Store size={18} />} error={errors.shopName && 'Shop name is required'}>
                                                    <input
                                                        {...register('shopName', { required: true })}
                                                        className="w-full px-5 py-4 border-b border-neutral-300 bg-transparent focus:border-brand-pink transition-all outline-none text-neutral-950 placeholder:text-neutral-400 font-medium"
                                                        placeholder="e.g. Rajesh Woodworks"
                                                    />
                                                </Field>

                                                <Field label="Shop URL Slug" icon={<AlignLeft size={18} />} error={errors.shopSlug && 'Use lowercase letters, numbers, and hyphens only'}>
                                                    <div className="flex border-b border-neutral-300 bg-transparent focus-within:border-brand-pink transition-all overflow-hidden group/slug">
                                                        <span className="px-5 py-4 text-neutral-400 bg-transparent select-none font-medium group-focus-within/slug:text-neutral-950 transition-colors">rifa.in/</span>
                                                        <input
                                                            {...register('shopSlug', {
                                                                required: true,
                                                                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                                                onChange: () => setIsSlugEdited(true),
                                                            })}
                                                            className="flex-1 px-5 py-4 outline-none bg-transparent text-brand-text placeholder:text-neutral-400 font-medium"
                                                            placeholder="rajesh-woodworks"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-neutral-400 mt-2 ml-1">This will be your unique store link.</p>
                                                </Field>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2 */}
                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="flex-1 space-y-10"
                                        >
                                            <div>
                                                <h2 className="text-3xl font-serif font-bold text-brand-text mb-3">Define your craft</h2>
                                                <p className="text-neutral-500 text-lg font-light">Help buyers understand the origin and beauty of your work.</p>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="grid sm:grid-cols-2 gap-8">
                                                    <Field label="Primary Category" icon={<Shapes size={18} />} error={errors.primaryCraftCategory && 'Select a craft category'}>
                                                        <div className="relative">
                                                            <select {...register('primaryCraftCategory', { required: true })} className="w-full px-5 py-4 border-b border-neutral-300 bg-transparent focus:border-brand-pink transition-all outline-none text-neutral-950 font-medium appearance-none cursor-pointer">
                                                                <option value="" disabled>Select category</option>
                                                                {craftCategoryOptions.map((category) => (
                                                                    <option key={category} value={category}>{category}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                            </div>
                                                        </div>
                                                    </Field>

                                                    <Field label="Home Region" icon={<MapPin size={18} />} error={errors.homeRegion && 'Select your state or region'}>
                                                        <div className="relative">
                                                            <select {...register('homeRegion', { required: true })} className="w-full px-5 py-4 border-b border-neutral-300 bg-transparent focus:border-brand-pink transition-all outline-none text-neutral-950 font-medium appearance-none cursor-pointer">
                                                                <option value="" disabled>Select state / region</option>
                                                                {indianStateOptions.map((state) => (
                                                                    <option key={state} value={state}>{state}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                            </div>
                                                        </div>
                                                    </Field>
                                                </div>

                                                <Field label="Craft Origin Story" icon={<AlignLeft size={18} />} error={errors.craftOriginStory && 'Bio should be 150-200 characters'}>
                                                    <textarea
                                                        {...register('craftOriginStory', { required: true, minLength: 150, maxLength: 200 })}
                                                        rows={5}
                                                        className="w-full px-5 py-4 border-b border-neutral-300 bg-transparent focus:border-brand-pink transition-all outline-none text-neutral-950 placeholder:text-neutral-400 font-medium resize-none leading-relaxed"
                                                        placeholder="Share the heritage, techniques, and inspiration behind your creations..."
                                                    />
                                                    <div className={`text-xs text-right mt-2 font-bold tracking-wider uppercase ${craftOriginStory.length >= 150 && craftOriginStory.length <= 200 ? 'text-green-600' : 'text-neutral-400'}`}>
                                                        {craftOriginStory.length} / 200 characters
                                                    </div>
                                                </Field>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3 */}
                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="flex-1 space-y-10"
                                        >
                                            <div>
                                                <h2 className="text-3xl font-serif font-bold text-brand-text mb-3">Final touches</h2>
                                                <p className="text-neutral-500 text-lg font-light">Upload your shop visuals and specify shipping details.</p>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="grid sm:grid-cols-2 gap-8">
                                                    <AssetUploader
                                                        label="Shop Banner"
                                                        helper="1200x300px ideal"
                                                        icon={ImageIcon}
                                                        selectedFile={assets.banner}
                                                        previewUrl={previews.banner}
                                                        previewClassName="aspect-[3/1]"
                                                        onChange={handleAssetChange('banner')}
                                                        onRemove={() => removeAsset('banner')}
                                                    />
                                                    <AssetUploader
                                                        label="Shop Logo"
                                                        helper="Square 500x500px"
                                                        icon={Camera}
                                                        selectedFile={assets.logo}
                                                        previewUrl={previews.logo}
                                                        previewClassName="aspect-square w-3/4 mx-auto"
                                                        onChange={handleAssetChange('logo')}
                                                        onRemove={() => removeAsset('logo')}
                                                    />
                                                </div>
                                                {assetError && (
                                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100">
                                                        {assetError}
                                                    </motion.p>
                                                )}

                                                <Field label="Shipping Origin PIN Code" icon={<MapPin size={18} />} error={errors.shippingOriginPinCode && 'Enter a strict 6-digit PIN code'}>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                        {...register('shippingOriginPinCode', { required: true, pattern: /^\d{6}$/ })}
                                                        className="w-full md:w-1/2 px-5 py-4 border-b border-neutral-300 bg-transparent focus:border-brand-pink transition-all outline-none text-neutral-950 placeholder:text-neutral-400 font-medium tracking-widest"
                                                        placeholder="e.g. 560001"
                                                    />
                                                </Field>

                                                {submitError && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 px-5 py-4 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-3">
                                                        <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                                                        <p>{submitError}</p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Form Footer / Actions */}
                                <div className="mt-14 pt-8 border-t border-neutral-200 flex items-center justify-between">
                                    {step > 1 ? (
                                        <button 
                                            type="button" 
                                            onClick={handleBack} 
                                            className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 hover:text-brand-text transition-all active:scale-95 uppercase tracking-widest text-xs"
                                        >
                                            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                    
                                    {step < 3 ? (
                                        <button 
                                            type="button" 
                                            onClick={handleNext} 
                                            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-brand-text text-white font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all hover:-translate-y-0.5 active:scale-95 ml-auto"
                                        >
                                            Continue <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting} 
                                            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-brand-gold text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-brand-gold/30 hover:bg-brand-gold/90 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed ml-auto relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-12 group-hover:animate-shine" />
                                            {isSubmitting ? (
                                                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                            ) : (
                                                <>Complete Profile <Send size={16} /></>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shine {
                    100% { left: 200%; }
                }
                .animate-shine {
                    animation: shine 1.5s ease-in-out infinite;
                }
            `}} />
        </div>
    );
};

const Field = ({ label, error, children, icon }: any) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-brand-text flex items-center gap-2 tracking-widest uppercase">
            {icon && <span className="text-neutral-400 group-focus-within:text-brand-text transition-colors">{icon}</span>}
            {label}
        </label>
        <div className="relative">
            {children}
        </div>
        {error && (
            <motion.p initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-red-500 text-xs mt-1.5 font-bold tracking-wide ml-1">
                {error}
            </motion.p>
        )}
    </div>
);

const AssetUploader = ({ label, helper, selectedFile, previewUrl, previewClassName, onChange, onRemove, icon: Icon }: any) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-brand-text flex items-center gap-2 tracking-widest uppercase">{label}</label>
        {!selectedFile ? (
            <label className="relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400 transition-all cursor-pointer overflow-hidden group-hover:border-neutral-300">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 mb-4 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-brand-text group-hover:scale-110 transition-all duration-300">
                        <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-bold text-brand-text mb-1">Click to upload</p>
                    <p className="text-xs text-neutral-500 font-medium">{helper}</p>
                </div>
                <input type="file" accept="image/*" onChange={onChange} className="hidden" />
            </label>
        ) : (
            <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm group/file">
                <div className={`relative bg-neutral-100 rounded-lg overflow-hidden border border-neutral-100 ${previewClassName}`}>
                    {previewUrl && <img src={previewUrl} alt="preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/file:scale-105" />}
                    <div className="absolute inset-0 bg-brand-text/60 opacity-0 group-hover/file:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <button type="button" onClick={onRemove} className="px-5 py-2.5 bg-white rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors shadow-lg transform translate-y-4 group-hover/file:translate-y-0 duration-300 ease-out uppercase tracking-widest text-xs">
                            Replace
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-2 pb-1">
                    <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-brand-text truncate">{selectedFile.name}</p>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={onRemove} className="text-neutral-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        )}
    </div>
);

export default Collaborate;

