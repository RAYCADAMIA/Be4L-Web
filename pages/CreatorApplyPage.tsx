import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Starfield, HUDMenu } from '../components/Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArrowLeft, Send, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface CreatorFormData {
    full_name: string;
    email: string;
    phone: string;
    tiktok_handle: string;
    instagram_handle: string;
    youtube_handle: string;
    follower_count: string;
    content_niche: string;
    city: string;
    why_join: string;
    portfolio_link: string;
}

const NICHE_OPTIONS = [
    'Food & Cafes',
    'Travel & Adventure',
    'Sports & Fitness',
    'Lifestyle & Vlogs',
    'Fashion & Beauty',
    'Music & Events',
    'Tech & Gaming',
    'Education & Study',
    'Comedy & Entertainment',
    'Other'
];

const FOLLOWER_OPTIONS = [
    'Under 1K',
    '1K - 5K',
    '5K - 10K',
    '10K - 50K',
    '50K - 100K',
    '100K+'
];

export const CreatorApplyPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Join Creator Program | Be4L');

    const [form, setForm] = useState<CreatorFormData>({
        full_name: '',
        email: '',
        phone: '',
        tiktok_handle: '',
        instagram_handle: '',
        youtube_handle: '',
        follower_count: '',
        content_niche: '',
        city: '',
        why_join: '',
        portfolio_link: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!form.full_name.trim() || !form.email.trim()) {
            setError('Name and email are required.');
            return;
        }
        if (!form.tiktok_handle.trim() && !form.instagram_handle.trim() && !form.youtube_handle.trim()) {
            setError('Please provide at least one social media handle.');
            return;
        }

        setSubmitting(true);
        try {
            const { error: dbError } = await supabase
                .from('creator_applications')
                .insert([{
                    full_name: form.full_name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim() || null,
                    tiktok_handle: form.tiktok_handle.trim() || null,
                    instagram_handle: form.instagram_handle.trim() || null,
                    youtube_handle: form.youtube_handle.trim() || null,
                    follower_count: form.follower_count || null,
                    content_niche: form.content_niche || null,
                    city: form.city.trim() || null,
                    why_join: form.why_join.trim() || null,
                    portfolio_link: form.portfolio_link.trim() || null
                }]);

            if (dbError) throw dbError;

            // Notify Admin
            const ADMIN_ID = 'b05bfd15-2593-4506-87c1-53f186c530fb';
            await supabase.from('notifications').insert({
                user_id: ADMIN_ID,
                type: 'CREATOR_APPLICATION',
                title: 'New Creator Application',
                content: `${form.full_name.trim()} has applied for the Creator Program.`,
                metadata: {
                    full_name: form.full_name.trim(),
                    niche: form.content_niche
                }
            });

            setSubmitted(true);
        } catch (err: any) {
            console.error('Creator application error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-purple-400/50 focus:bg-white/[0.05] transition-all";
    const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2 block";

    // Success State
    if (submitted) {
        return (
            <div className="relative min-h-screen text-white overflow-x-hidden bg-deep-black flex items-center justify-center">
                <Starfield />
                <HUDMenu onJoinClick={() => navigate('/')} isScrolled={true} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center space-y-8 max-w-lg mx-auto px-6"
                >
                    <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                        <CheckCircle size={48} className="text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black font-fui tracking-tighter uppercase brand-text-dusk">
                        You're In.
                    </h1>
                    <p className="text-lg text-cool-grey font-medium font-sans">
                        We've received your application. Our team will review your profile and reach out via email within <span className="text-white font-bold">48 hours</span>.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all text-sm tracking-widest uppercase font-display"
                    >
                        Back to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen text-white selection:bg-purple-400/30 overflow-x-hidden bg-deep-black">
            <Starfield />
            <HUDMenu onJoinClick={() => navigate('/')} isScrolled={true} />

            <main className="relative z-10 pt-32 pb-32 px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/Careers/Creator-Program')}
                        className="flex items-center gap-2 text-cool-grey hover:text-white transition-colors mb-12 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to Creator Program</span>
                    </button>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 mb-16"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            CREATOR APPLICATION
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black font-fui brand-text-dusk tracking-tighter uppercase leading-[0.9]">
                            JOIN THE<br />
                            <span className="text-white">CREATOR PROGRAM</span>
                        </h1>
                        <p className="text-base text-cool-grey font-medium font-sans max-w-lg">
                            Fill out the form below and we'll get back to you within 48 hours. All follower counts welcome — we value authenticity over numbers.
                        </p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onSubmit={handleSubmit}
                        className="space-y-8"
                    >
                        {/* Personal Info */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/10" />
                                Personal Info
                                <div className="h-px flex-1 bg-white/10" />
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Full Name *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        placeholder="Juan Dela Cruz"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@email.com"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+63 9XX XXX XXXX"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>City / Location</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Davao City"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/10" />
                                Social Media Handles
                                <div className="h-px flex-1 bg-white/10" />
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>TikTok</label>
                                    <input
                                        type="text"
                                        name="tiktok_handle"
                                        value={form.tiktok_handle}
                                        onChange={handleChange}
                                        placeholder="@yourhandle"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Instagram</label>
                                    <input
                                        type="text"
                                        name="instagram_handle"
                                        value={form.instagram_handle}
                                        onChange={handleChange}
                                        placeholder="@yourhandle"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>YouTube</label>
                                    <input
                                        type="text"
                                        name="youtube_handle"
                                        value={form.youtube_handle}
                                        onChange={handleChange}
                                        placeholder="@yourchannel"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-white/30 font-medium">* At least one social handle is required</p>
                        </div>

                        {/* Creator Profile */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/10" />
                                Creator Profile
                                <div className="h-px flex-1 bg-white/10" />
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Follower Count (Largest Platform)</label>
                                    <select
                                        name="follower_count"
                                        value={form.follower_count}
                                        onChange={handleChange}
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        <option value="" className="bg-[#111]">Select range</option>
                                        {FOLLOWER_OPTIONS.map(opt => (
                                            <option key={opt} value={opt} className="bg-[#111]">{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Content Niche</label>
                                    <select
                                        name="content_niche"
                                        value={form.content_niche}
                                        onChange={handleChange}
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        <option value="" className="bg-[#111]">Select niche</option>
                                        {NICHE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt} className="bg-[#111]">{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Portfolio / Sample Content Link</label>
                                <input
                                    type="url"
                                    name="portfolio_link"
                                    value={form.portfolio_link}
                                    onChange={handleChange}
                                    placeholder="https://tiktok.com/@you/video/..."
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Why do you want to join the Be4L Creator Program?</label>
                                <textarea
                                    name="why_join"
                                    value={form.why_join}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself, your content style, and what excites you about Be4L..."
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg uppercase tracking-widest font-fui flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(168,85,247,0.3)] hover:shadow-[0_30px_60px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Application
                                </>
                            )}
                        </motion.button>

                        <p className="text-center text-[10px] text-white/30 font-medium">
                            By submitting, you agree to Be4L's Terms of Service and Privacy Policy.
                        </p>
                    </motion.form>

                </div>
            </main>
        </div>
    );
};

export default CreatorApplyPage;
