import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Starfield } from '../../components/Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Upload, Check, Loader2, ChevronRight, Briefcase, Store, Music, Utensils, Phone, Mail, Lock, Zap, Instagram, Globe, Palmtree, Bed, Wine, Dumbbell, ShoppingBag, Users, Coffee, Trophy } from 'lucide-react';

type Step = 1 | 2;

export const PartnerApplyPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Partner Application');
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        businessName: '',
        category: 'courts',
        customCategory: '',
        contactNumber: '',
        email: '',
        socialHandle: '',
        website: ''
    });

    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.businessName || !formData.contactNumber) {
                setError('Please fill in all identity fields.');
                return;
            }
        } else if (step === 2) {
            if (!file) {
                setError('Please upload proof of identity/business.');
                return;
            }
        }
        setError(null);
        setStep((prev) => (prev + 1) as Step);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Storage Upload
            let proofUrl = '';
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `verification/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('partner-docs')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;
                proofUrl = filePath;
            }

            // 2. Get current user if exists
            const { data: { user } } = await supabase.auth.getUser();

            // 3. Database Insert
            const { error: dbError } = await supabase
                .from('operators')
                .insert({
                    user_id: user?.id || null, // Allow application without being logged in
                    business_name: formData.businessName,
                    slug: formData.businessName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    category: formData.category === 'other' ? formData.customCategory : formData.category,
                    contact_number: formData.contactNumber,
                    contact_email: formData.email,
                    social_handle: formData.socialHandle,
                    website: formData.website,
                    proof_url: proofUrl,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            // 4. Redirect
            navigate('/partner/pending');

        } catch (err: any) {
            console.error('Full submission error:', err);
            const errorMessage = err.message || JSON.stringify(err);
            setError(`Submission failed: ${errorMessage}`);
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen text-white selection:bg-electric-teal/30 overflow-x-hidden flex items-center justify-center p-6">
            <Starfield />

            <div className="max-w-6xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: How it works */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-12 py-10"
                >
                    <div className="space-y-6">
                        <span className="text-[10px] font-black text-electric-teal uppercase tracking-[0.5em]">
                            PARTNER ONBOARDING
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black font-fui uppercase tracking-tighter leading-[0.85] text-white">
                            BRAND <br />
                            <span className="text-gradient-static">ACCESS.</span>
                        </h1>
                        <p className="text-lg text-cool-grey font-medium max-w-md">
                            Follow these steps to transition from a regular user to a verified brand on the Be4L mission.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                icon: Check,
                                color: 'text-electric-teal',
                                bg: 'bg-electric-teal/10',
                                border: 'border-electric-teal/20',
                                title: '1. APPLY FOR VERIFICATION',
                                desc: 'Submit your business details through the form. We verify every brand to ensure high-quality community standards.'
                            },
                            {
                                icon: Mail,
                                color: 'text-purple-400',
                                bg: 'bg-purple-500/10',
                                border: 'border-purple-500/20',
                                title: '2. RECEIVE ACCESS CODE',
                                desc: "Upon approval, we'll send your unique Brand Access Code and credentials directly to your respective email."
                            },
                            {
                                icon: Zap,
                                color: 'text-blue-400',
                                bg: 'bg-blue-500/10',
                                border: 'border-blue-500/20',
                                title: '3. SWITCH ACCOUNT',
                                desc: 'Log in with your regular account, enter the access code in settings, and unlock full brand/operator capabilities instantly.'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex gap-5 p-6 rounded-[2rem] glass-panel border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 border ${item.border}`}>
                                    <item.icon className={item.color} size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{item.title}</h3>
                                    <p className="text-xs text-cool-grey font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: The Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full relative"
                >
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-fui text-xs border-2 transition-all ${step >= s ? 'border-electric-teal text-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'border-white/10 text-white/30'}`}>
                                    {step > s ? <Check size={18} /> : s}
                                </div>
                                {s < 2 && <div className={`w-12 h-px transition-all ${step > s ? 'bg-electric-teal' : 'bg-white/10'}`} />}
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-2xl space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black font-fui uppercase tracking-tighter animate-liquid-text">Business Profile</h2>
                                        <p className="text-sm text-cool-grey font-sans">Enter your business information.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Business Name</label>
                                            <input
                                                type="text"
                                                value={formData.businessName}
                                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans"
                                                placeholder="Enter registered business name"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Category</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                {[
                                                    { id: 'courts', icon: Store, label: 'Courts' },
                                                    { id: 'events', icon: Music, label: 'Events' },
                                                    { id: 'competition', icon: Trophy, label: 'Compete' },
                                                    { id: 'services', icon: Briefcase, label: 'Services' },
                                                    { id: 'resto', icon: Utensils, label: 'Resto' },
                                                    { id: 'cafe', icon: Coffee, label: 'Cafe' },
                                                    { id: 'vacation', icon: Palmtree, label: 'Vacation' },
                                                    { id: 'hotels', icon: Bed, label: 'Hotels' },
                                                    { id: 'other', icon: Zap, label: 'Other' }
                                                ].map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                                        className={`py-2 px-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${formData.category === cat.id ? 'bg-electric-teal/10 border-electric-teal text-electric-teal' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                                                    >
                                                        <cat.icon size={14} />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <AnimatePresence>
                                                {formData.category === 'other' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pt-3"
                                                    >
                                                        <input
                                                            type="text"
                                                            value={formData.customCategory}
                                                            onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                                            placeholder="Specify your category..."
                                                            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans text-sm"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Contact Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.contactNumber}
                                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans text-sm"
                                                        placeholder="09XX XXX XXXX"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Instagram/FB Handle</label>
                                                <div className="relative">
                                                    <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.socialHandle}
                                                        onChange={(e) => setFormData({ ...formData, socialHandle: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans text-sm"
                                                        placeholder="@yourbrand"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans text-sm"
                                                        placeholder="brand@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Website (Optional)</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans text-sm"
                                                        placeholder="www.brand.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black font-fui uppercase tracking-tighter animate-liquid-text">Verification</h2>
                                        <p className="text-sm text-cool-grey font-sans">Upload business permit, official ID, or org document.</p>
                                    </div>

                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                                        }}
                                        className={`relative group h-64 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${file ? 'border-electric-teal/50 bg-electric-teal/5' : 'border-white/10 hover:border-white/30 bg-white/[0.02]'}`}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) setFile(e.target.files[0]);
                                            }}
                                        />
                                        <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-8 text-center">
                                            {file ? (
                                                <div className="space-y-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-electric-teal/20 flex items-center justify-center mx-auto">
                                                        <Check className="text-electric-teal" size={32} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{file.name}</p>
                                                        <p className="text-[10px] text-cool-grey uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setFile(null);
                                                        }}
                                                        className="mt-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest text-white/70 transition-all border border-white/10"
                                                    >
                                                        Change File
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-white/10 transition-colors">
                                                        <Upload className="text-white/40" size={32} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-white uppercase tracking-tight">Drop Identity here</p>
                                                        <p className="text-[10px] text-cool-grey uppercase tracking-widest">Business Permit, Sole Prop, or Gov ID</p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="pt-4 flex flex-col gap-3">
                            {step < 2 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="w-full py-5 rounded-2xl bg-white text-black font-black font-fui tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all uppercase text-sm flex items-center justify-center gap-2"
                                >
                                    CONTINUE
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-white text-black font-black font-fui tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(45,212,191,0.2)]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            SUBMITTING...
                                        </>
                                    ) : (
                                        'SUBMIT APPLICATION'
                                    )}
                                </button>
                            )}

                            {step > 1 && (
                                <button
                                    onClick={() => setStep((prev) => (prev - 1) as Step)}
                                    disabled={loading}
                                    className="w-full py-3 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    GO BACK
                                </button>
                            )
                            }
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
