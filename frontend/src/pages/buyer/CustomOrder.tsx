import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Check, Upload, Send, ArrowRight, ArrowLeft,
    Sparkles, Shield, Clock, Heart, Loader2, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export type FormInputs = {
    name: string;
    contact: string;
    occasion: string;
    artForms: string[];
    budget: string;
    description: string;
    files: FileList;
    address: string;
    neededBy: string;
};

export interface StoredInquiry extends Omit<FormInputs, 'files'> {
    id: string;
    date: string;
    fileName?: string;
    status: 'new' | 'contacted' | 'in-progress' | 'completed';
    confirmedPrice?: number | string;
    finalDeliveryDate?: string;
    finalNotes?: string;
    paymentStatus?: 'pending' | 'partially-paid' | 'paid';
    shippingInfo?: string;
}

const artFormOptions = [
    'Resin Mastery', 'Crochet Couture', 'Satin Florals', 'Pipe Cleaner Art',
    'Clay Sculpting', 'Canvas Paintings', 'Bespoke Bouquets', 'Curated Hampers'
];

const budgetOptions = [
    'Under ₹500', '₹500 – ₹1,000', '₹1,000 – ₹2,000', '₹2,000 – ₹5,000', 'Above ₹5,000'
];

const STEPS = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Vision'  },
    { num: 3, label: 'Details' },
];

const trust = [
    { icon: <Heart size={18} strokeWidth={1.5} />,   text: 'Made with personal care' },
    { icon: <Shield size={18} strokeWidth={1.5} />,  text: 'Secure & private' },
    { icon: <Clock size={18} strokeWidth={1.5} />,   text: 'Response within 24 hrs' },
    { icon: <Sparkles size={18} strokeWidth={1.5} />,text: 'Complimentary gift included' },
];

/* ─── Field wrapper ─── */
const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">{label}</label>
        {children}
        {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-medium">
                {error}
            </motion.p>
        )}
    </div>
);

const CustomOrder = () => {
    const { register, handleSubmit, formState: { errors }, reset, trigger } = useForm<FormInputs>();
    const [step, setStep]               = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError]   = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl]     = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { alert('Max 5 MB'); return; }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleNext = async () => {
        const fields: (keyof FormInputs)[][] = [
            ['name', 'contact'],
            ['occasion', 'budget'],
            ['address', 'neededBy'],
        ];
        const ok = await trigger(fields[step - 1]);
        if (ok) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };

    const onSubmit = async (data: FormInputs) => {
        if (step !== 3) return;
        setIsSubmitting(true);
        setSubmitError('');

        let uploadedImageUrl = null;
        if (selectedFile) {
            const ext      = selectedFile.name.split('.').pop();
            const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: upErr } = await supabase.storage.from('inquiry-images').upload(filePath, selectedFile);
            if (upErr) { setSubmitError('Image upload failed. Please try again.'); setIsSubmitting(false); return; }
            const { data: { publicUrl } } = supabase.storage.from('inquiry-images').getPublicUrl(filePath);
            uploadedImageUrl = publicUrl;
        }

        const { error } = await supabase.from('inquiries').insert([{
            name: data.name, contact: data.contact, occasion: data.occasion,
            art_forms: data.artForms, budget: data.budget, description: data.description,
            address: data.address, needed_by: data.neededBy,
            file_name: uploadedImageUrl, status: 'new',
        }]);

        if (error) { setSubmitError('Something went wrong. Please try again.'); }
        else       { setIsSubmitted(true); reset(); removeFile(); }
        setIsSubmitting(false);
    };

    /* ── Success screen ── */
    if (isSubmitted) return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 bg-transparent">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-12 md:p-16 border border-neutral-200 text-center max-w-lg w-full"
            >
                <div className="w-20 h-20 border border-neutral-200 flex items-center justify-center mx-auto mb-8 text-neutral-950">
                    <Check size={32} strokeWidth={1} />
                </div>
                <h2 className="text-4xl font-serif font-bold text-neutral-950 mb-4">Commission Received</h2>
                <p className="text-neutral-500 font-light mb-10 leading-relaxed">
                    Your request has been placed in our archives. An artisan will review your requirements and reach out via WhatsApp or phone shortly.
                </p>
                <button onClick={() => { setIsSubmitted(false); setStep(1); }} className="btn-primary w-full">
                    Submit Another Request
                </button>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex flex-col lg:flex-row overflow-x-hidden pt-20 md:pt-24">

            {/* ── Left editorial panel ── */}
            <div className="hidden lg:flex w-5/12 flex-col justify-center px-12 xl:px-20 py-12 border-r border-neutral-200 bg-transparent sticky top-0 h-screen">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                    <span className="inline-flex items-center gap-2 mb-12 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm text-xs font-bold tracking-widest uppercase">
                        <Sparkles size={13} className="text-brand-pink" /> Bespoke Commissions
                    </span>

                    <h1 className="text-6xl xl:text-7xl font-serif text-neutral-950 leading-[0.95] mb-8 tracking-tighter">
                        Bring your<br />
                        <span className="italic font-light text-neutral-400">vision</span><br />
                        to life.
                    </h1>

                    {/* Trust signals */}
                    <div className="space-y-4 border-t border-neutral-200 pt-10">
                        {trust.map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                                className="flex items-center gap-4 text-neutral-600">
                                <div className="flex-shrink-0 w-9 h-9 bg-brand-rose-100 border border-brand-rose-100 flex items-center justify-center shadow-sm text-brand-pink">
                                    {t.icon}
                                </div>
                                <span className="text-sm font-light">{t.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex flex-col px-4 sm:px-8 lg:px-16 xl:px-24 py-8 lg:py-16">

                {/* Mobile header */}
                <div className="lg:hidden mb-10">
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tighter mb-2">Commission a Piece</h1>
                    <p className="text-neutral-500 font-light">Tell us about your vision.</p>
                </div>

                {/* Step progress */}
                <div className="mb-10 max-w-lg">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-200 -translate-y-1/2 z-0" />
                        <div
                            className="absolute top-1/2 left-0 h-[2px] bg-brand-pink -translate-y-1/2 z-0 transition-all duration-700"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                        {STEPS.map(s => (
                            <div key={s.num} className="relative z-10 flex flex-col items-center">
                                <motion.div
                                    animate={{ backgroundColor: step >= s.num ? '#D4547A' : '#fff', color: step >= s.num ? '#fff' : '#a1a1aa', scale: step === s.num ? 1.15 : 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-10 h-10 rounded-full border-2 border-neutral-200 flex items-center justify-center font-bold text-sm shadow-sm"
                                >
                                    {step > s.num ? <Check size={16} strokeWidth={3} /> : s.num}
                                </motion.div>
                                <span className={`absolute -bottom-7 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap ${step === s.num ? 'text-neutral-950' : 'text-neutral-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form card */}
                <div className="bg-white border border-neutral-200 shadow-xl shadow-neutral-100 flex-1 max-w-2xl w-full">
                    <form onSubmit={e => { e.preventDefault(); if (step === 3) handleSubmit(onSubmit)(); }} className="h-full flex flex-col">
                        <div className="flex-1">

                            {/* Step 1 — Contact */}
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}
                                    className="p-6 sm:p-10 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-neutral-950 mb-1">Who are you?</h2>
                                        <p className="text-neutral-500 text-sm font-light">We'd love to know who we're creating for.</p>
                                    </div>
                                    <Field label="Full Name" error={errors.name && 'Name is required'}>
                                        <input {...register('name', { required: true })}
                                            className="w-full px-0 py-3 border-b border-neutral-300 bg-transparent focus:border-neutral-950 outline-none text-neutral-950 placeholder:text-neutral-300 font-medium transition-colors"
                                            placeholder="Your full name" />
                                    </Field>
                                    <Field label="Phone / WhatsApp" error={errors.contact && 'Contact is required'}>
                                        <input {...register('contact', { required: true })}
                                            className="w-full px-0 py-3 border-b border-neutral-300 bg-transparent focus:border-neutral-950 outline-none text-neutral-950 placeholder:text-neutral-300 font-medium transition-colors"
                                            placeholder="10-digit mobile number" />
                                    </Field>
                                </motion.div>
                            )}

                            {/* Step 2 — Vision */}
                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}
                                    className="p-6 sm:p-10 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-neutral-950 mb-1">What's the occasion?</h2>
                                        <p className="text-neutral-500 text-sm font-light">Help us tailor every detail to the moment.</p>
                                    </div>

                                    <Field label="Occasion" error={errors.occasion && 'Select an occasion'}>
                                        <div className="relative">
                                            <select {...register('occasion', { required: true })}
                                                className="w-full px-0 py-3 border-b border-neutral-300 bg-transparent focus:border-neutral-950 outline-none text-neutral-950 appearance-none cursor-pointer transition-colors">
                                                <option value="">Select an event</option>
                                                {['Birthday','Anniversary','Rakhi','Proposal','Farewell','Interior Decor','Other'].map(o => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </Field>

                                    <Field label="Art Disciplines (optional)">
                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            {artFormOptions.map(opt => (
                                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative w-4 h-4 border border-neutral-300 group-hover:border-neutral-950 transition-colors flex-shrink-0">
                                                        <input type="checkbox" value={opt} {...register('artForms')} className="peer sr-only" />
                                                        <div className="absolute inset-0.5 bg-neutral-950 scale-0 peer-checked:scale-100 transition-transform" />
                                                    </div>
                                                    <span className="text-sm font-light text-neutral-600 group-hover:text-neutral-950 transition-colors">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Field>

                                    <Field label="Investment Bracket" error={errors.budget && 'Please select a budget'}>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {budgetOptions.map(opt => (
                                                <label key={opt} className="cursor-pointer">
                                                    <input type="radio" value={opt} {...register('budget', { required: true })} className="peer sr-only" />
                                                    <div className="px-4 py-2 border border-neutral-200 text-neutral-500 text-sm font-light peer-checked:bg-neutral-950 peer-checked:text-white peer-checked:border-neutral-950 hover:border-neutral-400 transition-all">
                                                        {opt}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </Field>
                                </motion.div>
                            )}

                            {/* Step 3 — Details */}
                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}
                                    className="p-6 sm:p-10 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-neutral-950 mb-1">Final details</h2>
                                        <p className="text-neutral-500 text-sm font-light">Almost there — tell us where and when.</p>
                                    </div>

                                    <Field label="Delivery Address" error={errors.address && 'Address is required'}>
                                        <textarea {...register('address', { required: true })} rows={2}
                                            className="w-full px-0 py-3 border-b border-neutral-300 bg-transparent focus:border-neutral-950 outline-none text-neutral-950 placeholder:text-neutral-300 font-medium resize-none transition-colors"
                                            placeholder="Full delivery address" />
                                    </Field>

                                    <Field label="Needed By" error={errors.neededBy && 'Deadline is required'}>
                                        <input type="date" {...register('neededBy', { required: true })}
                                            className="w-full px-0 py-3 border-b border-neutral-300 bg-transparent focus:border-neutral-950 outline-none text-neutral-950 transition-colors" />
                                    </Field>

                                    <Field label="Detailed Specifications (optional)">
                                        <textarea {...register('description')} rows={3}
                                            className="w-full px-0 py-3 border-b border-neutral-300 bg-transparent focus:border-neutral-950 outline-none text-neutral-950 placeholder:text-neutral-300 font-light resize-none transition-colors"
                                            placeholder="Colors, sizes, references, any specific details..." />
                                    </Field>

                                    <Field label="Reference Image (optional)">
                                        {!selectedFile ? (
                                            <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-neutral-950 group-hover:scale-110 transition-all shadow-sm">
                                                    <Upload size={20} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-sm font-bold text-neutral-700">Click to upload</p>
                                                <p className="text-xs text-neutral-400">PNG, JPG up to 5 MB</p>
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        ) : (
                                            <div className="flex items-center gap-4 p-4 border border-neutral-200 bg-white">
                                                {previewUrl && <img loading="lazy" src={previewUrl} alt="Preview" className="w-16 h-16 object-cover flex-shrink-0" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-neutral-950 truncate">{selectedFile.name}</p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <button type="button" onClick={removeFile} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </Field>

                                    {submitError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 border border-red-100 text-sm">
                                            <Shield size={14} className="flex-shrink-0" /> {submitError}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer nav */}
                        <div className="px-8 sm:px-12 pb-10 pt-6 border-t border-neutral-100 flex items-center justify-between">
                            {step > 1 ? (
                                <button type="button" onClick={() => setStep(s => s - 1)}
                                    className="flex items-center gap-2 px-5 py-3 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 text-xs font-bold tracking-widest uppercase transition-all">
                                    <ArrowLeft size={14} /> Back
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button type="button" onClick={handleNext}
                                    className="ml-auto flex items-center gap-2 px-8 py-4 bg-neutral-950 text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-700 transition-all group">
                                    Continue <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting}
                                    className="ml-auto flex items-center gap-2 px-8 py-4 bg-neutral-950 text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all group">
                                    {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <>Submit Blueprint <Send size={14} /></>}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomOrder;
