import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Check, Upload, Send, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

// Interface for stored inquiry (files handling might differ)
export interface StoredInquiry extends Omit<FormInputs, 'files'> {
    id: string;
    date: string;
    fileName?: string;
    status: 'new' | 'contacted' | 'in-progress' | 'completed';
    confirmedPrice?: string;
    finalDeliveryDate?: string;
    finalNotes?: string;
    paymentStatus?: 'pending' | 'partially-paid' | 'paid';
    shippingInfo?: string;
}

const artFormOptions = [
    'Resin Art', 'Crochet Creations', 'Satin Ribbon Flowers', 'Pipe Cleaner Art',
    'Clay Art', 'Canvas Paintings', 'Handmade Bouquets', 'Gift Hampers'
];

const budgetOptions = [
    'Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', '₹2000 - ₹5000', 'Above ₹5000'
];

const CustomOrder = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // File State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("File size should be less than 5MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const onSubmit = async (data: FormInputs) => {
        setIsSubmitting(true);
        setSubmitError('');

        let uploadedImageUrl = null;

        // 1. Upload Image if exists
        if (selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('inquiry-images')
                .upload(filePath, selectedFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                setSubmitError('Failed to upload image. Please try again.');
                setIsSubmitting(false);
                return;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('inquiry-images')
                .getPublicUrl(filePath);

            uploadedImageUrl = publicUrl;
        }

        // 2. Save Data to DB
        const dbData = {
            name: data.name,
            contact: data.contact,
            occasion: data.occasion,
            art_forms: data.artForms,
            budget: data.budget,
            description: data.description,
            address: data.address,
            needed_by: data.neededBy,
            file_name: uploadedImageUrl,
            status: 'new'
        };

        const { error } = await supabase
            .from('inquiries')
            .insert([dbData]);

        if (error) {
            console.error('Error submitting inquiry:', error);
            setSubmitError('Something went wrong saving your inquiry. Please try again.');
        } else {
            console.log("Saved inquiry to DB");
            setIsSubmitted(true);
            reset();
            removeFile();
        }
        setIsSubmitting(false);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-brand-cream">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center max-w-lg w-full border border-green-100"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <Check size={40} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Request Received!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for sharing your idea. We will review your requirements and personally connect with you via WhatsApp/Phone to finalize the details and pricing.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="btn-primary w-full"
                    >
                        Submit Another Request
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-brand-cream px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-4">Customize Your Order</h1>
                <p className="text-lg text-gray-600">
                    Don’t see what you’re looking for? That’s normal. <br />
                    If you can imagine it, we can create it.
                </p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-rose-100"
            >
                <div className="bg-brand-rose-50 p-6 border-b border-brand-rose-100">
                    <h3 className="font-serif font-semibold text-xl flex items-center gap-2">
                        <Sparkles className="text-brand-pink" size={20} />
                        Tell us about your gift
                    </h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">

                    {/* Name & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Your Name</label>
                            <input
                                {...register('name', { required: true })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                                placeholder="Ex. Vindhya Sree"
                            />
                            {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone / WhatsApp</label>
                            <input
                                {...register('contact', { required: true })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                                placeholder="Ex. 9876543210"
                            />
                            {errors.contact && <span className="text-red-500 text-xs">Contact is required</span>}
                        </div>
                    </div>

                    {/* Occasion & Delivery Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Occasion</label>
                            <select
                                {...register('occasion', { required: true })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition-all bg-white"
                            >
                                <option value="">Select Occasion</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Anniversary">Anniversary</option>
                                <option value="Rakhi">Rakhi</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Farewell">Farewell</option>
                                <option value="Home Decor">Home Decor</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.occasion && <span className="text-red-500 text-xs">Occasion is required</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Needed By (Date)</label>
                            <input
                                type="date"
                                {...register('neededBy', { required: true })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                            />
                            {errors.neededBy && <span className="text-red-500 text-xs">Date is required</span>}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                        <textarea
                            {...register('address', { required: true })}
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                            placeholder="Full address with pincode..."
                        />
                        {errors.address && <span className="text-red-500 text-xs">Address is required</span>}
                    </div>

                    {/* Art Forms (Checkboxes) */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Preferred Art Forms (Select multiple)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {artFormOptions.map((option) => (
                                <label key={option} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-brand-rose-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        {...register('artForms')}
                                        className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink border-gray-300"
                                    />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Budget Range</label>
                        <div className="flex flex-wrap gap-3">
                            {budgetOptions.map((option) => (
                                <label key={option} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        value={option}
                                        {...register('budget', { required: true })}
                                        className="peer sr-only"
                                    />
                                    <div className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 peer-checked:bg-brand-pink peer-checked:text-white peer-checked:border-brand-pink transition-all text-sm font-medium">
                                        {option}
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.budget && <span className="text-red-500 text-xs">Please select a budget</span>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Describe Your Idea</label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                            placeholder="Tell us about the colors, theme, or any specific elements you want..."
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reference Image (Optional)</label>
                        {!selectedFile ? (
                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-pink transition-colors cursor-pointer bg-gray-50 block">
                                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                <p className="text-gray-500 text-sm">Click to upload image (Pinterest/Instagram reference)</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative border-2 border-brand-pink/30 rounded-lg p-2 bg-brand-rose-50 flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                    {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-1.5 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                                >
                                    {/* Using a text X if Icon not available, but user has lucide-react so it should work if imported. 
                                        Wait, I need to make sure 'X' is imported. It is NOT in the original file imports I saw. 
                                        I should add 'X' to imports or use text.
                                        Let's check imports in my ReplacementContent below. 
                                    */}
                                    <span className="font-bold">✕</span>
                                </button>
                            </div>
                        )}

                    </div>

                    {submitError && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                            {submitError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full flex items-center justify-center gap-2 text-lg disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <span>Sending...</span>
                        ) : (
                            <>
                                <Send size={20} />
                                Send Inquiry
                            </>
                        )}
                    </button>

                </form>
            </motion.div>
        </div>
    );
};

export default CustomOrder;
