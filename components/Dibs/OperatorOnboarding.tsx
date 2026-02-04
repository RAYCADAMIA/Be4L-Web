import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Store, CreditCard, ChevronRight,
    ArrowLeft, CheckCircle, Smartphone
} from 'lucide-react';
import { EKGLoader } from '../ui/AestheticComponents';

interface Props {
    onComplete: () => void;
    onCancel: () => void;
}

const OperatorOnboarding: React.FC<Props> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        category: 'venue',
        bio: '',
        gcash_name: '',
        gcash_number: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => step > 1 ? setStep(s => s - 1) : onCancel();

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 2000));
        setLoading(false);
        setStep(4);
    };

    return (
        <div className="flex-1 h-full bg-deep-void flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
            {/* Nav */}
            <div className="flex justify-between items-center mb-10">
                <button onClick={handleBack} className="p-2.5 bg-white/5 rounded-full text-gray-500">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all ${step >= i ? 'w-6 bg-electric-teal' : 'w-2 bg-white/10'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right w-full">
                        <div className="text-center">
                            <Store size={48} className="text-electric-teal mx-auto mb-6" />
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">Build Your Shop</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">The Basics</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Business Name</label>
                                <input
                                    value={formData.business_name}
                                    onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                                    placeholder="e.g. Downtown Pickleball"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-electric-teal/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none appearance-none"
                                >
                                    <option value="venue">Venue / Space</option>
                                    <option value="event">Events / Parties</option>
                                    <option value="service">Personal Services</option>
                                    <option value="food">Food & Drinks</option>
                                </select>
                            </div>
                        </div>

                        <button
                            disabled={!formData.business_name}
                            onClick={handleNext}
                            className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all ${formData.business_name ? 'bg-white text-black shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'bg-white/5 text-gray-700'}`}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right w-full">
                        <div className="text-center">
                            <Smartphone size={48} className="text-electric-teal mx-auto mb-6" />
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">Short Bio</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tell your story</p>
                        </div>

                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Describe what you offer in 2 sentences..."
                            className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-white font-medium outline-none focus:border-electric-teal/50 transition-all resize-none"
                        />

                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right w-full">
                        <div className="text-center">
                            <CreditCard size={48} className="text-electric-teal mx-auto mb-6" />
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">Payment Info</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Direct GCash Transfers</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">GCash Account Name</label>
                                <input
                                    value={formData.gcash_name}
                                    onChange={e => setFormData({ ...formData, gcash_name: e.target.value })}
                                    placeholder="Full Name"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">GCash Number</label>
                                <input
                                    value={formData.gcash_number}
                                    onChange={e => setFormData({ ...formData, gcash_number: e.target.value })}
                                    placeholder="0917-000-0000"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white font-black tracking-widest outline-none"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading || !formData.gcash_number}
                            onClick={handleSubmit}
                            className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? <EKGLoader size={20} showLabel={false} className="gap-0" color="#000" /> : 'Launch Business'}
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center space-y-8 animate-in zoom-in w-full">
                        <div className="w-24 h-24 bg-electric-teal/10 rounded-full flex items-center justify-center mx-auto border-2 border-electric-teal/20 shadow-[0_0_40px_rgba(45,212,191,0.2)]">
                            <CheckCircle size={48} className="text-electric-teal" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">You're Live!</h2>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-[240px] mx-auto font-bold tracking-wider">Your shop is now discoverable in the Be4L Marketplace.</p>
                        </div>

                        <button
                            onClick={onComplete}
                            className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl"
                        >
                            Open Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatorOnboarding;
