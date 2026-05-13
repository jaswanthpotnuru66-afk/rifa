import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, Image as ImageIcon, Send,
    Store, Sparkles, ArrowLeft, Shield, Star, MapPin,
    Trash2, Camera, Loader2, Eye, EyeOff,
    AlertCircle, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import MagneticButton from '../components/MagneticButton';

export type CreatorApplicationInputs = {
    // Step 1: Essentials
    mobileNumber: string;
    fullName: string;
    email: string;
    password?: string;

    // Step 2: Artistry
    shopName: string;
    shopSlug: string;
    primaryCraftCategory: string;
    homeRegion: string;
    craftOriginStory: string;

    // Step 3: Operations & Visuals
    shippingOriginPinCode: string;
    processingTime: string;
    digitalProof: boolean;
    pickupAddress: string;
    city: string;
    state: string;

    // Step 4: KYC & Finance
    pan: string;
    accountHolder: string;
    bankAccount: string;
    ifsc: string;
    aadhaar: string;
    gstin?: string;
};

/** Full DB record used by Admin panel */
export type CreatorApplication = {
    id: string;
    date: string;
    creatorName: string;
    brandName: string;
    contact: string;
    email: string;
    location: string;
    collaborationType: 'sell-through-rifa' | 'merchandise-dashboard' | 'both';
    productCategories: string[];
    priceRange: string;
    productDescription: string;
    socialLink: string;
    imageUrl?: string;
    status: 'new' | 'reviewing' | 'approved' | 'rejected';
    dashboardStatus: 'not-started' | 'planning' | 'in-progress' | 'live';
    commissionTerms: string;
    adminNotes: string;
    shopBannerUrl: string;
    shopLogoUrl: string;
    // Add compatibility fields for new form data
    fullName?: string;
    mobileNumber?: string;
    shopName?: string;
    shopSlug?: string;
    primaryCraftCategory?: string;
    homeRegion?: string;
    craftOriginStory?: string;
    shippingOriginPinCode?: string;
    processingTime?: string;
    digitalProof?: boolean;
    pickupAddress?: string;
    city?: string;
    state?: string;
    pan?: string;
    accountHolder?: string;
    bankAccount?: string;
    ifsc?: string;
    aadhaar?: string;
    gstin?: string;
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
    } catch {
        // Ignore parsing errors
    }
    return {};
};

const Collaborate = () => {
    const navigate = useNavigate();
    const defaultDraft = loadDraft();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [agreements, setAgreements] = useState({
        commission: false,
        tcs: false,
        returns: false,
        shipping: false
    });

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
            fullName: defaultDraft.fullName || '',
            email: defaultDraft.email || '',
            shopName: defaultDraft.shopName || '',
            shopSlug: defaultDraft.shopSlug || '',
            primaryCraftCategory: defaultDraft.primaryCraftCategory || '',
            homeRegion: defaultDraft.homeRegion || '',
            craftOriginStory: defaultDraft.craftOriginStory || '',
            shippingOriginPinCode: defaultDraft.shippingOriginPinCode || '',
            processingTime: defaultDraft.processingTime || '7',
            digitalProof: defaultDraft.digitalProof || false,
            pickupAddress: defaultDraft.pickupAddress || '',
            city: defaultDraft.city || '',
            state: defaultDraft.state || '',
        },
    });

    const [assets, setAssets] = useState<Record<ShopAssetKey, File | null>>({ banner: null, logo: null });
    const [previews, setPreviews] = useState<Record<ShopAssetKey, string | null>>({ banner: null, logo: null });
    const [isSlugEdited, setIsSlugEdited] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [assetError, setAssetError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const shopName = watch('shopName');
    const primaryCraftCategory = watch('primaryCraftCategory');
    const homeRegion = watch('homeRegion');
    const craftOriginStory = watch('craftOriginStory') || '';
    const digitalProof = watch('digitalProof');
    const allFields = watch();

    const isAllAgreed = Object.values(agreements).every(v => v);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (Object.values(allFields).some(val => val !== '')) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allFields));
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [allFields]);

    const hasStartedTyping = step > 1 || shopName.length > 0 || primaryCraftCategory !== '' || homeRegion !== '' || craftOriginStory.length > 0 || previews.logo || previews.banner;

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
        const { data } = supabase.storage
            .from('creator-product-images')
            .getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof CreatorApplicationInputs)[] = [];
        if (step === 1) fieldsToValidate = ['mobileNumber', 'fullName', 'email', 'password'];
        else if (step === 2) fieldsToValidate = ['shopName', 'shopSlug', 'primaryCraftCategory', 'homeRegion', 'craftOriginStory'];
        else if (step === 3) fieldsToValidate = ['shippingOriginPinCode', 'processingTime', 'pickupAddress', 'city', 'state'];
        else if (step === 4) fieldsToValidate = ['pan', 'accountHolder', 'bankAccount', 'ifsc', 'aadhaar'];

        const isStepValid = await trigger(fieldsToValidate);
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
        if (step !== 5 || !isAllAgreed) return;
        setIsSubmitting(true);
        setSubmitError('');

        if (!assets.banner || !assets.logo) {
            setAssetError('Upload both a shop banner and a shop logo before submitting.');
            setStep(3);
            setIsSubmitting(false);
            return;
        }

        try {
            const [shopBannerUrl, shopLogoUrl] = await Promise.all([
                uploadShopAsset(assets.banner, 'banner'),
                uploadShopAsset(assets.logo, 'logo'),
            ]);

            const dbData = {
                creator_name: data.fullName,
                brand_name: data.shopName,
                contact: data.mobileNumber,
                email: data.email,
                location: data.homeRegion,
                collaboration_type: 'sell-through-rifa',
                product_categories: [data.primaryCraftCategory],
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
                processing_time: data.processingTime,
                digital_proof_enabled: data.digitalProof,
                pan_number: data.pan,
                account_holder: data.accountHolder,
                bank_account: data.bankAccount,
                ifsc_code: data.ifsc,
                aadhaar_number: data.aadhaar,
                gstin: data.gstin,
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

            // Redirect to pending after success
            setTimeout(() => {
                navigate('/craftmaker/pending');
            }, 3000);
        } catch (error: unknown) {
            console.error('Error submitting seller application:', error);
            const message = error instanceof Error ? error.message : 'Something went wrong submitting your profile. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] relative font-sans flex flex-col lg:flex-row overflow-x-hidden pt-20 md:pt-24 selection:bg-brand-pink/20 text-neutral-900">

            {/* Mobile Header (Hidden on LG) */}
            <div className="lg:hidden relative z-10 px-6 pt-10 pb-8">
                <span className="inline-block px-3 py-1 mb-5 text-[10px] font-bold tracking-[0.2em] text-brand-pink uppercase bg-white border border-neutral-200 shadow-sm">
                    Step 0{step} / 05
                </span>
                <h1 className="text-5xl font-serif font-bold mb-4 leading-tight tracking-tighter">Artisan Registry.</h1>
            </div>

            {/* Sidebar / Preview Section */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center relative z-10 px-6 lg:px-12 xl:px-20 py-8 lg:py-12 border-b lg:border-b-0 lg:border-r border-neutral-200 order-1 lg:order-1">
                <AnimatePresence mode="wait">
                    {!hasStartedTyping ? (
                        <motion.div
                            key="marketing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="hidden lg:flex flex-col justify-between h-full"
                        >
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 mb-16 px-4 py-2 rounded-none bg-neutral-950 text-white"
                                >
                                    <Sparkles className="text-brand-pink w-4 h-4" />
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Artisan Partner Program</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-7xl xl:text-9xl font-serif leading-[0.85] mb-8 tracking-tighter"
                                >
                                    Scale <br />
                                    your <br />
                                    <span className="italic text-neutral-400 font-light">vision.</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-xl text-neutral-500 max-w-md mb-16 leading-relaxed font-light"
                                >
                                    We provide the stage, you provide the craft. Join a hand-picked community of India's most dedicated creators.
                                </motion.p>

                                <div className="space-y-10">
                                    {[
                                        { icon: <Store className="w-5 h-5" />, title: 'Luxury Storefront', desc: 'A meticulously designed editorial space to showcase your masterpieces.' },
                                        { icon: <Shield className="w-5 h-5" />, title: 'Secured Payments', desc: 'Automated split payouts and escrow protection for every single transaction.' },
                                        { icon: <Sparkles className="w-5 h-5" />, title: 'Brand Storytelling', desc: 'We help you craft a narrative that connects with high-value buyers.' },
                                    ].map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.4 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex items-start gap-6 group"
                                        >
                                            <div className="flex-shrink-0 bg-white p-4 border border-neutral-100 group-hover:border-neutral-900 transition-all duration-500 shadow-sm mt-1">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-neutral-950 tracking-tight">{feature.title}</h3>
                                                <p className="text-neutral-500 text-sm font-light mt-1.5 leading-relaxed">{feature.desc}</p>
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
                                <div className="flex items-center gap-6 opacity-40">
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Trusted by India's finest artisans</span>
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
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-neutral-950 text-brand-pink text-[9px] font-bold tracking-[0.2em] uppercase border border-neutral-800 shadow-xl">
                                    <Sparkles size={14} className="animate-pulse" /> LIVE PREVIEW
                                </span>
                            </div>

                            <div className="bg-white overflow-hidden border border-neutral-200 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] transform hover:-translate-y-2 transition-transform duration-700">
                                <div className="h-48 bg-neutral-50 relative overflow-hidden group">
                                    {previews.banner ? (
                                        <img src={previews.banner} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Banner Preview" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-200">
                                            <ImageIcon size={32} strokeWidth={1} />
                                        </div>
                                    )}
                                </div>
                                <div className="px-10 pb-12 relative">
                                    <div className="w-24 h-24 bg-white border border-neutral-200 absolute -top-12 overflow-hidden shadow-xl flex items-center justify-center z-10">
                                        {previews.logo ? (
                                            <img src={previews.logo} className="w-full h-full object-cover" alt="Logo Preview" />
                                        ) : (
                                            <Store size={32} strokeWidth={1} className="text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="pt-20 text-center">
                                        <h3 className="text-4xl font-serif font-bold text-neutral-950 leading-tight">
                                            {shopName || <span className="text-neutral-200 italic">Un-named Studio</span>}
                                        </h3>
                                        <div className="h-[1px] w-8 bg-brand-pink mx-auto my-6" />
                                        <p className="text-neutral-400 font-bold text-[10px] flex items-center justify-center gap-2 tracking-[0.2em] uppercase">
                                            {primaryCraftCategory || <span className="text-neutral-200">Craft Type</span>}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mt-4 text-neutral-500 text-xs font-medium uppercase tracking-widest">
                                            <MapPin size={14} className="text-brand-pink" />
                                            {homeRegion ? `${homeRegion}, India` : 'Region, India'}
                                        </div>
                                        <div className="mt-10">
                                            <p className="text-neutral-600 text-sm leading-relaxed font-serif italic text-center opacity-80 px-4">
                                                "{craftOriginStory || 'Your story of craftsmanship will be showcased here in a premium editorial format.'}"
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
            <div className="flex-1 overflow-y-auto flex flex-col relative z-10 w-full lg:pt-10 lg:pb-16 px-4 sm:px-8 lg:px-16 xl:px-24 mb-8 order-2 lg:order-2">
                {isSubmitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex items-center justify-center"
                    >
                        <div className="bg-white p-12 md:p-16 shadow-2xl text-center max-w-lg w-full border border-neutral-100 relative">
                            <div className="w-24 h-24 bg-neutral-950 rounded-full flex items-center justify-center mx-auto mb-10 text-brand-pink border border-neutral-800 shadow-xl">
                                <Check size={48} strokeWidth={2} />
                            </div>
                            <h2 className="text-5xl font-serif font-bold text-neutral-950 mb-6 tracking-tighter">Welcome.</h2>
                            <p className="text-neutral-500 text-lg mb-12 leading-relaxed font-light">
                                Your application has been received. Redirecting to your status dashboard...
                            </p>
                            <MagneticButton className="w-full">
                                <button onClick={() => navigate('/craftmaker/pending')} className="w-full py-5 bg-neutral-950 text-white font-bold tracking-[0.2em] uppercase text-[10px] hover:bg-neutral-800 transition-all">
                                    Go to Dashboard
                                </button>
                            </MagneticButton>
                        </div>
                    </motion.div>
                ) : (
                    <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">

                        {/* Progress Indicator */}
                        <div className="mb-12 relative z-10">
                            <div className="flex items-center justify-between relative">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-200 -translate-y-1/2 z-0" />
                                <div
                                    className="absolute top-1/2 left-0 h-[1.5px] bg-brand-pink -translate-y-1/2 z-0 transition-all duration-1000 ease-[0.16,1,0.3,1]"
                                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                                />

                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            animate={{
                                                backgroundColor: step >= i ? '#0a0a0a' : '#ffffff',
                                                borderColor: step >= i ? '#0a0a0a' : '#e5e5e5',
                                                color: step >= i ? '#ffffff' : '#a3a3a3',
                                                scale: step === i ? 1.2 : 1
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-[10px] shadow-sm bg-white"
                                        >
                                            {step > i ? <Check size={16} strokeWidth={3} /> : `0${i}`}
                                        </motion.div>
                                        <span className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-widest ${step === i ? 'text-neutral-950' : 'text-neutral-300'}`}>
                                            {['Account', 'Artistry', 'Operations', 'KYC', 'Legal'][i - 1]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white shadow-[0_32px_64px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 p-6 sm:p-10 lg:p-12 flex-1 relative">
                            <form onSubmit={(e) => { e.preventDefault(); if (step === 5) handleSubmit(onSubmit)(); }} className="h-full flex flex-col">
                                <AnimatePresence mode="wait">

                                    {/* STEP 1: ACCOUNT */}
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 space-y-12">
                                            <div>
                                                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-3 tracking-tight">The Registry</h2>
                                                <p className="text-neutral-500 text-lg font-light leading-relaxed">Establish your personal credentials as an artisan curator.</p>
                                            </div>
                                            <div className="space-y-10">
                                                <Field label="Full Name" error={errors.fullName && 'Enter your full name as per PAN'}>
                                                    <input {...register('fullName', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="e.g. Aditi Sharma" />
                                                </Field>
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <Field label="Mobile Number" error={errors.mobileNumber && 'Invalid 10-digit number'}>
                                                        <input type="tel" {...register('mobileNumber', { required: true, pattern: /^[6-9]\d{9}$/ })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="9876543210" />
                                                    </Field>
                                                    <Field label="Email Address" error={errors.email && 'Enter a valid email'}>
                                                        <input type="email" {...register('email', { required: true, pattern: /^\S+@\S+$/i })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="aditi@example.com" />
                                                    </Field>
                                                </div>
                                                <Field label="Account Password" error={errors.password && 'Required for dashboard access'}>
                                                    <div className="relative">
                                                        <input type={showPassword ? "text" : "password"} {...register('password', { required: true, minLength: 8 })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="••••••••" />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400">
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </Field>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: ARTISTRY */}
                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 space-y-12">
                                            <div>
                                                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-3 tracking-tight">The Artistry</h2>
                                                <p className="text-neutral-500 text-lg font-light leading-relaxed">Define your studio brand and the heritage behind your craft.</p>
                                            </div>
                                            <div className="space-y-10">
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <Field label="Studio Name" error={errors.shopName && 'Required'}>
                                                        <input {...register('shopName', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="e.g. Heritage Weaves" />
                                                    </Field>
                                                    <Field label="Store Handle" error={errors.shopSlug && 'Lowercase and hyphens only'}>
                                                        <div className="flex border-b border-neutral-200 bg-transparent focus-within:border-neutral-950 transition-all">
                                                            <span className="py-4 text-neutral-300 font-medium text-lg shrink-0">rifa.in/</span>
                                                            <input {...register('shopSlug', { required: true, pattern: /^[a-z0-9-]+$/, onChange: () => setIsSlugEdited(true) })} className="flex-1 px-1 py-4 outline-none bg-transparent text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" />
                                                        </div>
                                                    </Field>
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <Field label="Discipline" error={errors.primaryCraftCategory && 'Required'}>
                                                        <select {...register('primaryCraftCategory', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 font-medium appearance-none cursor-pointer text-lg">
                                                            <option value="" disabled>Select Category</option>
                                                            {craftCategoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Origin State" error={errors.homeRegion && 'Required'}>
                                                        <select {...register('homeRegion', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 font-medium appearance-none cursor-pointer text-lg">
                                                            <option value="" disabled>Select Region</option>
                                                            {indianStateOptions.map((st) => <option key={st} value={st}>{st}</option>)}
                                                        </select>
                                                    </Field>
                                                </div>
                                                <Field label="The Origin Story" error={errors.craftOriginStory && 'Manifesto should be 100-500 characters'}>
                                                    <textarea {...register('craftOriginStory', { required: true, minLength: 100, maxLength: 500 })} rows={4} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium resize-none leading-relaxed text-lg" placeholder="Share the inspirations and techniques that define your process..." />
                                                    <div className="text-[9px] text-right mt-2 font-black tracking-widest text-neutral-300 uppercase">{craftOriginStory.length} / 500</div>
                                                </Field>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3: OPERATIONS & VISUALS */}
                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 space-y-12">
                                            <div>
                                                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-3 tracking-tight">The Logistics</h2>
                                                <p className="text-neutral-500 text-lg font-light leading-relaxed">Establish your studio visuals and operational configurations.</p>
                                            </div>
                                            <div className="space-y-10">
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <AssetUploader label="Boutique Banner" helper="1200x300px ideal" icon={ImageIcon} selectedFile={assets.banner} previewUrl={previews.banner} previewClassName="aspect-[3/1]" onChange={handleAssetChange('banner')} onRemove={() => removeAsset('banner')} />
                                                    <AssetUploader label="Studio Logo" helper="500x500px square" icon={Camera} selectedFile={assets.logo} previewUrl={previews.logo} previewClassName="aspect-square w-2/3 mx-auto" onChange={handleAssetChange('logo')} onRemove={() => removeAsset('logo')} />
                                                </div>

                                                {assetError && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-sm flex gap-3">
                                                        <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-red-700 font-bold uppercase tracking-tight">{assetError}</p>
                                                    </motion.div>
                                                )}
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <Field label="Origin PIN Code" error={errors.shippingOriginPinCode && '6-digit PIN required'}>
                                                        <input {...register('shippingOriginPinCode', { required: true, pattern: /^\d{6}$/ })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="560001" />
                                                    </Field>
                                                    <Field label="Processing SLA" error={errors.processingTime && 'Required'}>
                                                        <select {...register('processingTime', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 font-medium appearance-none cursor-pointer text-lg">
                                                            <option value="3">3 Days (Fast)</option>
                                                            <option value="7">7 Days (Standard)</option>
                                                            <option value="14">14 Days (Complex)</option>
                                                            <option value="21">21 Days (Bespoke)</option>
                                                        </select>
                                                    </Field>
                                                </div>
                                                <div className="p-6 bg-brand-pink/[0.03] border border-brand-pink/10 rounded-sm flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink"><Camera size={18} /></div>
                                                        <div>
                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Digital Proof Verification</h4>
                                                            <p className="text-[9px] text-neutral-400 font-bold uppercase mt-1">Recommended for bespoke masterpieces</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => setValue('digitalProof', !digitalProof)} className={`w-12 h-6 rounded-full transition-all relative ${digitalProof ? 'bg-brand-pink' : 'bg-neutral-200'}`}>
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${digitalProof ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                {digitalProof && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-teal-50 border border-teal-100 rounded-sm flex gap-3">
                                                        <Info size={16} className="text-teal-600 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-teal-700 font-medium italic">Buyers will see a proof approval step before manufacturing begins. This reduces disputes on custom masterpieces.</p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 4: KYC & FINANCE */}
                                    {step === 4 && (
                                        <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 space-y-12">
                                            <div>
                                                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-3 tracking-tight">Financials</h2>
                                                <p className="text-neutral-500 text-lg font-light leading-relaxed">Secure verification for automated payouts and tax compliance.</p>
                                            </div>
                                            <div className="space-y-10">
                                                <Field label="PAN Card Number" error={errors.pan && 'Invalid PAN format'}>
                                                    <input {...register('pan', { required: true, pattern: /^[A-Z]{5}\d{4}[A-Z]$/ })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-bold tracking-[0.2em] text-lg uppercase" placeholder="ABCDE1234F" />
                                                </Field>
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <Field label="Bank Account Holder" error={errors.accountHolder && 'Required'}>
                                                        <input {...register('accountHolder', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="As per passbook" />
                                                    </Field>
                                                    <Field label="IFSC Code" error={errors.ifsc && 'Invalid IFSC'}>
                                                        <input {...register('ifsc', { required: true, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/ })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-bold tracking-[0.2em] text-lg uppercase" placeholder="HDFC0001234" />
                                                    </Field>
                                                </div>
                                                <Field label="Bank Account Number" error={errors.bankAccount && 'Required'}>
                                                    <input type="password" {...register('bankAccount', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="••••••••••••" />
                                                </Field>
                                                <Field label="Aadhaar / Voter ID" error={errors.aadhaar && 'Required'}>
                                                    <input {...register('aadhaar', { required: true })} className="w-full px-0 py-4 border-b border-neutral-200 bg-transparent focus:border-neutral-950 transition-all outline-none text-neutral-950 placeholder:text-neutral-300 font-medium text-lg" placeholder="Masked on submission" />
                                                </Field>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 5: LEGAL */}
                                    {step === 5 && (
                                        <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 space-y-12">
                                            <div>
                                                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-3 tracking-tight">The Agreement</h2>
                                                <p className="text-neutral-500 text-lg font-light leading-relaxed">Final steps to activate your studio on the platform.</p>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { id: 'commission', text: 'I agree to platform commission: 5% per sale + ₹10 listing fee' },
                                                    { id: 'tcs', text: 'I understand 1% TCS will be deducted from payouts (GST Law)' },
                                                    { id: 'returns', text: 'Custom items are returnable only for manufacturing defects' },
                                                    { id: 'shipping', text: 'I will dispatch orders within 2 days of SLA completion' }
                                                ].map(item => (
                                                    <label key={item.id} className="flex items-start gap-4 p-5 border border-neutral-100 rounded-sm cursor-pointer hover:bg-neutral-50 transition-all group">
                                                        <input type="checkbox" checked={agreements[item.id as keyof typeof agreements]} onChange={() => setAgreements(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof agreements] }))} className="hidden" />
                                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all ${agreements[item.id as keyof typeof agreements] ? 'bg-neutral-950 border-neutral-950 text-white' : 'border-neutral-200 group-hover:border-neutral-300'}`}>
                                                            {agreements[item.id as keyof typeof agreements] && <Check size={14} strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-neutral-700 leading-relaxed uppercase tracking-widest">{item.text}</span>
                                                    </label>
                                                ))}
                                            </div>

                                            {submitError && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 border border-red-100 rounded-sm flex gap-3 mt-8">
                                                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-red-700 font-bold uppercase tracking-tight">{submitError}</p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Form Footer */}
                                <div className="mt-16 pt-10 border-t border-neutral-100 flex items-center justify-between">
                                    {step > 1 ? (
                                        <MagneticButton>
                                            <button type="button" onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-neutral-400 hover:text-neutral-950 transition-all uppercase tracking-[0.2em] text-[10px] font-bold">
                                                <ArrowLeft size={14} /> Back
                                            </button>
                                        </MagneticButton>
                                    ) : <div />}

                                    {step < 5 ? (
                                        <MagneticButton>
                                            <button type="button" onClick={handleNext} className="flex items-center gap-3 px-10 py-5 bg-neutral-950 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-800 transition-all shadow-xl">
                                                Continue <ArrowRight size={14} />
                                            </button>
                                        </MagneticButton>
                                    ) : (
                                        <MagneticButton>
                                            <button type="submit" disabled={isSubmitting || !isAllAgreed} className="flex items-center gap-3 px-10 py-5 bg-brand-pink text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-opacity-90 disabled:opacity-50">
                                                {isSubmitting ? (
                                                    <><Loader2 size={14} className="animate-spin" /> Processing</>
                                                ) : (
                                                    <>Complete Application <Send size={14} /></>
                                                )}
                                            </button>
                                        </MagneticButton>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface FieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const Field = ({ label, error, children }: FieldProps) => (
    <div className="space-y-4 group">
        <label className="text-[10px] font-bold text-neutral-400 group-focus-within:text-neutral-950 transition-colors tracking-[0.2em] uppercase">
            {label}
        </label>
        <div className="relative">
            {children}
        </div>
        {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-pink text-[9px] mt-2 font-bold tracking-widest uppercase italic">
                {error}
            </motion.p>
        )}
    </div>
);

interface AssetUploaderProps {
    label: string;
    helper: string;
    selectedFile: File | null;
    previewUrl: string | null;
    previewClassName: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    icon: React.ElementType;
}

const AssetUploader = ({ label, helper, selectedFile, previewUrl, previewClassName, onChange, onRemove, icon: Icon }: AssetUploaderProps) => (
    <div className="space-y-4 group">
        <label className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">{label}</label>
        {!selectedFile ? (
            <label className="relative flex flex-col items-center justify-center p-12 border border-dashed border-neutral-200 bg-[#FBFBFA] hover:bg-white hover:border-neutral-900 transition-all cursor-pointer group/upload">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-4 bg-white border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover/upload:text-neutral-950 group-hover/upload:scale-110 transition-all duration-500 shadow-sm">
                        <Icon size={24} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-bold text-neutral-950 uppercase tracking-[0.2em]">Upload</p>
                    <p className="text-[9px] text-neutral-400 mt-2 tracking-widest">{helper}</p>
                </div>
                <input type="file" accept="image/*" onChange={onChange} className="hidden" />
            </label>
        ) : (
            <div className="border border-neutral-100 bg-white p-3 shadow-sm group/file">
                <div className={`relative bg-neutral-50 overflow-hidden ${previewClassName}`}>
                    {previewUrl && <img src={previewUrl} alt="preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover/file:scale-105" />}
                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/file:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <button type="button" onClick={onRemove} className="px-6 py-3 bg-white text-[9px] font-bold text-neutral-950 uppercase tracking-[0.2em] hover:bg-neutral-50 transition-colors shadow-xl">
                            Replace
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-2">
                    <div className="min-w-0 pr-4">
                        <p className="text-[10px] font-bold text-neutral-950 truncate uppercase tracking-widest">{selectedFile.name}</p>
                    </div>
                    <button type="button" onClick={onRemove} className="text-neutral-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        )}
    </div>
);

export default Collaborate;
