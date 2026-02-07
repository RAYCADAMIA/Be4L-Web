import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Starfield } from '../../components/Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Upload, Check, Loader2, ChevronRight, Briefcase, Store, Music, Utensils, Phone, Mail, Lock } from 'lucide-react';

type Step = 1 | 2 | 3;

export const PartnerApplyPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Partner Application');
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        businessName: '',
        category: 'venue',
        contactNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Storage Upload
            if (!file) throw new Error('File missing');
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `verification/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('partner-docs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const proofUrl = filePath;

            // 2. Auth Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Failed to create user');

            // 3. Database Insert
            const { error: dbError } = await supabase
                .from('operators')
                .insert({
                    user_id: authData.user.id,
                    business_name: formData.businessName,
                    category: formData.category,
                    contact_number: formData.contactNumber,
                    contact_email: formData.email,
                    proof_url: proofUrl,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            // 4. Sign Out Immediately
            await supabase.auth.signOut();

            // 5. Redirect
            navigate('/partner/pending');

        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'An error occurred during submission.');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen text-white selection:bg-electric-teal/30 overflow-x-hidden flex items-center justify-center p-6">
            <Starfield />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full relative z-10"
            >
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-fui text-xs border-2 transition-all ${step >= s ? 'border-electric-teal text-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'border-white/10 text-white/30'}`}>
                                {step > s ? <Check size={18} /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-px transition-all ${step > s ? 'bg-electric-teal' : 'bg-white/10'}`} />}
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
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'venue', icon: Store, label: 'Venue' },
                                                { id: 'event', icon: Music, label: 'Event' },
                                                { id: 'service', icon: Briefcase, label: 'Service' },
                                                { id: 'food', icon: Utensils, label: 'Food' }
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${formData.category === cat.id ? 'bg-electric-teal/10 border-electric-teal text-electric-teal' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                                                >
                                                    <cat.icon size={18} />
                                                    <span className="text-sm font-bold uppercase tracking-tight">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">GCash / Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                            <input
                                                type="text"
                                                value={formData.contactNumber}
                                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                                className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans"
                                                placeholder="09XX XXX XXXX"
                                            />
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
                                    <p className="text-sm text-cool-grey font-sans">Upload business permit or government ID.</p>
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
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-white/10 transition-colors">
                                                    <Upload className="text-white/40" size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Drop permit here</p>
                                                    <p className="text-[10px] text-cool-grey uppercase tracking-widest">PDF, JPG, or PNG preferred</p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
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
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black font-fui uppercase tracking-tighter animate-liquid-text">Create Account</h2>
                                    <p className="text-sm text-cool-grey font-sans">Set up your login details.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans"
                                                placeholder="business@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Create Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-teal/50 transition-all font-sans"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
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
                        {step < 3 ? (
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
    );
};
