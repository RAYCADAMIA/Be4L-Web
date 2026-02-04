import React from 'react';
import { motion } from 'framer-motion';
import { Starfield } from '../../components/Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const PartnerPendingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen text-white selection:bg-electric-teal/30 overflow-x-hidden flex items-center justify-center p-6">
            <Starfield />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl w-full glass-panel p-10 md:p-16 rounded-[4rem] text-center space-y-8 border-white/5 shadow-2xl relative z-10"
            >
                <div className="w-24 h-24 rounded-full bg-electric-teal/10 flex items-center justify-center mx-auto mb-10 border border-electric-teal/20 shadow-[0_0_50px_rgba(45,212,191,0.1)]">
                    <Lock className="text-electric-teal" size={48} strokeWidth={2.5} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black font-fui text-white tracking-tighter uppercase leading-tight">
                        SUBMISSION RECEIVED. <br />
                        <span className="animate-liquid-text">APPLICATION UNDER REVIEW.</span>
                    </h1>
                    <p className="text-lg text-cool-grey font-medium font-sans max-w-sm mx-auto">
                        Your profile is securely stored. You will be notified via email once an Admin verifies your credentials.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black font-fui tracking-widest hover:bg-white/10 transition-all uppercase text-sm"
                >
                    RETURN TO HOME
                </button>
            </motion.div>
        </div>
    );
};
