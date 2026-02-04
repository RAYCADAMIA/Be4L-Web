import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, ChevronRight, ArrowLeft,
    CheckCircle, Mail, Phone, Globe
} from 'lucide-react';

export const PartnerApplyForm: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        category: 'venue',
        description: '',
        contact_email: '',
        contact_phone: '',
        website: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 2000));
        setLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-electric-teal/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-electric-teal/20">
                    <CheckCircle className="text-electric-teal w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Application Received!</h2>
                <p className="text-gray-400 max-w-xs mx-auto mb-10">
                    Our team will review your application and get back to you via email within 48 hours.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Progress */}
            <div className="flex gap-2 mb-12 justify-center">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-white' : 'w-4 bg-white/10'}`}
                    />
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <Store className="w-12 h-12 text-white mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold">Tell us about you</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Business or Organization Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.business_name}
                                        onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                                        placeholder="e.g. Skyline Events"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:border-white/30 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Partnership Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="venue">Venue / Hospitality</option>
                                        <option value="events">Event Organizer</option>
                                        <option value="brand">Brand Partner</option>
                                        <option value="creator">Content Creator</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={!formData.business_name}
                                onClick={handleNext}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-30"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold">What's your vision?</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-[0.2em] text-gray-500 ml-1">Describe your goal with Be4L</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Tell us why you want to partner and what kind of experiences you want to create..."
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder-white/20 focus:border-white/30 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="p-5 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    type="button"
                                    disabled={!formData.description}
                                    onClick={handleNext}
                                    className="flex-1 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-30"
                                >
                                    Next Step <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold">Contact Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.contact_email}
                                                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={formData.contact_phone}
                                                onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Website (Optional)</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="p-5 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.contact_email}
                                    className="flex-1 py-5 bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-30"
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
};

export default PartnerApplyForm;
