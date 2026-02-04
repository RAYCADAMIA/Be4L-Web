import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HUDMenu, Starfield } from '../components/Landing/LandingComponents';
import { ChevronLeft, Send, Sparkles, Heart, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeamPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        passion: '',
        interest: ''
    });

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // In a real app, this would send to an API
    };

    return (
        <div className="relative w-full min-h-screen text-white selection:bg-electric-teal/30 bg-[#05050A]">
            <Starfield />
            <HUDMenu onJoinClick={() => navigate('/login')} isScrolled={scrolled} />

            <main className="relative z-10 pt-32 pb-24 px-6 md:pt-48">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back</span>
                    </motion.button>

                    {/* Hero Header */}
                    <div className="space-y-6 mb-20 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-teal/10 border border-electric-teal/20"
                        >
                            <Sparkles size={14} className="text-electric-teal" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-electric-teal">Join the Vanguard</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] font-display"
                        >
                            BE MORE THAN <br />
                            <span className="animate-liquid-text">A USER.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-2xl text-cool-grey font-medium max-w-2xl font-sans"
                        >
                            We don't want employees. We want <span className="text-white italic">dreamers</span>, <span className="text-white">action-takers</span>, and people who are unapologetically passionate about life.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        {/* Values Section */}
                        <div className="space-y-8">
                            {[
                                { icon: Heart, title: "Passionate", desc: "You care deeply about what you build and the people it affects." },
                                { icon: Zap, title: "Action Driven", desc: "You don't just talk about ideas; you execute them with precision." },
                                { icon: Target, title: "Visionary", desc: "You see the world not for what it is, but for what it could be." }
                            ].map((value, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="p-6 rounded-3xl glass-panel border-white/5 bg-white/[0.01] flex gap-4"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group">
                                        <value.icon size={24} className="text-white/60 group-hover:text-electric-teal transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">{value.title}</h3>
                                        <p className="text-sm text-cool-grey font-medium leading-relaxed">{value.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Application Form */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="glass-panel p-8 md:p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {!submitted ? (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6 relative z-10"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block ml-1">Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Your full name"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-electric-teal/50 transition-all font-medium"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block ml-1">Contact Info</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Email or Phone"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-electric-teal/50 transition-all font-medium"
                                                value={formData.contact}
                                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block ml-1">What is your dream?</label>
                                            <textarea
                                                required
                                                placeholder="Tell us what drives you..."
                                                rows={3}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-electric-teal/50 transition-all font-medium resize-none"
                                                value={formData.passion}
                                                onChange={e => setFormData({ ...formData, passion: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block ml-1">How can you help?</label>
                                            <select
                                                required
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-electric-teal/50 transition-all font-medium accent-deep-black"
                                                value={formData.interest}
                                                onChange={e => setFormData({ ...formData, interest: e.target.value })}
                                            >
                                                <option className="bg-[#111]" value="" disabled>Select your field</option>
                                                <option className="bg-[#111]" value="engineering">Engineering</option>
                                                <option className="bg-[#111]" value="design">Product Design</option>
                                                <option className="bg-[#111]" value="operations">Operations</option>
                                                <option className="bg-[#111]" value="marketing">Brand & Marketing</option>
                                                <option className="bg-[#111]" value="other">Others</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-5 bg-white text-deep-void font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs font-display flex items-center justify-center gap-2 group shadow-xl"
                                        >
                                            <span>Signal Interest</span>
                                            <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12 space-y-6"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-electric-teal/20 border border-electric-teal/30 flex items-center justify-center mx-auto mb-8 animate-pulse">
                                            <Sparkles size={40} className="text-electric-teal" />
                                        </div>
                                        <h3 className="text-2xl font-black font-display uppercase tracking-widest">Signal Received.</h3>
                                        <p className="text-cool-grey font-medium leading-relaxed">
                                            Thank you, {formData.name.split(' ')[0]}. We've added your dream to our radar. If our paths align, you'll hear from us soon.
                                        </p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="px-8 py-3 glass-panel text-white font-bold rounded-full hover:border-white transition-all text-[10px] tracking-widest font-display uppercase"
                                        >
                                            Return to Mission
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Decorative Background for the box */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-teal/5 blur-3xl opacity-50" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl opacity-50" />
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};
